import { NextResponse } from 'next/server'
import { db, type Player } from '@/lib/db'

export async function GET() {
  try {
    const players = db.prepare('SELECT * FROM players').all() as Player[]

    const stats = players.map((player) => {
      // Get total buy-ins
      const buyInsResult = db.prepare(`
        SELECT SUM(amount) as total FROM buy_ins WHERE playerId = ?
      `).get(player.id) as { total: number | null }
      const totalBuyIns = buyInsResult.total || 0

      // Get total cash-outs
      const cashOutsResult = db.prepare(`
        SELECT SUM(amount) as total FROM cash_outs WHERE playerId = ?
      `).get(player.id) as { total: number | null }
      const totalCashOuts = cashOutsResult.total || 0

      const profit = totalCashOuts - totalBuyIns

      // Get sessions count
      const sessionsResult = db.prepare(`
        SELECT COUNT(DISTINCT sessionId) as count FROM session_players WHERE playerId = ?
      `).get(player.id) as { count: number }
      const sessionsCount = sessionsResult.count || 0

      // Get session stats - правильный расчет для каждой сессии отдельно
      const sessionStats = db.prepare(`
        SELECT DISTINCT s.id as sessionId, s.date
        FROM session_players sp
        JOIN sessions s ON sp.sessionId = s.id
        WHERE sp.playerId = ?
        ORDER BY s.date DESC
      `).all(player.id) as Array<{
        sessionId: string
        date: string
      }>

      // Для каждой сессии считаем прибыль отдельно
      const sessionStatsWithProfit = sessionStats.map(session => {
        const buyInsResult = db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as total 
          FROM buy_ins 
          WHERE sessionId = ? AND playerId = ?
        `).get(session.sessionId, player.id) as { total: number }
        const buyIns = buyInsResult.total || 0

        const cashOutsResult = db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as total 
          FROM cash_outs 
          WHERE sessionId = ? AND playerId = ?
        `).get(session.sessionId, player.id) as { total: number }
        const cashOuts = cashOutsResult.total || 0

        return {
          sessionId: session.sessionId,
          date: session.date,
          profit: cashOuts - buyIns,
          buyIns,
          cashOuts,
        }
      })

      const winningSessions = sessionStatsWithProfit.filter((s) => s.profit > 0).length
      const losingSessions = sessionStatsWithProfit.filter((s) => s.profit < 0).length
      const breakevenSessions = sessionStatsWithProfit.filter((s) => s.profit === 0).length

      // Винрейт = процент сессий с положительной прибылью
      const winRate = sessionsCount > 0 ? (winningSessions / sessionsCount) * 100 : 0

      return {
        player: {
          id: player.id,
          name: player.name,
          nickname: player.nickname,
        },
        totalBuyIns,
        totalCashOuts,
        profit,
        sessionsCount,
        winningSessions,
        losingSessions,
        breakevenSessions,
        winRate,
        sessionStats: sessionStatsWithProfit,
      }
    })

    // Sort by profit (descending)
    stats.sort((a, b) => b.profit - a.profit)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
