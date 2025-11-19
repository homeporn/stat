import { NextResponse } from 'next/server'
import { db, type Player } from '@/lib/db'

export async function GET() {
  try {
    // Получаем все сессии с датами
    const sessions = db.prepare(`
      SELECT id, date, description
      FROM sessions
      ORDER BY date DESC
    `).all() as Array<{
      id: string
      date: string
      description: string | null
    }>

    // Получаем всех игроков
    const players = db.prepare('SELECT * FROM players ORDER BY name ASC').all() as Player[]

    // Для каждой сессии считаем банкролл каждого игрока
    const gamesData = sessions.map(session => {
      const playersBankroll = players.map(player => {
        const buyInsResult = db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as total 
          FROM buy_ins 
          WHERE sessionId = ? AND playerId = ?
        `).get(session.id, player.id) as { total: number }
        const buyIns = buyInsResult.total || 0

        const cashOutsResult = db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as total 
          FROM cash_outs 
          WHERE sessionId = ? AND playerId = ?
        `).get(session.id, player.id) as { total: number }
        const cashOuts = cashOutsResult.total || 0

        const bankroll = cashOuts - buyIns

        return {
          playerId: player.id,
          playerName: player.name,
          playerNickname: player.nickname,
          buyIns,
          cashOuts,
          bankroll,
        }
      })

      return {
        sessionId: session.id,
        date: session.date,
        description: session.description,
        players: playersBankroll,
      }
    })

    return NextResponse.json(gamesData)
  } catch (error) {
    console.error('Error fetching games stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

