'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { safeJsonFetch } from '@/lib/api'
import { BackButton } from '@/components/BackButton'

interface Player {
  id: string
  name: string
  nickname: string | null
}

interface BuyIn {
  id: string
  amount: number
  player: Player
  createdAt: string
}

interface CashOut {
  id: string
  amount: number
  player: Player
  createdAt: string
}

interface SessionPlayer {
  id: string
  player: Player
}

interface Session {
  id: string
  date: string
  description: string | null
  players: SessionPlayer[]
  buyIns: BuyIn[]
  cashOuts: CashOut[]
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    playerIds: [] as string[],
  })
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  useEffect(() => {
    fetchSessions()
    fetchPlayers()
  }, [])

  const fetchSessions = async () => {
    try {
      const data = await safeJsonFetch<Session[]>('/api/sessions')
      setSessions(data)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlayers = async () => {
    try {
      const data = await safeJsonFetch<Player[]>('/api/players')
      setPlayers(data)
    } catch (error) {
      console.error('Failed to fetch players:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.playerIds.length === 0) {
      alert('Выберите хотя бы одного игрока')
      return
    }

    try {
      const url = editingSession
        ? `/api/sessions/${editingSession.id}`
        : '/api/sessions'
      const method = editingSession ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          description: formData.description || null,
          playerIds: formData.playerIds,
        }),
      })

      if (response.ok) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          description: '',
          playerIds: [],
        })
        setShowForm(false)
        setEditingSession(null)
        fetchSessions()
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при сохранении')
      }
    } catch (error) {
      console.error('Failed to save session:', error)
      alert('Ошибка при сохранении сессии')
    }
  }

  const handleEdit = (session: Session) => {
    setEditingSession(session)
    setFormData({
      date: new Date(session.date).toISOString().split('T')[0],
      description: session.description || '',
      playerIds: session.players.map((sp) => sp.player.id),
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту сессию?')) {
      return
    }

    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchSessions()
        if (selectedSession?.id === id) {
          setSelectedSession(null)
        }
      } else {
        alert('Ошибка при удалении сессии')
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
      alert('Ошибка при удалении сессии')
    }
  }

  const handleAddBuyIn = async (sessionId: string, playerId: string, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Введите корректную сумму')
      return
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}/buyins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, amount: parseFloat(amount) }),
      })

      if (response.ok) {
        fetchSessions()
        if (selectedSession?.id === sessionId) {
          const updated = await fetch(`/api/sessions/${sessionId}`).then((r) => r.json())
          setSelectedSession(updated)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при добавлении бай-ина')
      }
    } catch (error) {
      console.error('Failed to add buy-in:', error)
      alert('Ошибка при добавлении бай-ина')
    }
  }

  const handleAddCashOut = async (sessionId: string, playerId: string, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Введите корректную сумму')
      return
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}/cashouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, amount: parseFloat(amount) }),
      })

      if (response.ok) {
        fetchSessions()
        if (selectedSession?.id === sessionId) {
          const updated = await fetch(`/api/sessions/${sessionId}`).then((r) => r.json())
          setSelectedSession(updated)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при добавлении кэшаута')
      }
    } catch (error) {
      console.error('Failed to add cash-out:', error)
      alert('Ошибка при добавлении кэшаута')
    }
  }

  const handleDeleteBuyIn = async (buyInId: string, sessionId: string) => {
    if (!confirm('Удалить этот бай-ин?')) return

    try {
      const response = await fetch(`/api/buyins/${buyInId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchSessions()
        if (selectedSession?.id === sessionId) {
          const updated = await fetch(`/api/sessions/${sessionId}`).then((r) => r.json())
          setSelectedSession(updated)
        }
      }
    } catch (error) {
      console.error('Failed to delete buy-in:', error)
    }
  }

  const handleDeleteCashOut = async (cashOutId: string, sessionId: string) => {
    if (!confirm('Удалить этот кэшаут?')) return

    try {
      const response = await fetch(`/api/cashouts/${cashOutId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchSessions()
        if (selectedSession?.id === sessionId) {
          const updated = await fetch(`/api/sessions/${sessionId}`).then((r) => r.json())
          setSelectedSession(updated)
        }
      }
    } catch (error) {
      console.error('Failed to delete cash-out:', error)
    }
  }

  const calculateProfit = (session: Session, playerId: string) => {
    const buyIns = session.buyIns
      .filter((bi) => bi.player.id === playerId)
      .reduce((sum, bi) => sum + bi.amount, 0)
    const cashOuts = session.cashOuts
      .filter((co) => co.player.id === playerId)
      .reduce((sum, co) => sum + co.amount, 0)
    return cashOuts - buyIns
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
      <div className="mb-4">
        <BackButton />
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Игровые сессии</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingSession(null)
            setFormData({
              date: new Date().toISOString().split('T')[0],
              description: '',
              playerIds: [],
            })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Отмена' : '+ Создать сессию'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingSession ? 'Редактировать сессию' : 'Новая сессия'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Дата *
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Игроки *
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {players.map((player) => (
                  <label key={player.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.playerIds.includes(player.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            playerIds: [...formData.playerIds, player.id],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            playerIds: formData.playerIds.filter((id) => id !== player.id),
                          })
                        }
                      }}
                      className="mr-2"
                    />
                    <span>
                      {player.name} {player.nickname && `(${player.nickname})`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingSession ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingSession(null)
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    playerIds: [],
                  })
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Список сессий</h2>
          {sessions.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-600">Пока нет сессий. Создайте первую сессию!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-colors ${
                    selectedSession?.id === session.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedSession(session)
                    setShowForm(false)
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {new Date(session.date).toLocaleDateString('ru-RU')}
                      </div>
                      {session.description && (
                        <div className="text-sm text-gray-600 mt-1">{session.description}</div>
                      )}
                      <div className="text-sm text-gray-500 mt-1">
                        Игроков: {session.players.length}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(session)
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(session.id)
                        }}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSession && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              Сессия {new Date(selectedSession.date).toLocaleDateString('ru-RU')}
            </h2>
            {selectedSession.description && (
              <p className="text-gray-600 mb-4">{selectedSession.description}</p>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Бай-ины</h3>
                <div className="space-y-2 mb-3">
                  {selectedSession.buyIns.map((buyIn) => (
                    <div
                      key={buyIn.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>
                        {buyIn.player.name}: {buyIn.amount.toFixed(2)} ₽
                      </span>
                      <button
                        onClick={() => handleDeleteBuyIn(buyIn.id, selectedSession.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    id="buyInPlayer"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    defaultValue=""
                  >
                    <option value="">Выберите игрока</option>
                    {selectedSession.players.map((sp) => (
                      <option key={sp.player.id} value={sp.player.id}>
                        {sp.player.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    id="buyInAmount"
                    placeholder="Сумма"
                    step="0.01"
                    min="0"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => {
                      const playerSelect = document.getElementById('buyInPlayer') as HTMLSelectElement
                      const amountInput = document.getElementById('buyInAmount') as HTMLInputElement
                      if (playerSelect.value && amountInput.value) {
                        handleAddBuyIn(selectedSession.id, playerSelect.value, amountInput.value)
                        amountInput.value = ''
                        playerSelect.value = ''
                      }
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Добавить
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Кэшауты</h3>
                <div className="space-y-2 mb-3">
                  {selectedSession.cashOuts.map((cashOut) => (
                    <div
                      key={cashOut.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>
                        {cashOut.player.name}: {cashOut.amount.toFixed(2)} ₽
                      </span>
                      <button
                        onClick={() => handleDeleteCashOut(cashOut.id, selectedSession.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    id="cashOutPlayer"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    defaultValue=""
                  >
                    <option value="">Выберите игрока</option>
                    {selectedSession.players.map((sp) => (
                      <option key={sp.player.id} value={sp.player.id}>
                        {sp.player.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    id="cashOutAmount"
                    placeholder="Сумма"
                    step="0.01"
                    min="0"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => {
                      const playerSelect = document.getElementById('cashOutPlayer') as HTMLSelectElement
                      const amountInput = document.getElementById('cashOutAmount') as HTMLInputElement
                      if (playerSelect.value && amountInput.value) {
                        handleAddCashOut(selectedSession.id, playerSelect.value, amountInput.value)
                        amountInput.value = ''
                        playerSelect.value = ''
                      }
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Добавить
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Итоги по игрокам (Банкролл)</h3>
                <div className="space-y-2">
                  {selectedSession.players.map((sp) => {
                    const profit = calculateProfit(selectedSession, sp.player.id)
                    const buyIns = selectedSession.buyIns
                      .filter((bi) => bi.player.id === sp.player.id)
                      .reduce((sum, bi) => sum + bi.amount, 0)
                    const cashOuts = selectedSession.cashOuts
                      .filter((co) => co.player.id === sp.player.id)
                      .reduce((sum, co) => sum + co.amount, 0)
                    return (
                      <div
                        key={sp.player.id}
                        className={`p-3 rounded ${
                          profit > 0 
                            ? 'bg-green-50 dark:bg-green-900/20' 
                            : profit < 0 
                              ? 'bg-red-50 dark:bg-red-900/20' 
                              : 'bg-gray-50 dark:bg-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{sp.player.name}</span>
                          <span className={`font-semibold ${
                            profit > 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : profit < 0 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {profit > 0 ? '+' : ''}
                            {profit.toFixed(2)} ₽
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                          <span>Бай-ины: {buyIns.toFixed(2)} ₽</span>
                          <span>Кэшауты: {cashOuts.toFixed(2)} ₽</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

