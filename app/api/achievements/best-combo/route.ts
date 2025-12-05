import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId } = body

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли игрок
    const player = db.prepare('SELECT id FROM players WHERE id = ?').get(playerId) as { id: string } | undefined
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Сначала снимаем ачивку у всех игроков (так как ачивка может быть только у одного)
    db.prepare('UPDATE players SET hasBestCombo = 0').run()

    // Устанавливаем ачивку выбранному игроку
    db.prepare('UPDATE players SET hasBestCombo = 1 WHERE id = ?').run(playerId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting best combo achievement:', error)
    return NextResponse.json(
      { error: 'Failed to set best combo achievement', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    // Снимаем ачивку у указанного игрока
    db.prepare('UPDATE players SET hasBestCombo = 0 WHERE id = ?').run(playerId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing best combo achievement:', error)
    return NextResponse.json(
      { error: 'Failed to remove best combo achievement', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

