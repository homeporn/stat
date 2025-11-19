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

      // Get session stats
      const sessionStats = db.prepare(`
        SELECT 
          s.id as sessionId,
          s.date,
          COALESCE(SUM(co.amount), 0) - COALESCE(SUM(bi.amount), 0) as profit
        FROM session_players sp
        JOIN sessions s ON sp.sessionId = s.id
        LEFT JOIN buy_ins bi ON bi.sessionId = s.id AND bi.playerId = ?
        LEFT JOIN cash_outs co ON co.sessionId = s.id AND co.playerId = ?
        WHERE sp.playerId = ?
        GROUP BY s.id, s.date
      `).all(player.id, player.id, player.id) as Array<{
        sessionId: string
        date: string
        profit: number
      }>

      const winningSessions = sessionStats.filter((s) => s.profit > 0).length
      const losingSessions = sessionStats.filter((s) => s.profit < 0).length
      const breakevenSessions = sessionStats.filter((s) => s.profit === 0).length

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
        winRate: sessionsCount > 0 ? (winningSessions / sessionsCount) * 100 : 0,
        sessionStats,
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
