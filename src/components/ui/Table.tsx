import type { ReactNode } from 'react'

interface TableProps {
  headers: string[]
  children: ReactNode
}

export function Table({ headers, children }: TableProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)] dark:border-slate-700/80 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-50/80 dark:bg-slate-800/80">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-4 font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  {header}
                </th>
              ))}
              <th className="px-4 py-4 text-right font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {children}
          </tbody>
        </table>
      </div>
    </div>
  )
}
