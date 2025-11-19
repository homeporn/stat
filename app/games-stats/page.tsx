'use client'

import { useEffect, useState } from 'react'
import { safeJsonFetch } from '@/lib/api'
import { BackButton } from '@/components/BackButton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface PlayerBankroll {
  playerId: string
  playerName: string
  playerNickname: string | null
  buyIns: number
  cashOuts: number
  bankroll: number
}

interface GameData {
  sessionId: string
  date: string
  description: string | null
  players: PlayerBankroll[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function GamesStatsPage() {
  const [gamesData, setGamesData] = useState<GameData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  useEffect(() => {
    fetchGamesStats()
  }, [])

  const fetchGamesStats = async () => {
    try {
      const data = await safeJsonFetch<GameData[]>('/api/games-stats')
      setGamesData(data)
      if (data.length > 0) {
        setSelectedGame(data[0].sessionId)
      }
    } catch (error) {
      console.error('Failed to fetch games stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    )
  }

  const selectedGameData = gamesData.find(g => g.sessionId === selectedGame)
  const dates = gamesData.map(g => g.date).filter((v, i, a) => a.indexOf(v) === i).sort()
  const players = gamesData[0]?.players.map(p => ({
    id: p.playerId,
    name: p.playerName,
    nickname: p.playerNickname,
  })) || []

  // Данные для таблицы: строки - игроки, столбцы - даты
  const tableData = players.map(player => {
    const row: Record<string, any> = { playerName: player.name }
    dates.forEach(date => {
      const game = gamesData.find(g => g.date === date)
      const playerData = game?.players.find(p => p.playerId === player.id)
      row[date] = playerData ? {
        bankroll: playerData.bankroll,
        buyIns: playerData.buyIns,
        cashOuts: playerData.cashOuts,
      } : null
    })
    return row
  })

  // Данные для диаграммы распределения выигрышей выбранной игры
  const chartData = selectedGameData?.players
    .filter(p => p.bankroll > 0)
    .map(p => ({
      name: p.playerNickname || p.playerName,
      value: p.bankroll,
    }))
    .sort((a, b) => b.value - a.value) || []

  // Данные для столбчатой диаграммы
  const barChartData = selectedGameData?.players.map(p => ({
    name: p.playerNickname || p.playerName,
    bankroll: p.bankroll,
    buyIns: p.buyIns,
    cashOuts: p.cashOuts,
  })) || []

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-4">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Статистика по играм
      </h1>

      {/* Выбор игры */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Выберите игру:
        </label>
        <div className="flex flex-wrap gap-2">
          {gamesData.map(game => (
            <button
              key={game.sessionId}
              onClick={() => setSelectedGame(game.sessionId)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedGame === game.sessionId
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {new Date(game.date).toLocaleDateString('ru-RU')}
              {game.description && ` - ${game.description}`}
            </button>
          ))}
        </div>
      </div>

      {selectedGameData && (
        <>
          {/* Таблица по игрокам и датам */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Банкролл по играм
              </h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-900 z-10">
                    Игрок
                  </th>
                  {dates.map(date => (
                    <th key={date} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      {row.playerName}
                    </td>
                    {dates.map(date => {
                      const data = row[date] as { bankroll: number; buyIns: number; cashOuts: number } | null
                      return (
                        <td key={date} className="px-4 py-3 text-center text-sm">
                          {data ? (
                            <div className="flex flex-col">
                              <span className={`font-semibold ${
                                data.bankroll > 0 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : data.bankroll < 0 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {data.bankroll > 0 ? '+' : ''}{data.bankroll.toFixed(2)} ₽
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {data.buyIns.toFixed(0)}/{data.cashOuts.toFixed(0)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Диаграммы для выбранной игры */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Столбчатая диаграмма */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Банкролл по игрокам
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="bankroll" fill="#3b82f6" name="Банкролл" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Круговая диаграмма распределения выигрышей */}
            {chartData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Распределение выигрышей
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name: string; percent?: number }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `${value.toFixed(2)} ₽`}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Детали выбранной игры */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Детали игры {new Date(selectedGameData.date).toLocaleDateString('ru-RU')}
              </h2>
              {selectedGameData.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedGameData.description}
                </p>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Игрок
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Бай-ины
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Кэшауты
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Банкролл
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedGameData.players.map((player) => (
                    <tr key={player.playerId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {player.playerNickname || player.playerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                        {player.buyIns.toFixed(2)} ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                        {player.cashOuts.toFixed(2)} ₽
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                        player.bankroll > 0
                          ? 'text-green-600 dark:text-green-400'
                          : player.bankroll < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {player.bankroll > 0 ? '+' : ''}{player.bankroll.toFixed(2)} ₽
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

