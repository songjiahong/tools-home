export type Unit = 'cm' | 'm' | 'ft'

export function formatLength(cm: number, unit: Unit): string {
  if (unit === 'm') return `${(cm / 100).toFixed(2)} m`
  if (unit === 'ft') {
    const totalIn = Math.round(cm / 2.54)
    const ft = Math.floor(totalIn / 12)
    const inch = totalIn % 12
    return `${ft}'${inch}"`
  }
  return `${Math.round(cm)} cm`
}

/** Area from cm x cm. */
export function formatArea(wCm: number, hCm: number, unit: Unit): string {
  if (unit === 'ft') return `${((wCm * hCm) / 929.0304).toFixed(1)} ft²`
  return `${((wCm * hCm) / 10000).toFixed(1)} m²`
}
