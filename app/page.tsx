import Link from "next/link";

export default function Home() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-5xl">
          Добро пожаловать в Покер Статистику
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Ведите учет игроков, сессий и статистику домашних покерных игр
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/players"
          className="block rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-4">👥</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Игроки</h2>
          <p className="text-gray-600 dark:text-gray-400">Управление списком игроков</p>
        </Link>

        <Link
          href="/sessions"
          className="block rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-4">🎮</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Сессии</h2>
          <p className="text-gray-600 dark:text-gray-400">Создание и управление игровыми сессиями</p>
        </Link>

        <Link
          href="/stats"
          className="block rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Статистика</h2>
          <p className="text-gray-600 dark:text-gray-400">Просмотр статистики по игрокам</p>
        </Link>

        <Link
          href="/games-stats"
          className="block rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-4">📈</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Статистика игр</h2>
          <p className="text-gray-600 dark:text-gray-400">Аналитика по играм и диаграммы</p>
        </Link>
      </div>
    </div>
  );
}
