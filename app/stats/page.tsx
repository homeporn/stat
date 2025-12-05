'use client'

import { useEffect, useState } from 'react'
import { safeJsonFetch } from '@/lib/api'
import { BackButton } from '@/components/BackButton'

// Компонент для отображения одной лампочки
function StatusLight({ type }: { type: 'W' | 'L' | 'N' }) {
  const config = {
    W: { bg: 'bg-green-600', text: 'В' },
    L: { bg: 'bg-red-600', text: 'П' },
    N: { bg: 'bg-orange-500', text: 'Н' },
  }

  const { bg, text } = config[type]

  return (
    <div
      className={`${bg} text-white rounded flex items-center justify-center font-semibold text-sm`}
      style={{
        width: '28px',
        height: '28px',
      }}
    >
      {text}
    </div>
  )
}

interface Player {
  id: string
  name: string
  nickname: string | null
  emoji: string | null
}

interface Stat {
  player: Player
  totalBuyIns: number
  totalCashOuts: number
  profit: number
  sessionsCount: number
  winningSessions: number
  losingSessions: number
  breakevenSessions: number
  winRate: number
  sessionStats: Array<{
    sessionId: string
    date: string
    profit: number
  }>
}

interface Achievements {
  topCashOutPlayer: { id: string; name: string; totalCashOuts: number } | null
  topBuyInPlayer: { id: string; name: string; totalBuyIns: number } | null
  bestComboPlayer: { id: string; name: string } | null
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stat[]>([])
  const [achievements, setAchievements] = useState<Achievements>({ topCashOutPlayer: null, topBuyInPlayer: null, bestComboPlayer: null })
  const [loading, setLoading] = useState(true)
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
    fetchAchievements()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await safeJsonFetch<Stat[]>('/api/stats')
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAchievements = async () => {
    try {
      const data = await safeJsonFetch<Achievements>('/api/achievements')
      setAchievements(data)
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    }
  }

  const getPlayerAchievements = (playerId: string) => {
    const achievementsList: string[] = []
    if (achievements.topCashOutPlayer?.id === playerId) {
      achievementsList.push('💰 Больше всех вывел денег')
    }
    if (achievements.topBuyInPlayer?.id === playerId) {
      achievementsList.push('💵 Больше всех докупался')
    }
    if (achievements.bestComboPlayer?.id === playerId) {
      achievementsList.push('🎴 Самая крутая комбинация вечера')
    }
    return achievementsList
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 text-gray-900 dark:text-gray-100">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-4">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Статистика по игрокам</h1>

      {stats.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">Нет данных для отображения статистики</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stats.map((stat) => (
            <div
              key={stat.player.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() =>
                  setExpandedPlayer(expandedPlayer === stat.player.id ? null : stat.player.id)
                }
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      <span className="flex items-center gap-2 flex-wrap">
                        {stat.player.emoji && <span className="text-2xl">{stat.player.emoji}</span>}
                        <span>{stat.player.name}</span>
                        {stat.player.nickname && (
                          <span className="text-gray-500 dark:text-gray-400 ml-2">({stat.player.nickname})</span>
                        )}
                        {getPlayerAchievements(stat.player.id).length > 0 && (
                          <div className="flex gap-1 ml-2">
                            {getPlayerAchievements(stat.player.id).map((achievement, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full"
                                title={achievement}
                              >
                                {achievement.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        )}
                      </span>
                    </h2>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Сессий</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{stat.sessionsCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Винрейт</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {stat.winRate.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Всего вложено</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {stat.totalBuyIns.toFixed(2)} ₽
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Всего выведено</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {stat.totalCashOuts.toFixed(2)} ₽
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Итоговая прибыль</div>
                    <div
                      className={`text-2xl font-bold ${
                        stat.profit > 0
                          ? 'text-green-600 dark:text-green-400'
                          : stat.profit < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {stat.profit > 0 ? '+' : ''}
                      {stat.profit.toFixed(2)} ₽
                    </div>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {stat.sessionStats
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((sessionStat) => {
                            const type: 'W' | 'L' | 'N' =
                              sessionStat.profit > 0 ? 'W' : sessionStat.profit < 0 ? 'L' : 'N'
                            return (
                              <StatusLight key={sessionStat.sessionId} type={type} />
                            )
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {expandedPlayer === stat.player.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Детали по сессиям</h3>
                  {stat.sessionStats.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Нет данных о сессиях</p>
                  ) : (
                    <div className="space-y-2">
                      {stat.sessionStats
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((sessionStat) => (
                          <div
                            key={sessionStat.sessionId}
                            className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                          >
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {new Date(sessionStat.date).toLocaleDateString('ru-RU', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </div>
                            </div>
                            <div
                              className={`font-semibold ${
                                sessionStat.profit > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : sessionStat.profit < 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {sessionStat.profit > 0 ? '+' : ''}
                              {sessionStat.profit.toFixed(2)} ₽
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Общая статистика</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Всего игроков</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Всего сессий</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.reduce((sum, s) => sum + s.sessionsCount, 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Общая сумма вложений</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.reduce((sum, s) => sum + s.totalBuyIns, 0).toFixed(2)} ₽
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Общая сумма выведено</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.reduce((sum, s) => sum + s.totalCashOuts, 0).toFixed(2)} ₽
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

