'use client';

import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                监督日记系统
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                首页
              </Link>
              <Link href="/projects" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                项目管理
              </Link>
              <Link href="/diary" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                日记管理
              </Link>
              <Link href="/settings" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                设置
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
