import { NavLink } from 'react-router-dom'
import { navigation } from '../constants/navigation'
import { classNames } from '../utils/classNames'
import { useLanguage } from '../context/LanguageContext'
import { getCurrentSessionUser } from '../services/authService'

export function Sidebar() {
  const { isUrdu, t } = useLanguage()
  const currentUser = getCurrentSessionUser()
  const visibleNavigation = navigation.filter((item) => {
    if (item.path === '/admin') {
      return currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin'
    }
    return true
  })

  return (
    <aside className="hidden h-full w-72 shrink-0 flex-col gap-3 rounded-[32px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 lg:flex">
      <div className="rounded-[24px] bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 p-4 text-white shadow-lg shadow-emerald-600/20">
        <p className="text-[10px] uppercase tracking-[0.45em] text-emerald-100">Shaibah Warsha</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{isUrdu ? 'گولڈ ورکشاپ' : 'Gold Workshop'}</h1>
        <p className="mt-2 text-sm text-emerald-50/90">Premium operations dashboard</p>
      </div>
      <nav className="space-y-1.5">
        {visibleNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              classNames(
                'group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {t(`nav.${item.key}`)}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
