import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    db.prepare('DELETE FROM cash_outs WHERE id = ?').run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cash-out:', error)
    return NextResponse.json(
      { error: 'Failed to delete cash-out', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
