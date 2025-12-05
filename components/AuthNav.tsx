'use client'

import { usePathname } from 'next/navigation'
import { MagicNavigationMenu } from './MagicNavigationMenu'
import { LogoutButton } from './LogoutButton'
import { ThemeToggle } from './ThemeToggle'
import Link from 'next/link'
import Image from 'next/image'

export function AuthNav() {
  const pathname = usePathname()
  
  // Не показываем навигацию на странице логина
  if (pathname === '/login') {
    return null
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-1">
            <Link href="/" className="flex items-center px-2 py-2 text-xl font-semibold text-gray-900 dark:text-gray-100 mr-4 sm:mr-8">
              <Image 
                src="/logo.svg" 
                alt="Logo" 
                width={32} 
                height={32} 
                className="mr-2"
              />
              Статистика
            </Link>
            <div className="hidden sm:block">
              <MagicNavigationMenu />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LogoutButton />
            <ThemeToggle />
          </div>
        </div>
        {/* Мобильное меню */}
        <div className="sm:hidden pb-4">
          <MagicNavigationMenu mobile />
        </div>
      </div>
    </nav>
  )
}

