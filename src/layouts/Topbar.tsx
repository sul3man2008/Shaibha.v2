import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Bell, LayoutDashboard, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { loadNotifications, NOTIFICATIONS_CHANGED_EVENT, type NotificationItem } from '../services/notificationService'
import { ACTIVITY_LOG_CHANGED_EVENT, loadActivityLog } from '../services/activityService'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { getCurrentSessionUser, logoutUser } from '../services/authService'
import { navigation } from '../constants/navigation'
import { classNames } from '../utils/classNames'
import { formatDisplayDateTime } from '../utils/date'

export function Topbar() {
  const [open, setOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const { language, setLanguage, isUrdu, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const currentUser = getCurrentSessionUser()

  useEffect(() => {
    const sync = () => {
      const recentActivity = loadActivityLog().slice(0, 8)
      const derived: NotificationItem[] = recentActivity.map((entry) => ({
        id: entry.id,
        message: `${entry.action}: ${entry.details}`,
        type: entry.action.includes('deleted') || entry.action.includes('error') ? 'warning' : 'info',
        createdAt: entry.createdAt,
      }))
      setNotifications(derived.length > 0 ? derived : loadNotifications())
    }

    sync()
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, sync)
    window.addEventListener(ACTIVITY_LOG_CHANGED_EVENT, sync)
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, sync)
      window.removeEventListener(ACTIVITY_LOG_CHANGED_EVENT, sync)
    }
  }, [])

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-3 py-3 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/90 sm:px-4 lg:px-6">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/20 sm:flex">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400 sm:text-xs">Workshop Management</p>
              <h2 className="truncate text-base font-semibold text-slate-950 dark:text-white sm:text-lg">{isUrdu ? 'ڈیش بورڈ جائزہ' : 'Dashboard Overview'}</h2>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            <div className="relative hidden w-full max-w-[280px] items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 md:flex">
              <Search className="h-4 w-4" />
              <input type="search" placeholder="Search records" className="w-full bg-transparent text-sm outline-none" />
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:flex"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:inline-flex"
            >
              {t('common.englishUrdu')}
            </button>
            <div className="relative">
              <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" onClick={() => setOpen((value) => !value)}>
                <Bell className="h-5 w-5" />
              </button>
              {open && (
                <div className="absolute right-0 mt-3 w-[min(88vw,22rem)] rounded-[24px] border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">{t('common.notifications')}</p>
                    <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('common.emptyNotifications')}</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          <p>{notification.message}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDisplayDateTime(notification.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:px-3">
              <span className="hidden truncate font-medium text-slate-900 dark:text-white sm:inline">{currentUser?.fullName ?? 'User'}</span>
              <button type="button" onClick={() => { logoutUser(); navigate('/auth') }} className="rounded-xl px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={classNames('fixed inset-0 z-40 lg:hidden', mobileNavOpen ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div className={classNames('absolute inset-0 bg-slate-950/40 transition-opacity duration-300', mobileNavOpen ? 'opacity-100' : 'opacity-0')} onClick={() => setMobileNavOpen(false)} />
        <div className={classNames('absolute left-0 top-0 flex h-full w-[85vw] max-w-[320px] flex-col gap-4 border-r border-slate-200 bg-white p-4 shadow-2xl transition-transform duration-300 dark:border-slate-700 dark:bg-slate-900', mobileNavOpen ? 'translate-x-0' : '-translate-x-full')}>
          <div className="flex items-center justify-between rounded-[24px] bg-gradient-to-br from-emerald-600 to-emerald-500 p-4 text-white">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-100">Shaibah Warsha</p>
              <h2 className="mt-2 text-xl font-semibold">{isUrdu ? 'گولڈ ورکشاپ' : 'Gold Workshop'}</h2>
            </div>
            <button type="button" onClick={() => setMobileNavOpen(false)} className="rounded-full bg-white/15 p-2 text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="space-y-1.5">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  classNames(
                    'flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200',
                    isActive ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300',
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {t(`nav.${item.key}`)}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
