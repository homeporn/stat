'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface NavItem {
  href: string
  label: string
}

const navItems: NavItem[] = [
  { href: '/players', label: 'Игроки' },
  { href: '/sessions', label: 'Сессии' },
  { href: '/stats', label: 'Статистика по игрокам' },
  { href: '/games-stats', label: 'Статистика игр' },
]

export function MagicNavigationMenu({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname()
  const [activeIndex, setActiveIndex] = useState(0)
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })
  const navRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    // Найти активный индекс на основе текущего пути
    const currentIndex = navItems.findIndex(
      (item) => pathname === item.href || pathname.startsWith(item.href + '/')
    )
    setActiveIndex(currentIndex >= 0 ? currentIndex : -1)
  }, [pathname])

  useEffect(() => {
    const updateUnderline = () => {
      if (activeIndex >= 0) {
        const activeItem = itemsRef.current[activeIndex]
        if (activeItem && navRef.current) {
          const navRect = navRef.current.getBoundingClientRect()
          const itemRect = activeItem.getBoundingClientRect()
          setUnderlineStyle({
            left: itemRect.left - navRect.left,
            width: itemRect.width,
          })
        }
      } else {
        // Если нет активного элемента, скрыть подчеркивание
        setUnderlineStyle({ left: 0, width: 0 })
      }
    }

    // Небольшая задержка для плавной анимации после монтирования
    const timeout = setTimeout(updateUnderline, 50)
    window.addEventListener('resize', updateUnderline)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', updateUnderline)
    }
  }, [activeIndex])

  const handleMouseEnter = (index: number, e: React.MouseEvent<HTMLAnchorElement>) => {
    const item = e.currentTarget
    if (navRef.current) {
      const navRect = navRef.current.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()
      setUnderlineStyle({
        left: itemRect.left - navRect.left,
        width: itemRect.width,
      })
    }
  }

  const handleMouseLeave = () => {
    // Вернуть подчеркивание к активному элементу
    if (activeIndex >= 0) {
      const activeItem = itemsRef.current[activeIndex]
      if (activeItem && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect()
        const itemRect = activeItem.getBoundingClientRect()
        setUnderlineStyle({
          left: itemRect.left - navRect.left,
          width: itemRect.width,
        })
      }
    } else {
      setUnderlineStyle({ left: 0, width: 0 })
    }
  }

  if (mobile) {
    return (
      <div className="flex flex-col space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${
                  isActive
                    ? 'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <nav
      ref={navRef}
      className="relative flex items-center space-x-1"
      onMouseLeave={handleMouseLeave}
    >
      {navItems.map((item, index) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            ref={(el) => {
              itemsRef.current[index] = el
            }}
            onMouseEnter={(e) => handleMouseEnter(index, e)}
            className={`
              relative px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${
                isActive
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }
            `}
          >
            {item.label}
          </Link>
        )
      })}
      {underlineStyle.width > 0 && (
        <div
          className="absolute bottom-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 ease-out rounded-full"
          style={{
            left: `${underlineStyle.left}px`,
            width: `${underlineStyle.width}px`,
          }}
        />
      )}
    </nav>
  )
}

