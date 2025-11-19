import Database from 'better-sqlite3'
import { nanoid } from 'nanoid'

const DEFAULT_DB_PATH = './dev.db'

const globalForDb = globalThis as unknown as {
  db: Database.Database | undefined
}

const dbPath = process.env.DATABASE_URL?.replace('file:', '') ?? DEFAULT_DB_PATH

function createDatabase() {
  const db = new Database(dbPath)
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON')
  
  // Initialize schema if tables don't exist
  initSchema(db)
  
  return db
}

function initSchema(db: Database.Database) {
  // Check if tables exist
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name IN ('players', 'sessions', 'session_players', 'buy_ins', 'cash_outs')
  `).all() as Array<{ name: string }>
  
  if (tables.length === 0) {
    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        nickname TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL DEFAULT (datetime('now')),
        description TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS session_players (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        playerId TEXT NOT NULL,
        FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE,
        UNIQUE(sessionId, playerId)
      );

      CREATE TABLE IF NOT EXISTS buy_ins (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        playerId TEXT NOT NULL,
        amount REAL NOT NULL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS cash_outs (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        playerId TEXT NOT NULL,
        amount REAL NOT NULL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE
      );
    `)
  }
}

export const db = globalForDb.db ?? createDatabase()

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db
}

// Helper function to generate IDs
export function generateId(): string {
  return nanoid()
}

// Type definitions
export interface Player {
  id: string
  name: string
  nickname: string | null
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  date: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface SessionPlayer {
  id: string
  sessionId: string
  playerId: string
}

export interface BuyIn {
  id: string
  sessionId: string
  playerId: string
  amount: number
  createdAt: string
}

export interface CashOut {
  id: string
  sessionId: string
  playerId: string
  amount: number
  createdAt: string
}

