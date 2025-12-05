'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { safeJsonFetch } from '@/lib/api'
import { BackButton } from '@/components/BackButton'

interface Player {
  id: string
  name: string
  nickname: string | null
  emoji: string | null
  createdAt: string
}

interface Achievements {
  topCashOutPlayer: { id: string; name: string; totalCashOuts: number } | null
  topBuyInPlayer: { id: string; name: string; totalBuyIns: number } | null
  bestComboPlayer: { id: string; name: string } | null
}

const EMOJI_OPTIONS = ['🎴', '🃏', '👑', '💰', '🏆', '⭐', '🔥', '💎', '🎯', '🚀', '🎲', '🎰', '🦄', '🐉', '🦁', '🐺']

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [achievements, setAchievements] = useState<Achievements>({ topCashOutPlayer: null, topBuyInPlayer: null, bestComboPlayer: null })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', nickname: '', emoji: '' })
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    fetchPlayers()
    fetchAchievements()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null)
      }
    }

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [openDropdown])

  const fetchPlayers = async () => {
    try {
      const data = await safeJsonFetch<Player[]>('/api/players')
      setPlayers(data)
    } catch (error) {
      console.error('Failed to fetch players:', error)
      setPlayers([])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Имя обязательно для заполнения')
      return
    }

    try {
      const url = editingPlayer
        ? `/api/players/${editingPlayer.id}`
        : '/api/players'
      const method = editingPlayer ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          nickname: formData.nickname || null,
          emoji: formData.emoji || null,
        }),
      })

      if (response.ok) {
        setFormData({ name: '', nickname: '', emoji: '' })
        setShowForm(false)
        setEditingPlayer(null)
        fetchPlayers()
        fetchAchievements()
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при сохранении')
      }
    } catch (error) {
      console.error('Failed to save player:', error)
      alert('Ошибка при сохранении игрока')
    }
  }

  const handleEdit = (player: Player) => {
    setEditingPlayer(player)
    setFormData({
      name: player.name,
      nickname: player.nickname || '',
      emoji: player.emoji || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого игрока?')) {
      return
    }

    try {
      const response = await fetch(`/api/players/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPlayers()
        fetchAchievements()
      } else {
        alert('Ошибка при удалении игрока')
      }
    } catch (error) {
      console.error('Failed to delete player:', error)
      alert('Ошибка при удалении игрока')
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 text-gray-900 dark:text-gray-100">Загрузка...</div>
      </div>
    )
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

  const handleSetBestCombo = async (playerId: string) => {
    try {
      const response = await fetch('/api/achievements/best-combo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      })
      if (!response.ok) {
        throw new Error('Failed to set achievement')
      }
      fetchAchievements()
      setOpenDropdown(null)
    } catch (error) {
      console.error('Failed to set best combo achievement:', error)
      alert('Ошибка при выдаче награды')
    }
  }

  const handleRemoveBestCombo = async (playerId: string) => {
    try {
      const response = await fetch(`/api/achievements/best-combo?playerId=${playerId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to remove achievement')
      }
      fetchAchievements()
      setOpenDropdown(null)
    } catch (error) {
      console.error('Failed to remove best combo achievement:', error)
      alert('Ошибка при снятии награды')
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-4">
        <BackButton />
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Игроки</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingPlayer(null)
            setFormData({ name: '', nickname: '', emoji: '' })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Отмена' : '+ Добавить игрока'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingPlayer ? 'Редактировать игрока' : 'Новый игрок'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Имя *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Никнейм
              </label>
              <input
                type="text"
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="emoji" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Эмодзи
              </label>
              <div className="flex gap-2 items-center">
                <div className="flex-1 flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji: formData.emoji === emoji ? '' : emoji })}
                      className={`text-2xl p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                        formData.emoji === emoji ? 'bg-blue-100 dark:bg-blue-900' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {formData.emoji && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, emoji: '' })}
                    className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Очистить
                  </button>
                )}
              </div>
              {formData.emoji && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Выбрано: {formData.emoji}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingPlayer ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingPlayer(null)
                  setFormData({ name: '', nickname: '', emoji: '' })
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {players.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">Пока нет игроков. Добавьте первого игрока!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Имя
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Никнейм
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата создания
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {players.map((player) => {
                const playerAchievements = getPlayerAchievements(player.id)
                return (
                  <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        {player.emoji && <span className="text-xl">{player.emoji}</span>}
                        <span>{player.name}</span>
                        {playerAchievements.length > 0 && (
                          <div className="flex gap-1 ml-2">
                            {playerAchievements.map((achievement, idx) => (
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
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {player.nickname || '-'}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(player.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <div className="relative dropdown-container">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === player.id ? null : player.id)}
                          className="text-xs px-3 py-1.5 rounded transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                        >
                          Выдать награду
                          <span className="ml-1">▼</span>
                        </button>
                        {openDropdown === player.id && (
                          <div className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10 border border-gray-200 dark:border-gray-700">
                            <div className="py-1">
                              {achievements.bestComboPlayer?.id === player.id ? (
                                <button
                                  onClick={() => handleRemoveBestCombo(player.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  🎴 Снять награду "Самая крутая комбинация вечера"
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSetBestCombo(player.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  🎴 Выдать "Самая крутая комбинация вечера"
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleEdit(player)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(player.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

