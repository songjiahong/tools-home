import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { usePageMeta, SITE } from '../i18n/usePageMeta'
import { Guide } from './guideContent'

export default function GuidePage({ guide }: { guide: Guide }) {
  const { lang, lp } = useI18n()
  const c = guide.content[lang]
  const path = `/guides/${guide.slug}`
  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: c.h1,
      description: c.desc,
      inLanguage: lang === 'zh' ? 'zh-CN' : 'en',
      mainEntityOfPage: `${SITE}${lang === 'zh' ? '/zh' : ''}${path}`,
      author: { '@type': 'Organization', name: 'SONG FINANCE PTY LTD' },
      publisher: { '@type': 'Organization', name: 'Hexagon Profile' },
    }),
    [c, lang, path],
  )
  usePageMeta(`${c.title} | Hexagon Profile`, c.desc, path, jsonLd, guide.ogImage)
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{c.h1}</h1>
      <p className="text-lg text-gray-700 mb-8">{c.intro}</p>
      {c.sections.map((s) => (
        <section key={s.h} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{s.h}</h2>
          {s.p?.map((x) => <p key={x} className="text-gray-700 leading-relaxed mb-3">{x}</p>)}
          {s.ol && <ol className="list-decimal list-inside space-y-2 text-gray-700">{s.ol.map((x) => <li key={x}>{x}</li>)}</ol>}
          {s.ul && <ul className="list-disc list-inside space-y-2 text-gray-700">{s.ul.map((x) => <li key={x}>{x}</li>)}</ul>}
        </section>
      ))}
      <Link to={lp('/floor-plan')} className="btn-primary inline-block">{c.cta}</Link>
    </article>
  )
}
