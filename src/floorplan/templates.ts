import { Wall, Opening, Bed, Wardrobe, Stair, Dimension } from './types'

export interface PlanData {
  walls: Wall[]
  openings: Opening[]
  dimensions: Dimension[]
  beds: Bed[]
  wardrobes: Wardrobe[]
  stairs: Stair[]
}

export type TemplateId = 'studio' | 'one' | 'two' | 'bedroom' | 'office' | 'house' | 'bathroom' | 'living' | 'tiny'

/** [x, y, w, h, kind, rotationDeg?] in cm; label comes from the translator. */
type Furn = [number, number, number, number, string, number?]
type Tr = (kind: string) => string

const S = 2 // 1 cm = 2 px, same as the editor
const OX = 200
const OY = 160

type Seg = [number, number, number, number]
interface Op { wall: number; pos: number; type: 'door' | 'window'; width?: number; flip?: boolean }

function build(id: string, segs: Seg[], ops: Op[], beds: [number, number, 'queen' | 'single', number?][] = [], wardrobes: [number, number, number, number][] = [], furn: Furn[] = [], tr: Tr = (k) => k): PlanData {
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
    wardrobes: [
      ...wardrobes.map(([x, y, w, h], i): Wardrobe => ({ id: `tpl-${id}-r${i}`, position: { x: OX + x * S, y: OY + y * S }, width: w, height: h, rotation: 0 })),
      ...furn.map(([x, y, w, h, kind, rot], i): Wardrobe => ({
        id: `tpl-${id}-f${i}`,
        kind,
        label: kind === 'wardrobe' ? undefined : tr(kind),
        position: { x: OX + x * S, y: OY + y * S },
        width: w,
        height: h,
        rotation: ((rot ?? 0) * Math.PI) / 180,
      })),
    ],
    stairs: [],
  }
}

