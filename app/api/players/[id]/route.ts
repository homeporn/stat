import { NextRequest, NextResponse } from 'next/server'
import { db, type Player } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(id) as Player | undefined

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Get sessions for this player
    const sessions = db.prepare(`
      SELECT sp.*, s.* 
      FROM session_players sp
      JOIN sessions s ON sp.sessionId = s.id
      WHERE sp.playerId = ?
    `).all(id)

    return NextResponse.json({ ...player, sessions })
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, nickname } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    db.prepare(`
      UPDATE players 
      SET name = ?, nickname = ?, updatedAt = ?
      WHERE id = ?
    `).run(name.trim(), nickname?.trim() || null, now, id)

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(id) as Player

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json(
      { error: 'Failed to update player', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    db.prepare('DELETE FROM players WHERE id = ?').run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json(
      { error: 'Failed to delete player', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
