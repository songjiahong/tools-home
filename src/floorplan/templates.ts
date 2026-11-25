import { Wall, Opening, Bed, Wardrobe, Stair, Dimension } from './types'

export interface PlanData {
  walls: Wall[]
  openings: Opening[]
  dimensions: Dimension[]
  beds: Bed[]
  wardrobes: Wardrobe[]
  stairs: Stair[]
}

export type TemplateId = 'studio' | 'one' | 'two'

const S = 2 // 1 cm = 2 px, same as the editor
const OX = 200
const OY = 160

type Seg = [number, number, number, number]
interface Op { wall: number; pos: number; type: 'door' | 'window'; width?: number; flip?: boolean }

function build(id: string, segs: Seg[], ops: Op[], beds: [number, number, 'queen' | 'single', number?][] = [], wardrobes: [number, number, number, number][] = []): PlanData {
  const walls: Wall[] = segs.map(([x1, y1, x2, y2], i) => ({
    id: `tpl-${id}-w${i}`,
    start: { x: OX + x1 * S, y: OY + y1 * S },
    end: { x: OX + x2 * S, y: OY + y2 * S },
    thickness: 20,
  }))
  const openings: Opening[] = ops.map((o, i) => ({
    id: `tpl-${id}-o${i}`,
    wallId: walls[o.wall].id,
    position: o.pos,
    width: o.width ?? (o.type === 'door' ? 90 : 120),
    type: o.type,
    swingDirection: o.type === 'door' ? (o.flip ? -1 : 1) : undefined,
    hingePosition: o.type === 'door' ? 'left' : undefined,
    doorType: o.type === 'door' ? 'single' : undefined,
  }))
  return {
    walls,
    openings,
    dimensions: [],
    beds: beds.map(([x, y, size, rot], i) => ({ id: `tpl-${id}-b${i}`, position: { x: OX + x * S, y: OY + y * S }, rotation: rot ?? 0, size })),
    wardrobes: wardrobes.map(([x, y, w, h], i) => ({ id: `tpl-${id}-r${i}`, position: { x: OX + x * S, y: OY + y * S }, width: w, height: h, rotation: 0 })),
    stairs: [],
  }
}

export function getTemplate(id: TemplateId): PlanData {
  if (id === 'studio') {
    // 600 x 450 cm studio with a corner bathroom
    return build('studio', [
      [0, 0, 600, 0], [600, 0, 600, 450], [600, 450, 0, 450], [0, 450, 0, 0],
      [400, 0, 400, 180], [400, 180, 600, 180],
    ], [
      { wall: 2, pos: 0.15, type: 'door' },
      { wall: 4, pos: 0.7, type: 'door', width: 75 },
      { wall: 0, pos: 0.3, type: 'window' },
      { wall: 3, pos: 0.5, type: 'window' },
    ], [[110, 330, 'queen']], [[300, 40, 120, 60]])
  }
  if (id === 'one') {
    // 800 x 600 cm one-bedroom apartment
    return build('one', [
      [0, 0, 800, 0], [800, 0, 800, 600], [800, 600, 0, 600], [0, 600, 0, 0],
      [350, 0, 350, 330], [350, 330, 0, 330], [550, 330, 800, 330], [550, 330, 550, 600],
    ], [
      { wall: 2, pos: 0.1, type: 'door' },
      { wall: 4, pos: 0.8, type: 'door' },
      { wall: 7, pos: 0.4, type: 'door', width: 75 },
      { wall: 0, pos: 0.2, type: 'window' },
      { wall: 0, pos: 0.7, type: 'window', width: 160 },
      { wall: 3, pos: 0.3, type: 'window' },
    ], [[175, 150, 'queen']], [[40, 255, 60, 120]])
  }
  // two: 1000 x 700 cm two-bedroom apartment
  return build('two', [
    [0, 0, 1000, 0], [1000, 0, 1000, 700], [1000, 700, 0, 700], [0, 700, 0, 0],
    [330, 0, 330, 300], [330, 300, 0, 300],
    [670, 0, 670, 300], [670, 300, 1000, 300],
    [700, 300, 700, 700], [700, 500, 1000, 500],
  ], [
    { wall: 2, pos: 0.12, type: 'door' },
    { wall: 4, pos: 0.85, type: 'door' },
    { wall: 6, pos: 0.85, type: 'door' },
    { wall: 8, pos: 0.25, type: 'door', width: 80 },
    { wall: 0, pos: 0.16, type: 'window' },
    { wall: 0, pos: 0.83, type: 'window' },
    { wall: 3, pos: 0.85, type: 'window', width: 160 },
    { wall: 1, pos: 0.85, type: 'window' },
  ], [[165, 130, 'queen'], [835, 130, 'queen']], [[40, 235, 60, 100], [960, 235, 60, 100]])
}
