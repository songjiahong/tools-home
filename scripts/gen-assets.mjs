// Generates template thumbnails (SVG) and Open Graph images (SVG -> PNG via macOS qlmanage).
// Run manually after changing templates:  node scripts/gen-assets.mjs
// Outputs are committed (public/images/templates/*.svg, public/og/*.png, PWA icons).
import { build } from 'esbuild'
import { mkdirSync, writeFileSync, rmSync, readFileSync, copyFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

const tmp = join('node_modules', '.gen-tmp')
mkdirSync(tmp, { recursive: true })
const bundle = async (entry, out) => {
  await build({ entryPoints: [entry], outfile: join(tmp, out), bundle: true, format: 'esm', platform: 'node', logLevel: 'silent' })
  return import(pathToFileURL(join(tmp, out)).href + `?t=${Date.now()}`)
}
const { getTemplate } = await bundle('src/floorplan/templates.ts', 'tpl.mjs')
const { generateFloorPlanSVG } = await bundle('src/floorplan/utils/svgExport.ts', 'svg.mjs')

const IDS = ['studio', 'one', 'two', 'bedroom', 'office', 'house', 'bathroom', 'living', 'tiny']
const TITLES = {
  studio: 'Studio Apartment Floor Plan',
  one: '1-Bedroom Apartment Floor Plan',
  two: '2-Bedroom Apartment Floor Plan',
  bedroom: 'Bedroom Layout Floor Plan',
  office: 'Office Layout Floor Plan',
  house: '3-Bedroom House Floor Plan',
  bathroom: 'Bathroom Layout Floor Plan',
  living: 'Open-Plan Kitchen and Living Room Floor Plan',
  tiny: 'Tiny House Floor Plan',
}
const SLUGS = { studio: 'studio-apartment', one: '1-bedroom-apartment', two: '2-bedroom-apartment', bedroom: 'bedroom-layout', office: 'office-layout', house: '3-bedroom-house', bathroom: 'bathroom-layout', living: 'open-plan-kitchen-living', tiny: 'tiny-house' }
const NAMES = { toilet: 'Toilet', sink: 'Sink', sofa: 'Sofa', table: 'Table', kitchen: 'Kitchen', desk: 'Desk', chair: 'Chair', fridge: 'Fridge', bathtub: 'Bath', shower: 'Shower', tv: 'TV unit' }

mkdirSync('public/images/templates', { recursive: true })
mkdirSync('public/og', { recursive: true })
const ogDir = join(tmp, 'og')
mkdirSync(ogDir, { recursive: true })

const plans = {}
for (const id of IDS) {
  const p = getTemplate(id, (k) => NAMES[k] || k)
  const svg = generateFloorPlanSVG(p.walls, p.openings, p.dimensions, p.beds, p.wardrobes, p.stairs, 'cm')
  writeFileSync(`public/images/templates/${id}.svg`, svg)
  plans[id] = svg
}

const inner = (svg) => svg.replace(/<\?xml[^>]*\?>\s*/, '')
const frame = (title, sub, svg) => {
  const m = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/)
  const [vx, vy, vw, vh] = m.slice(1).map(Number)
  const box = { x: 650, y: 70, w: 500, h: 490 }
  const k = Math.min(box.w / vw, box.h / vh)
  const w = vw * k, h = vh * k
  const ox = box.x + (box.w - w) / 2, oy = box.y + (box.h - h) / 2
  const body = inner(svg).replace(/<svg[^>]*>/, `<svg x="${ox}" y="${oy}" width="${w}" height="${h}" viewBox="${vx} ${vy} ${vw} ${vh}">`)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <rect width="1200" height="1200" fill="#ffffff"/>
  <g transform="translate(0,285)">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0284c7"/><stop offset="1" stop-color="#075985"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="630" y="50" width="540" height="530" rx="24" fill="#ffffff"/>
  ${body}
  <text x="60" y="110" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="#bae6fd">HEXAGON PROFILE</text>
  ${title.map((line, i) => `<text x="60" y="${240 + i * 76}" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="800" fill="#ffffff">${line}</text>`).join('\n  ')}
  <text x="60" y="${240 + title.length * 76 + 20}" font-family="Helvetica, Arial, sans-serif" font-size="32" fill="#e0f2fe">${sub}</text>
  <rect x="60" y="500" width="360" height="64" rx="32" fill="#ffffff"/>
  <text x="240" y="543" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="28" font-weight="700" fill="#0369a1">Free · No sign-up</text>
  </g>
</svg>`
}

const og = { 'floor-plan': { title: ['2D Floor Plan', 'Maker – Free', '& Online'], sub: 'Draw, measure and export', svg: plans.two }, home: { title: ['Free Online', 'Tools'], sub: 'Floor plan maker and more', svg: plans.one } }
for (const id of IDS) og[SLUGS[id]] = { title: TITLES[id].split(' Floor Plan')[0].split(/(?<=^.{14,}?) /).slice(0, 1).concat([]) , sub: '', svg: plans[id] }
// simple explicit titles for template pages
const T2 = { studio: ['Studio Apartment', 'Floor Plan', 'Template'], one: ['1-Bedroom', 'Apartment', 'Floor Plan'], two: ['2-Bedroom', 'Apartment', 'Floor Plan'], bedroom: ['Bedroom Layout', 'Floor Plan', 'Template'], office: ['Office Layout', 'Floor Plan', 'Template'], house: ['3-Bedroom House', 'Floor Plan', 'Template'], bathroom: ['Bathroom Layout', 'Floor Plan', 'Template'], living: ['Kitchen + Living', 'Open-Plan', 'Floor Plan'], tiny: ['Tiny House', 'Floor Plan', 'Template'] }
for (const id of IDS) og[SLUGS[id]] = { title: T2[id], sub: 'Edit online for free', svg: plans[id] }

for (const [name, o] of Object.entries(og)) {
  const file = join(ogDir, `${name}.svg`)
  writeFileSync(file, frame(o.title, o.sub, o.svg))
  try {
    execFileSync('qlmanage', ['-t', '-s', '1200', '-o', ogDir, file], { stdio: 'ignore' })
    // qlmanage renders square; crop the top 1200x630 and store as JPEG
    execFileSync('sips', ['-c', '630', '1200', '-s', 'format', 'jpeg', '-s', 'formatOptions', '80', join(ogDir, `${name}.svg.png`), '--out', `public/og/${name}.jpg`], { stdio: 'ignore' })
  } catch (e) {
    console.warn('PNG conversion failed for', name, '(needs macOS qlmanage)')
  }
}

// PWA icons from favicon.svg
mkdirSync('public/icons', { recursive: true })
try {
  execFileSync('qlmanage', ['-t', '-s', '512', '-o', join(tmp), 'public/favicon.svg'], { stdio: 'ignore' })
  copyFileSync(join(tmp, 'favicon.svg.png'), 'public/icons/icon-512.png')
  execFileSync('sips', ['-z', '192', '192', 'public/icons/icon-512.png', '--out', 'public/icons/icon-192.png'], { stdio: 'ignore' })
} catch {
  console.warn('icon generation failed')
}
rmSync(tmp, { recursive: true, force: true })
console.log('assets generated')
