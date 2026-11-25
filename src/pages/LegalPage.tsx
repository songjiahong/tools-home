import { FileText, Shield } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { usePageMeta } from '../i18n/usePageMeta'
import { LegalDoc } from './legalContent'

export default function LegalPage({ doc, kind, path }: { doc: Record<'en' | 'zh', LegalDoc>; kind: 'terms' | 'privacy'; path: string }) {
  const { lang, t } = useI18n()
  const d = doc[lang]
  const Icon = kind === 'terms' ? FileText : Shield
  usePageMeta(`${d.title} | Hexagon Profile`, d.metaDesc, path)

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-primary-100 p-3 rounded-lg"><Icon className="w-8 h-8 text-primary-600" /></div>
            <h1 className="text-4xl font-bold text-gray-900">{d.title}</h1>
          </div>
          <div className="text-sm text-gray-500 mb-8">{d.updated}</div>
          {lang === 'zh' && <p className="text-sm text-gray-500 mb-8 bg-gray-50 rounded p-3">{t('legal.notice')}</p>}
          <div className="space-y-8">
            {d.sections.map((s) => (
              <section key={s.h}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{s.h}</h2>
                {s.p?.map((x) => <p key={x} className="text-gray-700 leading-relaxed mb-4">{x}</p>)}
                {s.ul && <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">{s.ul.map((x) => <li key={x}>{x}</li>)}</ul>}
                {s.sub?.map((b) => (
                  <div key={b.h}>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{b.h}</h3>
                    {b.p?.map((x) => <p key={x} className="text-gray-700 leading-relaxed mb-4">{x}</p>)}
                    {b.ul && <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">{b.ul.map((x) => <li key={x}>{x}</li>)}</ul>}
                  </div>
                ))}
              </section>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-primary-50 rounded-lg p-6">
              {d.footer.h && <h3 className="font-semibold text-gray-900 mb-2">{d.footer.h}</h3>}
              <p className="text-sm text-gray-700">{d.footer.p}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
