'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaCorrectAnswer, setCaptchaCorrectAnswer] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Генерация капчи при загрузке страницы
  useEffect(() => {
    generateCaptcha()
  }, [])

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    const operation = Math.random() > 0.5 ? '+' : '-'
    let answer = 0
    let question = ''

    if (operation === '+') {
      answer = num1 + num2
      question = `${num1} + ${num2} = ?`
    } else {
      // Убеждаемся, что результат не отрицательный
      const maxNum = Math.max(num1, num2)
      const minNum = Math.min(num1, num2)
      answer = maxNum - minNum
      question = `${maxNum} - ${minNum} = ?`
    }

    setCaptchaQuestion(question)
    setCaptchaCorrectAnswer(answer)
    setCaptchaAnswer('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Проверка капчи
    const userAnswer = parseInt(captchaAnswer)
    if (isNaN(userAnswer) || userAnswer !== captchaCorrectAnswer) {
      setError('Неверный ответ на капчу')
      generateCaptcha()
      return
    }

    // Проверка логина и пароля
    if (username !== 'spiridonovka22' || password !== 'Spiridonovka22') {
      setError('Неверный логин или пароль')
      generateCaptcha()
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Перенаправление на запрошенную страницу или главную
        const redirect = searchParams.get('redirect') || '/'
        router.push(redirect)
        router.refresh()
      } else {
        setError(data.error || 'Ошибка авторизации')
        generateCaptcha()
      }
    } catch (err) {
      setError('Ошибка соединения с сервером')
      generateCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-4">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={48}
              height={48}
              className="mr-3"
            />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Вход в систему
            </h2>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Капча - показывается перед полями логина и пароля */}
          <div className="space-y-2">
            <label
              htmlFor="captcha"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Капча: {captchaQuestion}
            </label>
            <input
              id="captcha"
              type="text"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Введите ответ"
              required
              autoComplete="off"
            />
            <button
              type="button"
              onClick={generateCaptcha}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
            >
              Обновить капчу
            </button>
          </div>

          {/* Логин */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Логин
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Введите логин"
              required
              autoComplete="username"
            />
          </div>

          {/* Пароль */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Пароль
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                placeholder="Введите пароль"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

