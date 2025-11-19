import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type PlayerWithRelations = {
  id: string
  name: string
  nickname: string | null
  buyIns: {
    amount: number
    sessionId: string
    session: { date: Date }
  }[]
  cashOuts: {
    amount: number
    sessionId: string
    session: { date: Date }
  }[]
  sessions: {
    sessionId: string
    session: { date: Date }
  }[]
}

type SessionStat = {
  sessionId: string
  date: Date
  profit: number
}

type PlayerStatSummary = {
  player: {
    id: string
    name: string
    nickname: string | null
  }
  totalBuyIns: number
  totalCashOuts: number
  profit: number
  sessionsCount: number
  winningSessions: number
  losingSessions: number
  breakevenSessions: number
  winRate: number
  sessionStats: SessionStat[]
}

export async function GET() {
  try {
    const players = (await prisma.player.findMany({
      include: {
        buyIns: {
          include: {
            session: true,
          },
        },
        cashOuts: {
          include: {
            session: true,
          },
        },
        sessions: {
          include: {
            session: true,
          },
        },
      },
    })) as PlayerWithRelations[]

    const stats: PlayerStatSummary[] = players.map((player) => {
      const totalBuyIns = player.buyIns.reduce((sum, bi) => sum + bi.amount, 0)
      const totalCashOuts = player.cashOuts.reduce(
        (sum, co) => sum + co.amount,
        0
      )
      const profit = totalCashOuts - totalBuyIns
      const sessionsCount = player.sessions.length

      // Статистика по сессиям
      const sessionStats: SessionStat[] = player.sessions.map((sp) => {
        const sessionBuyIns = player.buyIns
          .filter((bi) => bi.sessionId === sp.sessionId)
          .reduce((sum, bi) => sum + bi.amount, 0)
        const sessionCashOuts = player.cashOuts
          .filter((co) => co.sessionId === sp.sessionId)
          .reduce((sum, co) => sum + co.amount, 0)
        return {
          sessionId: sp.sessionId,
          date: sp.session.date,
          profit: sessionCashOuts - sessionBuyIns,
        }
      })

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

    // Сортируем по прибыли (от большего к меньшему)
    stats.sort((a, b) => b.profit - a.profit)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

