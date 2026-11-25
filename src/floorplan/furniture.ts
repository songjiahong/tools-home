import { TKey } from '../i18n/translations'

export interface FurnitureKind {
  id: string
  key: TKey
  w: number
  h: number
}

/** Sizes in cm. "wardrobe" keeps the original look (diagonals) and wall snapping. */
export const FURNITURE: FurnitureKind[] = [
  { id: 'wardrobe', key: 'fu.wardrobe', w: 60, h: 200 },
  { id: 'sofa', key: 'fu.sofa', w: 200, h: 90 },
  { id: 'table', key: 'fu.table', w: 140, h: 80 },
  { id: 'chair', key: 'fu.chair', w: 45, h: 45 },
  { id: 'desk', key: 'fu.desk', w: 120, h: 60 },
  { id: 'tv', key: 'fu.tv', w: 120, h: 40 },
  { id: 'kitchen', key: 'fu.kitchen', w: 240, h: 60 },
  { id: 'fridge', key: 'fu.fridge', w: 70, h: 70 },
  { id: 'sink', key: 'fu.sink', w: 60, h: 50 },
  { id: 'toilet', key: 'fu.toilet', w: 40, h: 70 },
  { id: 'bathtub', key: 'fu.bathtub', w: 170, h: 75 },
  { id: 'shower', key: 'fu.shower', w: 90, h: 90 },
  { id: 'text', key: 'fu.text', w: 90, h: 30 },
]
