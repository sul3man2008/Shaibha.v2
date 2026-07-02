import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { classNames } from '../../utils/classNames'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'outline'
}

export function Button({ children, variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/25',
        variant === 'outline' && 'border border-slate-200 bg-white/90 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40',
        variant === 'ghost' && 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
