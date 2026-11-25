export type Unit = 'cm' | 'm' | 'ft'

/** `ft` means feet and inches (10'10"). Shown in the UI as ft/in. */
export const UNITS: { id: Unit; label: string }[] = [
  { id: 'cm', label: 'cm' },
  { id: 'm', label: 'm' },
  { id: 'ft', label: "ft/in" },
]

export const CM_PER_FT = 30.48
export const CM_PER_IN = 2.54

/** Splits a length in cm into whole feet and decimal inches (inches rounded to 2 decimals, carrying into feet). */
export function splitFeetInches(cm: number, dp = 2): { ft: number; inch: number } {
  const totalIn = Math.round((cm / CM_PER_IN) * 10 ** dp) / 10 ** dp
  const ft = Math.floor(totalIn / 12 + 1e-9)
  return { ft, inch: parseFloat((totalIn - ft * 12).toFixed(dp)) }
}

export function formatLength(cm: number, unit: Unit): string {
  if (unit === 'm') return `${(cm / 100).toFixed(2)} m`
  if (unit === 'ft') {
    const { ft, inch } = splitFeetInches(cm, 1)
    return `${ft}'${inch}"`
  }
  return `${Math.round(cm)} cm`
}

/** Area from cm x cm. */
export function formatArea(wCm: number, hCm: number, unit: Unit): string {
  if (unit === 'ft') return `${((wCm * hCm) / 929.0304).toFixed(1)} ft²`
  return `${((wCm * hCm) / 10000).toFixed(1)} m²`
}
