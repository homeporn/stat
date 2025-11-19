import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    db.prepare('DELETE FROM buy_ins WHERE id = ?').run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting buy-in:', error)
    return NextResponse.json(
      { error: 'Failed to delete buy-in', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
