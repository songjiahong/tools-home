import { useState, useRef, useCallback, useEffect } from 'react'
import { Save, FolderOpen, Undo, Redo, Image, FileDown, LayoutTemplate, FilePlus, X, Link2, ImagePlus, SlidersHorizontal } from 'lucide-react'
import { Tool, Wall, Opening, Dimension, Bed, Wardrobe, Stair } from './types'
import FloorPlanCanvas from './components/FloorPlanCanvas'
import Toolbar from './components/Toolbar'
import PropertiesPanel from './components/PropertiesPanel'
import { saveFloorPlan, loadFloorPlan } from './utils/fileOperations'
import { generateFloorPlanSVG } from './utils/svgExport'
import { svgToPngBlob } from './utils/pngExport'
import { getTemplate, TemplateId, PlanData } from './templates'
import { encodePlan, decodePlan, readShareToken } from './share'
import { FURNITURE } from './furniture'
import { Unit, UNITS } from './utils/units'
import { useI18n } from '../i18n/I18nProvider'
import { TKey } from '../i18n/translations'
import { track } from '../analytics'

interface HistoryState extends PlanData {}

const STORAGE_KEY = 'hp_floorplan_autosave_v1'
const GUIDE_KEY = 'hp_floorplan_guide_seen'
const EMPTY: HistoryState = { walls: [], openings: [], dimensions: [], beds: [], wardrobes: [], stairs: [] }

