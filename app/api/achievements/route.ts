import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Игрок, который больше всех вывел денег (cash-outs)
    const topCashOutPlayer = db.prepare(`
      SELECT 
        p.id,
        p.name,
        COALESCE(SUM(co.amount), 0) as totalCashOuts
      FROM players p
      LEFT JOIN cash_outs co ON p.id = co.playerId
      GROUP BY p.id
      ORDER BY totalCashOuts DESC
      LIMIT 1
    `).get() as { id: string; name: string; totalCashOuts: number } | undefined

    // Игрок, который больше всех докупался/внес денег (buy-ins)
    const topBuyInPlayer = db.prepare(`
      SELECT 
        p.id,
        p.name,
        COALESCE(SUM(bi.amount), 0) as totalBuyIns
      FROM players p
      LEFT JOIN buy_ins bi ON p.id = bi.playerId
      GROUP BY p.id
      ORDER BY totalBuyIns DESC
      LIMIT 1
    `).get() as { id: string; name: string; totalBuyIns: number } | undefined

    // Игрок с ачивкой "самая крутая комбинация вечера" (ручная ачивка)
    const bestComboPlayer = db.prepare(`
      SELECT 
        id,
        name
      FROM players
      WHERE hasBestCombo = 1
      LIMIT 1
    `).get() as { id: string; name: string } | undefined

    return NextResponse.json({
      topCashOutPlayer: topCashOutPlayer || null,
      topBuyInPlayer: topBuyInPlayer || null,
      bestComboPlayer: bestComboPlayer || null,
    })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

