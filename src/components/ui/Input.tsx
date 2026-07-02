import type { InputHTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | undefined
}

export function Input({ label, className, error, ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm text-slate-700 dark:text-slate-300">
      {label && <span className="font-medium">{label}</span>}
      <input
        className={classNames(
          'w-full rounded-2xl border bg-white/95 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(22,163,74,0.12)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:bg-slate-800',
          error ? 'border-rose-400 focus:border-rose-500 focus:shadow-rose-100/60' : 'border-slate-200',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${props.id ?? props.name}-error` : undefined}
        {...props}
      />
      {error ? <p id={`${props.id ?? props.name}-error`} className="text-xs font-medium text-rose-600">{error}</p> : null}
    </label>
  )
}
