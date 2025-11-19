'use client'

import { useEffect, useState } from 'react'

interface Player {
  id: string
  name: string
  nickname: string | null
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

export default function StatsPage() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Статистика по игрокам</h1>

      {stats.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-600">Нет данных для отображения статистики</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stats.map((stat) => (
            <div
              key={stat.player.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setExpandedPlayer(expandedPlayer === stat.player.id ? null : stat.player.id)
                }
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {stat.player.name}
                      {stat.player.nickname && (
                        <span className="text-gray-500 ml-2">({stat.player.nickname})</span>
                      )}
                    </h2>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Сессий</div>
                        <div className="font-semibold text-gray-900">{stat.sessionsCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Винрейт</div>
                        <div className="font-semibold text-gray-900">
                          {stat.winRate.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Всего вложено</div>
                        <div className="font-semibold text-gray-900">
                          {stat.totalBuyIns.toFixed(2)} ₽
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Всего выведено</div>
                        <div className="font-semibold text-gray-900">
                          {stat.totalCashOuts.toFixed(2)} ₽
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm text-gray-500 mb-1">Итоговая прибыль</div>
                    <div
                      className={`text-2xl font-bold ${
                        stat.profit > 0
                          ? 'text-green-600'
                          : stat.profit < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {stat.profit > 0 ? '+' : ''}
                      {stat.profit.toFixed(2)} ₽
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stat.winningSessions}W / {stat.losingSessions}L / {stat.breakevenSessions}E
                    </div>
                  </div>
                </div>
              </div>

              {expandedPlayer === stat.player.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <h3 className="font-semibold mb-4">Детали по сессиям</h3>
                  {stat.sessionStats.length === 0 ? (
                    <p className="text-gray-600 text-sm">Нет данных о сессиях</p>
                  ) : (
                    <div className="space-y-2">
                      {stat.sessionStats
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((sessionStat) => (
                          <div
                            key={sessionStat.sessionId}
                            className="flex justify-between items-center p-3 bg-white rounded border border-gray-200"
                          >
                            <div>
                              <div className="font-medium text-gray-900">
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
                                  ? 'text-green-600'
                                  : sessionStat.profit < 0
                                    ? 'text-red-600'
                                    : 'text-gray-600'
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

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Общая статистика</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Всего игроков</div>
            <div className="text-2xl font-bold text-gray-900">{stats.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Всего сессий</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.reduce((sum, s) => sum + s.sessionsCount, 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Общая сумма вложений</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.reduce((sum, s) => sum + s.totalBuyIns, 0).toFixed(2)} ₽
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Общая сумма выведено</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.reduce((sum, s) => sum + s.totalCashOuts, 0).toFixed(2)} ₽
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

