import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Footer } from './Footer'
import { useLanguage } from '../context/LanguageContext'
import { loadSettings } from '../services/entryService'

export function AppLayout() {
  const { dir } = useLanguage()

  useEffect(() => {
    const settings = loadSettings()
    document.documentElement.classList.toggle('app-large-text', settings.largeText)
  }, [])

  return (
    <div className="min-h-screen bg-transparent text-slate-900 transition-colors duration-200 dark:text-slate-100" dir={dir}>
      <Topbar />
      <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-[1500px] flex-col gap-4 px-3 py-4 sm:px-4 sm:py-5 lg:flex-row lg:items-start lg:gap-6 lg:px-6 lg:py-6">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
