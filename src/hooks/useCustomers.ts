import { useEffect, useMemo, useState } from 'react'
import {
  createCustomerFromForm,
  loadCustomers,
  markCustomerDeleted,
  saveCustomers,
  updateCustomerFromForm,
} from '../services/customerService'
import { addNotification } from '../services/notificationService'
import { addActivityLogEntry } from '../services/activityService'
import { DATA_CHANGED_EVENT } from '../services/dataEvents'
import type { Customer, CustomerFormValues } from '../types/customer'

export type CustomerSortKey = 'fullName' | 'city' | 'createdAt' | 'updatedAt'

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>(() => loadCustomers())
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<CustomerSortKey>('updatedAt')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  useEffect(() => {
    const load = () => {
      setCustomers(loadCustomers())
    }

    load()
    window.addEventListener(DATA_CHANGED_EVENT, load)

    return () => window.removeEventListener(DATA_CHANGED_EVENT, load)
  }, [])

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matched = customers.filter((customer) => {
      return [
        customer.fullName,
        customer.phoneNumber,
        customer.whatsappNumber,
        customer.address,
        customer.city,
        customer.notes || '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })

    return matched.sort((a, b) => {
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime()
      }

      return a[sortBy].localeCompare(b[sortBy])
    })
  }, [customers, search, sortBy])

  const openCreate = () => {
    setSelectedCustomer(null)
    setModalOpen(true)
  }

  const openEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setModalOpen(true)
  }

  const closeModal = () => {
    setSelectedCustomer(null)
    setModalOpen(false)
  }

  const saveCustomer = (values: CustomerFormValues) => {
    if (selectedCustomer) {
      const updatedCustomers = customers.map((customer) =>
        customer.id === selectedCustomer.id
          ? updateCustomerFromForm(customer, values)
          : customer,
      )

      try {
        saveCustomers(updatedCustomers)
        setCustomers(updatedCustomers)
        addNotification(`Customer updated: ${values.fullName}`, 'success')
        addActivityLogEntry('Customer edited', `Updated ${values.fullName}`, values.fullName)
      } catch (error) {
        addNotification('Unable to update customer. Please try again.', 'warning')
        return
      }
    } else {
      const duplicate = customers.some((customer) => customer.fullName.toLowerCase() === values.fullName.toLowerCase())
      if (duplicate) {
        addNotification('Customer already exists', 'warning')
        return
      }

      const created = createCustomerFromForm(values)
      const updatedCustomers = [created, ...customers]

      try {
        saveCustomers(updatedCustomers)
        setCustomers(updatedCustomers)
        addNotification(`Customer added: ${created.fullName}`, 'success')
        addActivityLogEntry('Customer added', `Added ${created.fullName}`, created.fullName)
      } catch (error) {
        addNotification('Unable to save customer. Please try again.', 'warning')
        return
      }
    }

    closeModal()
  }

  const requestDeleteCustomer = (customer: Customer) => {
    setDeleteTarget(customer)
  }

  const cancelDelete = () => {
    setDeleteTarget(null)
  }

  const confirmDeleteCustomer = () => {
    if (!deleteTarget) return

    try {
      markCustomerDeleted(deleteTarget.id)
      setCustomers((current) => current.filter((customer) => customer.id !== deleteTarget.id))
      addNotification(`Customer deleted: ${deleteTarget.fullName}`, 'warning')
      addActivityLogEntry('Customer deleted', `Deleted ${deleteTarget.fullName}`, deleteTarget.fullName)
    } catch (error) {
      addNotification('Unable to delete customer. Please try again.', 'warning')
      return
    }

    setDeleteTarget(null)
  }

  return {
    customers,
    filteredCustomers,
    search,
    setSearch,
    sortBy,
    setSortBy,
    selectedCustomer,
    isModalOpen,
    deleteTarget,
    openCreate,
    openEdit,
    closeModal,
    saveCustomer,
    requestDeleteCustomer,
    cancelDelete,
    confirmDeleteCustomer,
  }
}
