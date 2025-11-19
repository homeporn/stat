import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Покер Статистика",
  description: "Ведение статистики домашних покерных игр",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link href="/" className="flex items-center px-2 py-2 text-xl font-semibold text-gray-900">
                  🎴 Покер Статистика
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link href="/players" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                    Игроки
                  </Link>
                  <Link href="/sessions" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                    Сессии
                  </Link>
                  <Link href="/stats" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                    Статистика
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
