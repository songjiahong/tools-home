/** Anonymous usage events. No-op unless GA4 is configured via VITE_GA_ID. Never send drawing content. */
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] }
  }
}

function initClarity(id: string) {
  // Microsoft Clarity (heatmaps / session recordings). Official loader, id passed from env.
  if (!/^[a-z0-9]{6,20}$/i.test(id)) return
  const w = window
  w.clarity =
    w.clarity ||
    (function (...args: unknown[]) {
      ;(w.clarity!.q = w.clarity!.q || []).push(args)
    } as NonNullable<Window['clarity']>)
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.clarity.ms/tag/${id}`
  document.head.appendChild(s)
}

export function initAnalytics() {
  if (typeof document === 'undefined') return
  const clarityId = import.meta.env.VITE_CLARITY_ID as string | undefined
  if (clarityId) initClarity(clarityId)
  const id = import.meta.env.VITE_GA_ID as string | undefined
  if (!id) return
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { anonymize_ip: true })
}

export function track(event: string, params?: Record<string, string | number | boolean>) {
  try {
    window.gtag?.('event', event, params)
    window.clarity?.('event', event)
  } catch {
    /* ignore */
  }
}
