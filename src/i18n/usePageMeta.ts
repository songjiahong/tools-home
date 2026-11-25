import { useEffect } from 'react'
import { useI18n } from './I18nProvider'

export const SITE = 'https://www.hexagonprofile.com'

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string, hreflang?: string) {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector<HTMLLinkElement>(sel)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    if (hreflang) el.hreflang = hreflang
    document.head.appendChild(el)
  }
  el.href = href
}

/** Updates title/description/canonical/hreflang/OG for the current page and language. `path` is the language-neutral path, e.g. "/floor-plan". */
export function usePageMeta(title: string, description: string, path: string, jsonLd?: object, image?: string) {
  const { lang } = useI18n()
  useEffect(() => {
    const tail = path === '/' ? '/' : path
    const en = `${SITE}${tail}`
    const zh = `${SITE}/zh${path === '/' ? '/' : path}`
    const self = lang === 'zh' ? zh : en
    document.title = title
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', self)
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', lang === 'zh' ? 'zh_CN' : 'en_AU')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    if (image) {
      setMeta('meta[property="og:image"]', 'property', 'og:image', `${SITE}${image}`)
      setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', `${SITE}${image}`)
    }
    setLink('canonical', self)
    setLink('alternate', en, 'en')
    setLink('alternate', zh, 'zh')
    setLink('alternate', en, 'x-default')

    let script: HTMLScriptElement | null = null
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset.pageLd = '1'
      script.text = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
    return () => {
      script?.remove()
    }
  }, [lang, title, description, path, jsonLd, image])
}
