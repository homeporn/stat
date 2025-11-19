import { NextRequest, NextResponse } from 'next/server'
import { db, generateId, type Player } from '@/lib/db'

export async function GET() {
  try {
    const players = db.prepare(`
      SELECT * FROM players 
      ORDER BY name ASC
    `).all() as Player[]
    
    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to fetch players', 
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, nickname } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const id = generateId()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO players (id, name, nickname, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name.trim(), nickname?.trim() || null, now, now)

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(id) as Player

    return NextResponse.json(player, { status: 201 })
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { error: 'Failed to create player', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
