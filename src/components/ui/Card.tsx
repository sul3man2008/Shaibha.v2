import type { ReactNode } from 'react'
import { classNames } from '../../utils/classNames'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={classNames('rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)] dark:border-slate-700/80 dark:bg-slate-900/80 sm:p-6', className)}>
      {children}
    </div>
  )
}
