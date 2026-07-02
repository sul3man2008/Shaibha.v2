import { useEffect, useMemo, useRef, useState } from 'react'
import { loadCustomers } from '../services/customerService'
import { loadEntries, loadSettings, addEntry, updateExistingEntry, deleteEntry, duplicateEntry } from '../services/entryService'
import { LEDGER_CHANGED_EVENT } from '../services/ledgerService'
import { DATA_CHANGED_EVENT } from '../services/dataEvents'
import { addNotification } from '../services/notificationService'
import { addActivityLogEntry } from '../services/activityService'
import type { Customer } from '../types/customer'
import type { Entry, EntryFormValues } from '../types/entry'
import type { WorkshopSettings } from '../types/settings'

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [settings, setSettings] = useState<WorkshopSettings | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedDirection, setSelectedDirection] = useState<'receive' | 'give' | ''>('')
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null)
  const saveInFlightRef = useRef(false)

  useEffect(() => {
    const syncData = () => {
      setEntries(loadEntries())
      setCustomers(loadCustomers())
      setSettings(loadSettings())
    }

    syncData()
    window.addEventListener(LEDGER_CHANGED_EVENT, syncData)
    window.addEventListener(DATA_CHANGED_EVENT, syncData)

    return () => {
      window.removeEventListener(LEDGER_CHANGED_EVENT, syncData)
      window.removeEventListener(DATA_CHANGED_EVENT, syncData)
    }
  }, [])

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase()

    return entries
      .filter((entry) => {
        const matchesCustomer = !selectedCustomerId || entry.customerId === selectedCustomerId
        const matchesDate = !selectedDate || entry.date === selectedDate
        const matchesDirection = !selectedDirection || entry.direction === selectedDirection
        const matchesQuery = !query || entry.notes?.toLowerCase().includes(query) || entry.invoiceNumber?.toLowerCase().includes(query)

        return matchesCustomer && matchesDate && matchesDirection && matchesQuery
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [entries, search, selectedCustomerId, selectedDate, selectedDirection])

  const openCreate = () => {
    setSelectedEntry(null)
    setModalOpen(true)
  }

  const openEdit = (entry: Entry) => {
    setSelectedEntry(entry)
    setModalOpen(true)
  }

  const closeModal = () => {
    setSelectedEntry(null)
    setModalOpen(false)
  }

  const saveEntry = (values: EntryFormValues) => {
    if (!settings || saveInFlightRef.current) return

    saveInFlightRef.current = true
    try {
      const customer = customers.find((item) => item.id === values.customerId)
      const customerName = customer?.fullName ?? 'Unknown customer'

      if (selectedEntry) {
        const updated = updateExistingEntry(selectedEntry, values, settings)
        setEntries((current) => current.map((entry) => (entry.id === selectedEntry.id ? updated : entry)))
        addNotification(`Entry updated for ${customerName}`, 'success')
        addActivityLogEntry('Entry edited', `Edited entry for ${customerName}`, customerName)
      } else {
        const created = addEntry(values, settings)
        setEntries((current) => [created, ...current])
        addNotification(`Entry added for ${customerName}`, 'success')
        addActivityLogEntry('Entry added', `Added entry for ${customerName}`, customerName)
      }

      closeModal()
    } finally {
      window.setTimeout(() => {
        saveInFlightRef.current = false
      }, 0)
    }
  }

  const requestDeleteEntry = (entry: Entry) => {
    setDeleteTarget(entry)
  }

  const cancelDelete = () => {
    setDeleteTarget(null)
  }

  const confirmDeleteEntry = () => {
    if (!deleteTarget) return
    const customer = customers.find((item) => item.id === deleteTarget.customerId)
    const customerName = customer?.fullName ?? 'Unknown customer'
    deleteEntry(deleteTarget.id)
    setEntries((current) => current.filter((entry) => entry.id !== deleteTarget.id))
    addNotification(`Entry deleted for ${customerName}`, 'warning')
    addActivityLogEntry('Entry deleted', `Deleted entry for ${customerName}`, customerName)
    setDeleteTarget(null)
  }

  const duplicateExistingEntry = (entry: Entry) => {
    if (!settings) return
    const duplicated = duplicateEntry(entry.id, settings)
    if (duplicated) {
      const customer = customers.find((item) => item.id === duplicated.customerId)
      const customerName = customer?.fullName ?? 'Unknown customer'
      setEntries((current) => [duplicated, ...current])
      addNotification('Entry duplicated', 'info')
      addActivityLogEntry('Entry duplicated', `Duplicated entry for ${customerName}`, customerName)
    }
  }

  return {
    entries: filteredEntries,
    customers,
    settings,
    search,
    setSearch,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedDate,
    setSelectedDate,
    selectedDirection,
    setSelectedDirection,
    selectedEntry,
    isModalOpen,
    deleteTarget,
    openCreate,
    openEdit,
    closeModal,
    saveEntry,
    requestDeleteEntry,
    cancelDelete,
    confirmDeleteEntry,
    duplicateExistingEntry,
  }
}
