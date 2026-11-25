import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'

export default function NotFound() {
  const { t, lp } = useI18n()
  return (
    <div className="py-24 text-center">
      <meta name="robots" content="noindex" />
      <h1 className="text-3xl font-bold mb-4">{t('notfound.title')}</h1>
      <Link to={lp('/')} className="text-primary-600 underline">{t('notfound.back')}</Link>
    </div>
  )
}
