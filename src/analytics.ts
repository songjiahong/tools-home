/** Anonymous usage events. No-op unless GA4 is configured via VITE_GA_ID. Never send drawing content. */
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function initAnalytics() {
  const id = import.meta.env.VITE_GA_ID as string | undefined
  if (!id || typeof document === 'undefined') return
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
  } catch {
    /* ignore */
  }
}