function readAutosave(): HistoryState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const d = JSON.parse(raw)
    if (!d || !Array.isArray(d.walls)) return null
    const plan: HistoryState = {
      walls: d.walls ?? [],
      openings: d.openings ?? [],
      dimensions: d.dimensions ?? [],
      beds: d.beds ?? [],
      wardrobes: d.wardrobes ?? [],
      stairs: d.stairs ?? [],
    }
    const total = plan.walls.length + plan.beds.length + plan.wardrobes.length + plan.stairs.length
    return total > 0 ? plan : null
  } catch {
    return null
  }
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.download = name
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function FloorPlanEditor({ initialTemplate, heading }: { initialTemplate?: TemplateId; heading?: string }) {
  const { t } = useI18n()
  const initial = useRef<HistoryState | null>(undefined as unknown as null)
  const trKind = (k: string) => t(`fu.${k}` as TKey)
  if (initial.current === undefined) initial.current = initialTemplate ? getTemplate(initialTemplate, trKind) : readAutosave()
  const start = initial.current ?? EMPTY

  const [currentTool, setCurrentTool] = useState<Tool>('select')
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [wallThickness, setWallThickness] = useState(20)
  const [openingWidth, setOpeningWidth] = useState(90)
  const [walls, setWalls] = useState<Wall[]>(start.walls)
  const [openings, setOpenings] = useState<Opening[]>(start.openings)
  const [dimensions, setDimensions] = useState<Dimension[]>(start.dimensions)
  const [beds, setBeds] = useState<Bed[]>(start.beds)
  const [bedSize, setBedSize] = useState<'queen' | 'single'>('queen')
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>(start.wardrobes)
  const [stairs, setStairs] = useState<Stair[]>(start.stairs)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [furnitureKind, setFurnitureKind] = useState('wardrobe')
  const [furnitureText, setFurnitureText] = useState('')
  const [unit, setUnit] = useState<Unit>(() => {
    try {
      const u = localStorage.getItem('hp_floorplan_unit')
      return u === 'm' || u === 'ft' ? u : u === 'in' ? 'ft' : 'cm'
    } catch {
      return 'cm'
    }
  })
  const changeUnit = (u: Unit) => {
    setUnit(u)
    try {
      localStorage.setItem('hp_floorplan_unit', u)
    } catch {
      /* ignore */
    }
  }
  const [watermark, setWatermark] = useState(() => {
    try {
      return localStorage.getItem('hp_floorplan_watermark') === '1'
    } catch {
      return false
    }
  })
  const kindDef = FURNITURE.find((f) => f.id === furnitureKind) ?? FURNITURE[0]
  const furnitureLabel = furnitureKind === 'text' ? furnitureText || t('fu.text') : furnitureKind === 'wardrobe' ? '' : t(kindDef.key)
  const [showTemplates, setShowTemplates] = useState(false)
  const [toast, setToast] = useState<string | null>(initial.current && !initialTemplate ? t('fp.restored') : null)
  const [showGuide, setShowGuide] = useState(() => {
    try {
      return !localStorage.getItem(GUIDE_KEY)
    } catch {
      return true
    }
  })
  const startedTracked = useRef(false)

  const [history, setHistory] = useState<HistoryState[]>([start])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isUndoRedoRef = useRef(false)

  const hasContent = walls.length + beds.length + wardrobes.length + stairs.length > 0

  // toast auto-hide
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(id)
  }, [toast])

  // Autosave (debounced) + "first interaction" analytics event
  useEffect(() => {
    const pristineTemplate = !!initialTemplate && historyIndex === 0
    const id = setTimeout(() => {
      if (pristineTemplate) return
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ walls, openings, dimensions, beds, wardrobes, stairs }))
      } catch {
        /* storage full / blocked */
      }
    }, 600)
    if (hasContent && !startedTracked.current) {
      startedTracked.current = true
      track('floorplan_started')
    }
    return () => clearTimeout(id)
  }, [walls, openings, dimensions, beds, wardrobes, stairs, hasContent, initialTemplate, historyIndex])

  const applyPlan = useCallback((p: PlanData) => {
    setWalls(p.walls)
    setOpenings(p.openings)
    setDimensions(p.dimensions)
    setBeds(p.beds)
    setWardrobes(p.wardrobes)
    setStairs(p.stairs)
    setHistory([p])
    setHistoryIndex(0)
    setSelectedElementId(null)
  }, [])

  const saveToHistory = useCallback(
    (w: Wall[], o: Opening[], d: Dimension[], b: Bed[], wr: Wardrobe[], s: Stair[]) => {
      if (isUndoRedoRef.current) return
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1)
        next.push({ walls: w, openings: o, dimensions: d, beds: b, wardrobes: wr, stairs: s })
        if (next.length > 20) next.shift()
        return next
      })
      setHistoryIndex((prev) => Math.min(prev + 1, 19))
    },
    [historyIndex],
  )

  const restore = useCallback(
    (idx: number) => {
      const state = history[idx]
      isUndoRedoRef.current = true
      setWalls(state.walls)
      setOpenings(state.openings)
      setDimensions(state.dimensions)
      setBeds(state.beds)
      setWardrobes(state.wardrobes)
      setStairs(state.stairs)
      setHistoryIndex(idx)
      setTimeout(() => {
        isUndoRedoRef.current = false
      }, 0)
    },
    [history],
  )
  const undo = useCallback(() => historyIndex > 0 && restore(historyIndex - 1), [historyIndex, restore])
  const redo = useCallback(() => historyIndex < history.length - 1 && restore(historyIndex + 1), [historyIndex, history.length, restore])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  const saveCurrentStateToHistory = useCallback(() => {
    saveToHistory(walls, openings, dimensions, beds, wardrobes, stairs)
  }, [walls, openings, dimensions, beds, wardrobes, stairs, saveToHistory])

  const confirmReplace = () => !hasContent || window.confirm(t('fp.confirmReplace'))

  const handleTemplate = (id: TemplateId | 'blank') => {
    if (!confirmReplace()) return
    applyPlan(id === 'blank' ? EMPTY : getTemplate(id, trKind))
    setShowTemplates(false)
    dismissGuide()
    if (id !== 'blank') track('floorplan_template', { template: id })
  }

  const dismissGuide = () => {
    setShowGuide(false)
    try {
      localStorage.setItem(GUIDE_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  const [showPanel, setShowPanel] = useState(false)
  const [bg, setBg] = useState<{ img: HTMLImageElement; scale: number; opacity: number } | null>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)

  const handleBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      const fit = Math.min(1, 1600 / Math.max(img.width, img.height))
      setBg((old) => {
        if (old) URL.revokeObjectURL(old.img.src)
        return { img, scale: fit, opacity: 0.5 }
      })
      track('floorplan_background')
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }
  const removeBg = () => {
    setBg((old) => {
      if (old) URL.revokeObjectURL(old.img.src)
      return null
    })
  }

  const handleShare = async () => {
    if (!hasContent) return alert(t('fp.noContent'))
    const token = await encodePlan({ walls, openings, dimensions, beds, wardrobes, stairs })
    const url = `${window.location.origin}${window.location.pathname}#p=${token}`
    try {
      await navigator.clipboard.writeText(url)
      setToast(url.length > 6000 ? t('fp.shareLong') : t('fp.shareCopied'))
    } catch {
      window.prompt(t('fp.shareCopy'), url)
    }
    window.history.replaceState(null, '', `#p=${token}`)
    track('floorplan_share')
  }

  // Open a shared plan from the URL hash (takes priority over autosave / template)
  useEffect(() => {
    const token = readShareToken()
    if (!token) return
    decodePlan(token).then((p) => {
      if (p) {
        applyPlan(p)
        setToast(t('fp.sharedLoaded'))
        dismissGuide()
        track('floorplan_open_shared')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = () => {
    const name = prompt(t('fp.savePrompt'), 'my-floorplan')
    if (name) {
      saveFloorPlan(walls, openings, dimensions, beds, wardrobes, stairs, name)
      track('floorplan_save')
    }
  }

  const buildSvg = () => generateFloorPlanSVG(walls, openings, dimensions, beds, wardrobes, stairs, unit, watermark)

  const handleExportSVG = () => {
    if (!hasContent) return alert(t('fp.noContent'))
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    download(new Blob([buildSvg()], { type: 'image/svg+xml' }), `floorplan-${stamp}.svg`)
    track('floorplan_export', { format: 'svg' })
  }

  const handleExportPNG = async () => {
    if (!hasContent) return alert(t('fp.noContent'))
    try {
      const blob = await svgToPngBlob(buildSvg(), 2)
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      download(blob, `floorplan-${stamp}.png`)
      track('floorplan_export', { format: 'png' })
    } catch (err) {
      alert(String(err))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    loadFloorPlan(
      file,
      (data) => {
        applyPlan({
          walls: data.walls,
          openings: data.openings,
          dimensions: data.dimensions,
          beds: data.beds || [],
          wardrobes: data.wardrobes || [],
          stairs: data.stairs || [],
        })
        track('floorplan_load')
      },
      (error) => alert(`${t('fp.loadFail')} ${error}`),
    )
    e.target.value = ''
  }

  const btn = 'flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-sm transition-colors'

  return (
    <div className="relative flex flex-col bg-gray-100 border-b" style={{ height: 'max(560px, calc(100vh - 3.5rem))' }}>
      <div className="bg-white shadow-sm px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-800 leading-tight">{heading ?? t('fp.h1')}</h1>
          <p className="text-xs text-gray-600 hidden md:block">{t('fp.sub')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div role="radiogroup" aria-label={t('fp.unit')} title={t('fp.unit')} className="inline-flex self-center rounded-md border border-gray-300 overflow-hidden bg-white shadow-sm">
            {UNITS.map(({ id: u, label }, idx) => (
              <button
                key={u}
                type="button"
                role="radio"
                aria-checked={unit === u}
                onClick={() => changeUnit(u)}
                className={`px-3 py-1.5 text-sm font-medium tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${idx > 0 ? 'border-l border-gray-300' : ''} ${unit === u ? 'bg-primary-50 text-primary-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowTemplates(true)} className={`${btn} bg-amber-500 hover:bg-amber-600`}>
            <LayoutTemplate size={16} /> {t('fp.templates')}
          </button>
          <button onClick={() => confirmReplace() && (applyPlan(EMPTY), dismissGuide())} className={`${btn} bg-gray-500 hover:bg-gray-600`} title={t('fp.clear')}>
            <FilePlus size={16} /> <span className="hidden sm:inline">{t('fp.clear')}</span>
          </button>
          <button onClick={undo} disabled={historyIndex === 0} className={`${btn} bg-gray-500 hover:bg-gray-600 disabled:opacity-50`} title={t('fp.undo')} aria-label={t('fp.undo')}>
            <Undo size={16} />
          </button>
          <button onClick={redo} disabled={historyIndex === history.length - 1} className={`${btn} bg-gray-500 hover:bg-gray-600 disabled:opacity-50`} title={t('fp.redo')} aria-label={t('fp.redo')}>
            <Redo size={16} />
          </button>
          <button onClick={handleSave} className={`${btn} bg-blue-500 hover:bg-blue-600`}>
            <Save size={16} /> {t('fp.save')}
          </button>
          <button onClick={() => fileInputRef.current?.click()} className={`${btn} bg-green-500 hover:bg-green-600`}>
            <FolderOpen size={16} /> {t('fp.load')}
          </button>
          <button onClick={handleShare} className={`${btn} bg-teal-500 hover:bg-teal-600`}>
            <Link2 size={16} /> <span className="hidden sm:inline">{t('fp.share')}</span>
          </button>
          <button onClick={() => (bg ? removeBg() : bgInputRef.current?.click())} className={`${btn} ${bg ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'}`} title={t('fp.bgTitle')}>
            <ImagePlus size={16} /> <span className="hidden sm:inline">{bg ? t('fp.bgRemove') : t('fp.bg')}</span>
          </button>
          <button onClick={() => setShowPanel((v) => !v)} className={`${btn} bg-gray-500 hover:bg-gray-600 lg:hidden`} aria-label={t('pp.properties')}>
            <SlidersHorizontal size={16} />
          </button>
          <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgFile} className="hidden" />
          <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer select-none" title={t('fp.watermark')}>
            <input
              type="checkbox"
              checked={watermark}
              onChange={(e) => {
                setWatermark(e.target.checked)
                try {
                  localStorage.setItem('hp_floorplan_watermark', e.target.checked ? '1' : '0')
                } catch {
                  /* ignore */
                }
              }}
            />
            <span className="hidden xl:inline">{t('fp.watermark')}</span>
            <span className="xl:hidden">©</span>
          </label>
          <button onClick={handleExportPNG} className={`${btn} bg-purple-500 hover:bg-purple-600`}>
            <Image size={16} /> {t('fp.exportPng')}
          </button>
          <button onClick={handleExportSVG} className={`${btn} bg-purple-500 hover:bg-purple-600`}>
            <FileDown size={16} /> {t('fp.exportSvg')}
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <Toolbar currentTool={currentTool} onToolChange={setCurrentTool} />
        <main className="flex-1 relative min-w-0">
          {bg && (
            <div className="absolute bottom-2 left-2 z-10 bg-white/95 border border-gray-200 shadow rounded-lg p-2 text-xs flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1">{t('fp.bgOpacity')}
                <input type="range" min="0.1" max="1" step="0.05" value={bg.opacity} onChange={(e) => setBg({ ...bg, opacity: Number(e.target.value) })} />
              </label>
              <label className="flex items-center gap-1">{t('fp.bgScale')}
                <input type="range" min="0.1" max="3" step="0.05" value={bg.scale} onChange={(e) => setBg({ ...bg, scale: Number(e.target.value) })} />
              </label>
            </div>
          )}
          {(currentTool === 'wardrobe' || currentTool === 'room') && (
            <div className="absolute top-2 left-2 right-2 z-10 bg-white/95 border border-gray-200 shadow rounded-lg p-2 text-sm">
              {currentTool === 'room' ? (
                <span className="text-gray-700">{t('fp.roomHint')}</span>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  {FURNITURE.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFurnitureKind(f.id)}
                      className={`px-2.5 py-1 rounded-full border text-xs transition ${furnitureKind === f.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                      {t(f.key)}
                    </button>
                  ))}
                  {furnitureKind === 'text' && (
                    <input
                      value={furnitureText}
                      onChange={(e) => setFurnitureText(e.target.value)}
                      placeholder={t('fp.textPlaceholder')}
                      className="ml-1 px-2 py-1 border border-gray-300 rounded text-xs w-40"
                    />
                  )}
                </div>
              )}
            </div>
          )}
          <FloorPlanCanvas
            currentTool={currentTool}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onToolChange={setCurrentTool}
            wallThickness={wallThickness}
            openingWidth={openingWidth}
            walls={walls}
            setWalls={setWalls}
            openings={openings}
            setOpenings={setOpenings}
            dimensions={dimensions}
            setDimensions={setDimensions}
            beds={beds}
            setBeds={setBeds}
            bedSize={bedSize}
            wardrobes={wardrobes}
            setWardrobes={setWardrobes}
            wardrobeWidth={kindDef.w}
            wardrobeHeight={kindDef.h}
            stairs={stairs}
            setStairs={setStairs}
            stairWidth={100}
            stairHeight={300}
            saveToHistory={saveCurrentStateToHistory}
            furnitureKind={furnitureKind}
            furnitureLabel={furnitureLabel}
            unit={unit}
            backgroundImage={bg}
          />

          {!hasContent && showGuide && (
            <div className="absolute left-1/2 top-6 -translate-x-1/2 w-[min(92%,420px)] bg-white/95 border border-gray-200 shadow-lg rounded-xl p-4 z-10">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-gray-800">{t('fp.guide.title')}</h2>
                <button onClick={dismissGuide} aria-label={t('fp.tpl.close')} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <ol className="mt-2 text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>{t('fp.guide.1')}</li>
                <li>{t('fp.guide.2')}</li>
                <li>{t('fp.guide.3')}</li>
              </ol>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setShowTemplates(true)} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm">{t('fp.templates')}</button>
                <button onClick={dismissGuide} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">{t('fp.guide.dismiss')}</button>
              </div>
            </div>
          )}
          {toast && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow z-10">{toast}</div>}
        </main>

        <div className={`overflow-y-auto bg-white ${showPanel ? 'absolute right-0 top-[3.25rem] bottom-0 z-20 shadow-xl block' : 'hidden'} lg:static lg:block lg:shadow-none`}>
          <PropertiesPanel
            unit={unit}
            selectedElementId={selectedElementId}
            wallThickness={wallThickness}
            openingWidth={openingWidth}
            onWallThicknessChange={setWallThickness}
            onOpeningWidthChange={setOpeningWidth}
            walls={walls}
            setWalls={setWalls}
            openings={openings}
            setOpenings={setOpenings}
            dimensions={dimensions}
            setDimensions={setDimensions}
            beds={beds}
            setBeds={setBeds}
            bedSize={bedSize}
            onBedSizeChange={setBedSize}
            wardrobes={wardrobes}
            setWardrobes={setWardrobes}
            stairs={stairs}
            setStairs={setStairs}
            saveToHistory={saveCurrentStateToHistory}
          />
        </div>
      </div>

      {showTemplates && (
        <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center p-4" onClick={() => setShowTemplates(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90%] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">{t('fp.tpl.title')}</h2>
              <button onClick={() => setShowTemplates(false)} aria-label={t('fp.tpl.close')} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(['studio', 'one', 'two', 'bedroom', 'office', 'house', 'bathroom', 'living', 'tiny'] as const).map((id) => (
                <button key={id} onClick={() => handleTemplate(id)} className="text-left border rounded-lg p-2 hover:border-primary-500 hover:bg-primary-50 transition">
                  <img src={`/images/templates/${id}.svg`} alt="" width="200" height="120" className="w-full h-20 object-contain bg-white rounded" />
                  <div className="font-semibold text-gray-800 text-sm mt-1">{t(`fp.tpl.${id}` as TKey)}</div>
                </button>
              ))}
              <button onClick={() => handleTemplate('blank')} className="text-left border rounded-lg p-4 hover:border-primary-500 hover:bg-primary-50 transition">
                <div className="font-semibold text-gray-800">{t('fp.tpl.blank')}</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
