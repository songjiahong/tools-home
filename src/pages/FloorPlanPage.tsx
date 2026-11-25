import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TemplateId } from '../floorplan/templates'
import FloorPlanEditor from '../floorplan/FloorPlanEditor'
import { useI18n } from '../i18n/I18nProvider'
import { usePageMeta, SITE } from '../i18n/usePageMeta'
import { TKey } from '../i18n/translations'

export const TEMPLATE_PAGES: { id: TemplateId; slug: string; k: 'studio' | 'one' | 'two' }[] = [
  { id: 'studio', slug: 'studio-apartment', k: 'studio' },
  { id: 'one', slug: '1-bedroom-apartment', k: 'one' },
  { id: 'two', slug: '2-bedroom-apartment', k: 'two' },
]

const FAQ: [TKey, TKey][] = [
  ['fp.faq.q1', 'fp.faq.a1'],
  ['fp.faq.q2', 'fp.faq.a2'],
  ['fp.faq.q3', 'fp.faq.a3'],
  ['fp.faq.q4', 'fp.faq.a4'],
]

export default function FloorPlanPage({ template }: { template?: TemplateId }) {
  const { t, lang, lp } = useI18n()
  const tp = TEMPLATE_PAGES.find((x) => x.id === template)
  const path = tp ? `/floor-plan/${tp.slug}` : '/floor-plan'
  const title = tp ? t(`fp.tplPage.${tp.k}.title` as TKey) : t('fp.title')
  const desc = tp ? t(`fp.tplPage.${tp.k}.desc` as TKey) : t('fp.desc')
  const heading = tp ? t(`fp.tplPage.${tp.k}.h1` as TKey) : undefined

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: heading ?? t('fp.h1'),
          url: `${SITE}${lang === 'zh' ? '/zh' : ''}${path}`,
          applicationCategory: 'DesignApplication',
          operatingSystem: 'Any',
          inLanguage: lang === 'zh' ? 'zh-CN' : 'en',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          description: desc,
          screenshot: `${SITE}/images/floorplan.png`,
          publisher: { '@type': 'Organization', name: 'SONG FINANCE PTY LTD', url: 'https://www.songfinance.com/' },
        },
        {
          '@type': 'FAQPage',
          mainEntity: FAQ.map(([q, a]) => ({
            '@type': 'Question',
            name: t(q),
            acceptedAnswer: { '@type': 'Answer', text: t(a) },
          })),
        },
      ],
    }),
    [t, lang, path, desc, heading],
  )

  usePageMeta(title, desc, path, jsonLd)

  return (
    <div>
      <FloorPlanEditor key={template ?? 'blank'} initialTemplate={template} heading={heading} />
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('fp.about.h2')}</h2>
        <p className="text-gray-700 leading-relaxed mb-10">{t('fp.about.p')}</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('fp.moreTemplates')}</h2>
        <ul className="mb-10 space-y-1">
          {TEMPLATE_PAGES.map((x) => (
            <li key={x.id}>
              <Link className="text-primary-600 hover:underline" to={lp(`/floor-plan/${x.slug}`)}>{t(`fp.tpl.${x.k}` as TKey)}</Link>
            </li>
          ))}
        </ul>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('fp.faq.h2')}</h2>
        <div className="space-y-4">
          {FAQ.map(([q, a]) => (
            <div key={q}>
              <h3 className="font-semibold text-gray-900">{t(q)}</h3>
              <p className="text-gray-700">{t(a)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
