import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const CORRECT_USERNAME = 'spiridonovka22'
const CORRECT_PASSWORD = 'Spiridonovka22'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
      // Создаем простой токен (в продакшене лучше использовать JWT)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
      
      // Устанавливаем cookie с токеном
      const cookieStore = await cookies()
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 дней
        path: '/',
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

