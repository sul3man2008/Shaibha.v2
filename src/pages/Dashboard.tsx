import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, FileText, TrendingUp, TrendingDown, DollarSign, ChevronRight } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { loadCustomers } from '../services/customerService'
import { loadEntries } from '../services/entryService'
import { calculateCustomerLedgerSummary, LEDGER_CHANGED_EVENT } from '../services/ledgerService'
import { DATA_CHANGED_EVENT } from '../services/dataEvents'
import type { Customer } from '../types/customer'
import type { Entry } from '../types/entry'
import { formatDisplayDate } from '../utils/date'

export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    const syncData = () => {
      setCustomers(loadCustomers())
      setEntries(loadEntries())
    }

    syncData()
    window.addEventListener(LEDGER_CHANGED_EVENT, syncData)
    window.addEventListener(DATA_CHANGED_EVENT, syncData)

    return () => {
      window.removeEventListener(LEDGER_CHANGED_EVENT, syncData)
      window.removeEventListener(DATA_CHANGED_EVENT, syncData)
    }
  }, [])

  const stats = useMemo(() => {
    let goldReceived = 0
    let goldGiven = 0
    let labourTotal = 0
    let vatTotal = 0
    let todayEntries = 0
    let monthLabour = 0
    let monthGoldReceived = 0
    let monthGoldGiven = 0

    const today = new Date().toISOString().slice(0, 10)
    const currentMonth = new Date().toISOString().slice(0, 7)

    entries.forEach((entry) => {
      const weight21k = Number(entry.weight21k ?? 0)
      const labourAmount = Number(entry.labourAmount ?? 0)
      const vatAmount = Number(entry.vatAmount ?? 0)
      const entryMonth = entry.date.slice(0, 7)

      if (entry.date === today) {
        todayEntries += 1
      }

      if (entryMonth === currentMonth) {
        monthLabour += labourAmount
        if (entry.direction === 'receive') {
          monthGoldReceived += weight21k
        } else {
          monthGoldGiven += weight21k
        }
      }

      if (entry.direction === 'receive') {
        goldReceived += weight21k
      } else {
        goldGiven += weight21k
      }
      labourTotal += labourAmount
      vatTotal += vatAmount
    })

    return {
      totalCustomers: customers.length,
      totalEntries: entries.length,
      goldReceived,
      goldGiven,
      labourTotal,
      vatTotal,
      balance: goldReceived - goldGiven,
      todayEntries,
      monthLabour,
      monthGoldReceived,
      monthGoldGiven,
    }
  }, [customers, entries])

  const recentEntries = useMemo(() => {
    return entries.slice(0, 5).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [entries])

  const topCustomers = useMemo(() => {
    return customers
      .map((customer) => ({
        ...customer,
        ...calculateCustomerLedgerSummary(customer.id),
      }))
      .sort((a, b) => (b.totalTransactions ?? 0) - (a.totalTransactions ?? 0))
      .slice(0, 5)
  }, [customers])

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-white via-emerald-50/50 to-slate-50 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-slate-700/80 dark:bg-gradient-to-br dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-400">Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">Welcome to Shaibah Warsha</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Real-time workshop overview showing customers, transactions, and gold inventory.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-emerald-900/50 dark:bg-slate-800/80 dark:text-slate-300">
            Live operations • {formatDisplayDate(new Date().toISOString())}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Customers</p>
            <div className="rounded-2xl bg-blue-50 p-2 text-blue-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-950 dark:text-white">{stats.totalCustomers}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Active customer base</p>
        </Card>
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Entries</p>
            <div className="rounded-2xl bg-blue-50 p-2 text-blue-700">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-950 dark:text-white">{stats.totalEntries}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Transactions logged</p>
        </Card>
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Gold Received</p>
            <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-emerald-600">{stats.goldReceived.toFixed(1)}g</p>
          <p className="text-sm text-slate-500">Incoming inventory</p>
        </Card>
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Gold Given</p>
            <div className="rounded-2xl bg-rose-50 p-2 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-rose-600">{stats.goldGiven.toFixed(1)}g</p>
          <p className="text-sm text-slate-500">Outgoing inventory</p>
        </Card>
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Balance</p>
            <div className="rounded-2xl bg-amber-50 p-2 text-amber-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-2xl font-semibold ${stats.balance >= 0 ? 'text-amber-700' : 'text-rose-600'}`}>
            {stats.balance.toFixed(1)}g
          </p>
          <p className="text-sm text-slate-500">Current gold balance</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Recent Entries</h2>
              <p className="mt-1 text-sm text-slate-600">Latest 5 transactions across all customers</p>
            </div>
            <Link to="/entries">
              <Button variant="ghost" className="text-xs">
                View All
              </Button>
            </Link>
          </div>

          {recentEntries.length === 0 ? (
            <p className="text-sm text-slate-600">No entries yet. Start by adding an entry.</p>
          ) : (
            <div className="space-y-3">
              {recentEntries.map((entry) => {
                const customer = customers.find((c) => c.id === entry.customerId)
                return (
                  <div key={entry.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{customer?.fullName ?? 'Unknown'}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{formatDisplayDate(entry.date)}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className={`text-sm font-semibold ${entry.direction === 'receive' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {entry.direction === 'receive' ? '+' : '-'} {Number(entry.weight21k ?? 0).toFixed(2)}g
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Top Customers</h2>
              <p className="mt-1 text-sm text-slate-600">By transaction count</p>
            </div>
            <Link to="/customers">
              <Button variant="ghost" className="text-xs">
                View All
              </Button>
            </Link>
          </div>

          {topCustomers.length === 0 ? (
            <p className="text-sm text-slate-600">No customers yet. Add your first customer.</p>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((customer) => (
                <Link key={customer.id} to={`/customer-ledger/${customer.id}`} className="block">
                  <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/70 p-3 transition hover:border-blue-200 hover:bg-blue-50/50 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{customer.fullName}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{customer.city}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-semibold text-slate-900">{customer.totalTransactions} txn</p>
                      <p className="text-xs font-semibold text-amber-700">{(customer.balance ?? 0).toFixed(1)}g</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Labour & Fees Summary</h2>
            <p className="mt-1 text-sm text-slate-600">Total labour charges and VAT collected</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Total Labour</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{stats.labourTotal.toFixed(2)} SAR</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Total VAT</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{stats.vatTotal.toFixed(2)} SAR</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Report Summary</h2>
            <p className="mt-1 text-sm text-slate-600">Simple dashboard cards for the current reporting view</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Today&apos;s entries</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{stats.todayEntries}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">This month&apos;s labour</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">SAR {stats.monthLabour.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">This month&apos;s gold received</p>
              <p className="mt-2 text-2xl font-semibold text-green-600">{stats.monthGoldReceived.toFixed(2)}g</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">This month&apos;s gold given</p>
              <p className="mt-2 text-2xl font-semibold text-rose-600">{stats.monthGoldGiven.toFixed(2)}g</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-600">Jump to key workflow sections</p>
          </div>
          <div className="space-y-2">
            <Link to="/entries" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span>Add New Entry</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/customers" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span>Manage Customers</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/settings" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span>Settings</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
