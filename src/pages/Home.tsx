import { Link } from 'react-router-dom'
import { ExternalLink, Ruler, Sparkles, Zap, GitBranch, Github, ArrowRight, LucideIcon } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { usePageMeta, SITE } from '../i18n/usePageMeta'
import { TKey } from '../i18n/translations'

const DASHBOARD_REPO = 'https://github.com/songjiahong/deployment-dashboard'

interface Tool {
  id: string
  nameKey: TKey
  descKey: TKey
  icon: LucideIcon
  color: string
  featureKeys: TKey[]
  screenshots: string[]
  internal?: string
  external?: string
}

const tools: Tool[] = [
  {
    id: 'floorplan',
    nameKey: 'home.floorplan.name',
    descKey: 'home.floorplan.desc',
    icon: Ruler,
    color: 'bg-blue-500',
    featureKeys: ['home.floorplan.f1', 'home.floorplan.f2', 'home.floorplan.f3', 'home.floorplan.f4', 'home.floorplan.f5', 'home.floorplan.f6'],
    screenshots: ['/images/floorplan.png'],
    internal: '/floor-plan',
  },
  {
    id: 'dashboard',
    nameKey: 'home.dashboard.name',
    descKey: 'home.dashboard.desc',
    icon: GitBranch,
    color: 'bg-purple-500',
    featureKeys: ['home.dashboard.f1', 'home.dashboard.f2', 'home.dashboard.f3', 'home.dashboard.f4', 'home.dashboard.f5'],
    screenshots: ['/images/deployment-dashboard/home.png', '/images/deployment-dashboard/dashboard.png'],
    external: DASHBOARD_REPO,
  },
]

export default function Home() {
  const { t, lp } = useI18n()

  usePageMeta(t('home.title'), t('home.desc'), '/', {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Hexagon Tools',
    url: `${SITE}/`,
    publisher: { '@type': 'Organization', name: 'SONG FINANCE PTY LTD', url: 'https://www.songfinance.com/' },
  })

  const upcoming = [
    { icon: Sparkles, name: t('home.upImage'), desc: t('home.upImageDesc') },
    { icon: Zap, name: t('home.upPdf'), desc: t('home.upPdfDesc') },
  ]

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {t('home.hero1')}
            <span className="block text-primary-200 mt-2">{t('home.hero2')}</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">{t('home.heroSub')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={lp('/floor-plan')} className="btn-primary inline-flex items-center justify-center space-x-2">
              <span>{t('home.tryFloorplan')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={DASHBOARD_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center justify-center space-x-2"
            >
              <span>{t('home.viewDashboard')}</span>
              <Github className="w-5 h-5" />
            </a>
            <a href="#tools" className="bg-white text-primary-700 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center justify-center">
              {t('home.explore')}
            </a>
          </div>
        </div>
      </section>

      <section id="tools" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.available')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('home.availableSub')}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 mb-16">
            {tools.map((tool) => {
              const Icon = tool.icon
              const multi = tool.screenshots.length > 1
              const href = tool.internal ? lp(tool.internal) : tool.external!
              const Wrap = ({ children, className }: { children: React.ReactNode; className?: string }) =>
                tool.internal ? (
                  <Link to={href} className={className}>{children}</Link>
                ) : (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
                )
              return (
                <div key={tool.id} className="tool-card overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`${tool.color} p-3 rounded-xl`}><Icon className="w-10 h-10 text-white" /></div>
                          <h3 className="text-3xl font-bold text-gray-900">{t(tool.nameKey)}</h3>
                        </div>
                        <p className="text-gray-600 mb-6 leading-relaxed text-lg">{t(tool.descKey)}</p>
                        <div className="space-y-3 mb-8">
                          {tool.featureKeys.map((k) => (
                            <div key={k} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 leading-relaxed">{t(k)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Wrap className="btn-primary inline-flex items-center justify-center space-x-2 w-full sm:w-auto">
                        <span>{tool.internal ? t('home.launch') : t('home.dashboard.cta')}</span>
                        {tool.internal ? <ArrowRight className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                      </Wrap>
                    </div>
                    <div className={`space-y-3 ${multi ? 'self-start' : ''}`}>
                      {tool.screenshots.map((src, i) => (
                        <Wrap key={src} className="block">
                          <img
                            src={src}
                            alt={`${t(tool.nameKey)} ${i + 1}`}
                            loading="lazy"
                            className={`rounded-2xl shadow-2xl border-4 border-white hover:scale-[1.02] transition-transform duration-300 mx-auto ${multi && i === 0 ? 'max-h-[300px] w-auto' : 'w-full h-auto'}`}
                          />
                        </Wrap>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.coming')}</h2>
              <p className="text-lg text-gray-600">{t('home.comingSub')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map((u) => {
                const Icon = u.icon
                return (
                  <div key={u.name} className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-300 p-3 rounded-lg"><Icon className="w-8 h-8 text-gray-600" /></div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">{u.name}</h3>
                        <p className="text-gray-600">{u.desc}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[['100%', 'home.stat1'], ['NO', 'home.stat2'], ['∞', 'home.stat3']].map(([big, k]) => (
              <div key={k}>
                <div className="text-4xl font-bold text-primary-600 mb-2">{big}</div>
                <div className="text-gray-600 font-medium">{t(k as TKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('home.why')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {([['home.why1', 'home.why1d'], ['home.why2', 'home.why2d'], ['home.why3', 'home.why3d'], ['home.why4', 'home.why4d']] as [TKey, TKey][]).map(([h, d]) => (
              <div key={h} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t(h)}</h3>
                  <p className="text-gray-600 text-sm">{t(d)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">💖 {t('home.os')}</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">{t('home.osDesc')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://github.com/songjiahong/tools-home" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-lg shadow-lg">
              <span>⭐</span><span>{t('home.viewOnGithub')}</span>
            </a>
            <a href="https://github.com/sponsors/songjiahong" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg">
              <span>💖</span><span>{t('home.sponsorBtn')}</span>
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">{t('home.osNote')}</p>
        </div>
      </section>
    </div>
  )
}