export function getTemplate(id: TemplateId, tr: Tr = (k) => k): PlanData {
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
    ], [[110, 330, 'queen']], [[300, 40, 120, 60]], [[520, 60, 40, 70, 'toilet'], [520, 140, 60, 50, 'sink'], [300, 280, 160, 80, 'sofa', 0], [470, 340, 80, 80, 'table']], tr)
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
    ], [[175, 150, 'queen']], [[40, 255, 60, 120]], [[675, 80, 40, 70, 'toilet'], [740, 60, 60, 50, 'sink'], [150, 470, 200, 90, 'sofa'], [650, 470, 140, 80, 'table'], [330, 560, 240, 60, 'kitchen']], tr)
  }
  if (id === 'bedroom') {
    // 400 x 350 cm bedroom with desk
    return build('bedroom', [
      [0, 0, 400, 0], [400, 0, 400, 350], [400, 350, 0, 350], [0, 350, 0, 0],
    ], [
      { wall: 2, pos: 0.12, type: 'door' },
      { wall: 0, pos: 0.5, type: 'window', width: 150 },
    ], [[200, 120, 'queen']], [[40, 265, 60, 120]], [[345, 290, 120, 60, 'desk', 90], [300, 290, 45, 45, 'chair']], tr)
  }
  if (id === 'office') {
    // 900 x 550 cm open-plan office with meeting room and kitchenette
    return build('office', [
      [0, 0, 900, 0], [900, 0, 900, 550], [900, 550, 0, 550], [0, 550, 0, 0],
      [600, 0, 600, 260], [600, 260, 900, 260],
      [0, 400, 200, 400], [200, 400, 200, 550],
    ], [
      { wall: 2, pos: 0.55, type: 'door', width: 120 },
      { wall: 4, pos: 0.85, type: 'door' },
      { wall: 7, pos: 0.4, type: 'door', width: 80 },
      { wall: 0, pos: 0.15, type: 'window', width: 160 },
      { wall: 0, pos: 0.45, type: 'window', width: 160 },
      { wall: 0, pos: 0.85, type: 'window', width: 160 },
      { wall: 3, pos: 0.45, type: 'window', width: 160 },
    ], [], [], [
      [130, 90, 140, 70, 'desk'], [130, 220, 140, 70, 'desk'], [330, 90, 140, 70, 'desk'], [330, 220, 140, 70, 'desk'],
      [130, 140, 45, 45, 'chair'], [130, 270, 45, 45, 'chair'], [330, 140, 45, 45, 'chair'], [330, 270, 45, 45, 'chair'],
      [750, 120, 260, 100, 'table'], [60, 460, 70, 70, 'fridge'], [90, 520, 120, 40, 'sink', 0],
    ], tr)
  }
  if (id === 'house') {
    // 1100 x 800 cm three-bedroom house
    return build('house', [
      [0, 0, 1100, 0], [1100, 0, 1100, 800], [1100, 800, 0, 800], [0, 800, 0, 0],
      [367, 0, 367, 330], [733, 0, 733, 330], [0, 330, 1100, 330],
      [600, 330, 600, 800], [600, 560, 1100, 560], [850, 560, 850, 800],
    ], [
      { wall: 2, pos: 0.73, type: 'door', width: 100 },
      { wall: 6, pos: 0.16, type: 'door' },
      { wall: 6, pos: 0.5, type: 'door' },
      { wall: 6, pos: 0.84, type: 'door' },
      { wall: 8, pos: 0.7, type: 'door', width: 80 },
      { wall: 7, pos: 0.25, type: 'door', width: 100 },
      { wall: 0, pos: 0.17, type: 'window' },
      { wall: 0, pos: 0.5, type: 'window' },
      { wall: 0, pos: 0.84, type: 'window' },
      { wall: 3, pos: 0.3, type: 'window', width: 200 },
      { wall: 1, pos: 0.7, type: 'window', width: 160 },
    ], [[183, 120, 'queen'], [550, 120, 'queen'], [916, 120, 'single']], [[40, 280, 60, 110], [510, 280, 60, 110], [1060, 280, 60, 110]], [
      [250, 650, 220, 90, 'sofa'], [250, 480, 90, 140, 'table'], [850, 420, 280, 60, 'kitchen'], [1050, 400, 70, 70, 'fridge'],
      [880, 740, 40, 70, 'toilet'], [980, 760, 60, 50, 'sink'], [1060, 650, 170, 75, 'bathtub', 90],
    ], tr)
  }
  if (id === 'bathroom') {
    // 300 x 250 cm bathroom with bath, shower, toilet and basin
    return build('bathroom', [
      [0, 0, 300, 0], [300, 0, 300, 250], [300, 250, 0, 250], [0, 250, 0, 0],
    ], [
      { wall: 3, pos: 0.3, type: 'door', width: 75 },
      { wall: 0, pos: 0.5, type: 'window', width: 80 },
    ], [], [], [[96, 48, 170, 75, 'bathtub'], [245, 55, 90, 90, 'shower'], [255, 160, 40, 70, 'toilet', 90], [150, 215, 60, 50, 'sink']], tr)
  }
  if (id === 'living') {
    // 700 x 500 cm open-plan kitchen and living room
    return build('living', [
      [0, 0, 700, 0], [700, 0, 700, 500], [700, 500, 0, 500], [0, 500, 0, 0],
    ], [
      { wall: 2, pos: 0.88, type: 'door' },
      { wall: 0, pos: 0.3, type: 'window', width: 120 },
      { wall: 1, pos: 0.5, type: 'window', width: 160 },
      { wall: 3, pos: 0.5, type: 'window', width: 120 },
    ], [], [], [
      [130, 40, 240, 60, 'kitchen'], [290, 45, 70, 70, 'fridge'],
      [180, 170, 140, 80, 'table'], [140, 232, 45, 45, 'chair'], [220, 232, 45, 45, 'chair'], [85, 170, 45, 45, 'chair'], [275, 170, 45, 45, 'chair'],
      [520, 35, 120, 40, 'tv'], [520, 250, 140, 80, 'table'], [520, 440, 200, 90, 'sofa'],
    ], tr)
  }
  if (id === 'tiny') {
    // 600 x 250 cm tiny house with kitchen, living area, sleeping nook and bathroom
    return build('tiny', [
      [0, 0, 600, 0], [600, 0, 600, 250], [600, 250, 0, 250], [0, 250, 0, 0],
      [450, 0, 450, 250],
    ], [
      { wall: 2, pos: 0.45, type: 'door' },
      { wall: 4, pos: 0.5, type: 'door', width: 70, flip: true },
      { wall: 0, pos: 0.2, type: 'window', width: 120 },
      { wall: 0, pos: 0.6, type: 'window', width: 100 },
      { wall: 3, pos: 0.35, type: 'window', width: 100 },
    ], [[380, 110, 'single']], [], [
      [130, 40, 240, 60, 'kitchen'], [285, 45, 70, 70, 'fridge'], [150, 190, 200, 90, 'sofa'],
      [535, 60, 90, 90, 'shower'], [500, 185, 40, 70, 'toilet'], [560, 200, 60, 50, 'sink'],
    ], tr)
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
  ], [[165, 130, 'queen'], [835, 130, 'queen']], [[40, 235, 60, 100], [960, 235, 60, 100]], [[850, 600, 40, 70, 'toilet'], [850, 520, 60, 50, 'sink'], [200, 560, 200, 90, 'sofa'], [500, 380, 140, 80, 'table'], [840, 420, 240, 60, 'kitchen']], tr)
}
