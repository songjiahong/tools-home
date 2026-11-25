import { createContext, useCallback, useContext, useEffect, useMemo, ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { dictionaries, Lang, TKey } from './translations'

const STORAGE_KEY = 'hp_lang'

interface I18nValue {
  lang: Lang
  t: (key: TKey) => string
  /** Prefix an internal path with the active language ("/floor-plan" -> "/zh/floor-plan"). */
  lp: (path: string) => string
  switchLang: (lang: Lang) => void
}

const I18nContext = createContext<I18nValue | null>(null)

export function stripLang(pathname: string): string {
  const stripped = pathname.replace(/^\/zh(?=\/|$)/, '')
  return stripped === '' ? '/' : stripped
}

function readStored(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'en' || v === 'zh' ? v : null
  } catch {
    return null
  }
}

function store(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* ignore (private mode etc.) */
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const lang: Lang = /^\/zh(\/|$)/.test(location.pathname) ? 'zh' : 'en'
  const basePath = stripLang(location.pathname)

  // First visit: follow the device language. After that the stored choice wins.
  useEffect(() => {
    if (readStored()) return
    const preferred = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase()
    if (lang === 'en' && preferred.startsWith('zh')) {
      store('zh')
      navigate(`/zh${basePath === '/' ? '' : basePath}${location.search}${location.hash}`, { replace: true })
    } else {
      store(lang)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en-AU'
  }, [lang])

  const t = useCallback((key: TKey) => dictionaries[lang][key] ?? dictionaries.en[key], [lang])
  const lp = useCallback(
    (path: string) => (lang === 'zh' ? `/zh${path === '/' ? '' : path}` : path),
    [lang],
  )
  const switchLang = useCallback(
    (next: Lang) => {
      store(next)
      const target = next === 'zh' ? `/zh${basePath === '/' ? '' : basePath}` : basePath
      navigate(`${target}${location.search}${location.hash}`)
    },
    [basePath, location.search, location.hash, navigate],
  )

  const value = useMemo(() => ({ lang, t, lp, switchLang }), [lang, t, lp, switchLang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
