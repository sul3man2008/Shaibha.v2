import type { FormulaMethod } from './entry'

export interface WorkshopSettings {
  id: string
  vatPercentage: number
  currency: string
  defaultFormula: FormulaMethod
  workshopName: string
  workshopAddress: string
  workshopPhone: string
  largeText: boolean
}

export const defaultSettings: WorkshopSettings = {
  id: 'default',
  vatPercentage: 15,
  currency: 'SAR',
  defaultFormula: 'method1',
  workshopName: 'Shaibah Warsha',
  workshopAddress: '',
  workshopPhone: '',
  largeText: false,
}

export function normalizeSettings(settings?: Partial<WorkshopSettings> | null): WorkshopSettings {
  return {
    ...defaultSettings,
    ...settings,
    largeText: Boolean(settings?.largeText),
  }
}
