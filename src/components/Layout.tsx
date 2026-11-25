import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import { Wrench, Github } from 'lucide-react'
import { useEffect } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { LANGS } from '../i18n/translations'
import Flag from './Flag'

const DASHBOARD_REPO = 'https://github.com/songjiahong/deployment-dashboard'
export const SONGFINANCE_URL = 'https://www.songfinance.com/'

function LangSwitch() {
  const { lang, switchLang, t } = useI18n()
  return (
    <div className="flex items-center gap-1" role="group" aria-label={t('nav.language')}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLang(l)}
          aria-label={l === 'en' ? 'English (Australia)' : '简体中文'}
          aria-pressed={lang === l}
          title={l === 'en' ? 'English (Australia)' : '简体中文'}
          className={`p-1 rounded border transition ${
            lang === l ? 'border-primary-500 ring-1 ring-primary-300' : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <Flag lang={l} className="w-7 h-[18px] rounded-sm shadow-sm block" />
        </button>
      ))}
    </div>
  )
}

export default function Layout() {
  const { t, lp } = useI18n()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors font-medium whitespace-nowrap ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 h-14">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          <Link to={lp('/')} className="flex items-center space-x-2 group shrink-0">
            <div className="bg-primary-600 p-1.5 rounded-lg group-hover:bg-primary-700 transition-colors">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">Hexagon Tools</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6 text-sm sm:text-base">
            <NavLink to={lp('/')} end className={linkClass}>
              {t('nav.home')}
            </NavLink>
            <NavLink to={lp('/floor-plan')} className={linkClass}>
              {t('nav.floorplan')}
            </NavLink>
            <a
              href={DASHBOARD_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary-600 transition-colors font-medium inline-flex items-center gap-1"
            >
              <span className="hidden md:inline">{t('nav.dashboard')}</span>
              <span className="md:hidden">Dashboard</span>
              <Github className="w-4 h-4" />
            </a>
            <LangSwitch />
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Hexagon Tools</span>
              </div>
              <p className="text-gray-400 text-sm">{t('footer.tagline')}</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">{t('footer.tools')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to={lp('/floor-plan')} className="hover:text-primary-400">{t('nav.floorplan')}</Link></li>
                <li>
                  <a href={DASHBOARD_REPO} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400">
                    {t('nav.dashboard')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">{t('footer.legal')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to={lp('/terms')} className="hover:text-primary-400">{t('footer.terms')}</Link></li>
                <li><Link to={lp('/privacy')} className="hover:text-primary-400">{t('footer.privacy')}</Link></li>
                <li><a href="https://github.com/songjiahong/tools-home" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400">⭐ {t('footer.github')}</a></li>
                <li><a href="https://github.com/sponsors/songjiahong" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400">💖 {t('footer.sponsor')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400 space-y-1">
            <p>
              {t('footer.createdBy')}{' '}
              <a href={SONGFINANCE_URL} target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-primary-300">
                SONG FINANCE PTY LTD
              </a>
            </p>
            <p>&copy; {new Date().getFullYear()} Hexagon Tools. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
