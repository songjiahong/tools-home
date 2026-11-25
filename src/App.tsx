import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'
import GuidePage from './pages/GuidePage'
import { guides } from './pages/guideContent'
import { I18nProvider } from './i18n/I18nProvider'

const FloorPlanPage = lazy(() => import('./pages/FloorPlanPage'))
const loading = <div className="p-10 text-center text-gray-500">Loading…</div>

const children = (
  <>
    <Route index element={<Home />} />
    <Route
      path="floor-plan"
      element={
        <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading…</div>}>
          <FloorPlanPage />
        </Suspense>
      }
    />
 
    <Route path="floor-plan/studio-apartment" element={<Suspense fallback={loading}><FloorPlanPage template="studio" /></Suspense>} />
    <Route path="floor-plan/1-bedroom-apartment" element={<Suspense fallback={loading}><FloorPlanPage template="one" /></Suspense>} />
    <Route path="floor-plan/2-bedroom-apartment" element={<Suspense fallback={loading}><FloorPlanPage template="two" /></Suspense>} />
 
    <Route path="floor-plan/bedroom-layout" element={<Suspense fallback={loading}><FloorPlanPage template="bedroom" /></Suspense>} />
    <Route path="floor-plan/office-layout" element={<Suspense fallback={loading}><FloorPlanPage template="office" /></Suspense>} />
    <Route path="floor-plan/3-bedroom-house" element={<Suspense fallback={loading}><FloorPlanPage template="house" /></Suspense>} />
    <Route path="floor-plan/bathroom-layout" element={<Suspense fallback={loading}><FloorPlanPage template="bathroom" /></Suspense>} />
    <Route path="floor-plan/open-plan-kitchen-living" element={<Suspense fallback={loading}><FloorPlanPage template="living" /></Suspense>} />
    <Route path="floor-plan/tiny-house" element={<Suspense fallback={loading}><FloorPlanPage template="tiny" /></Suspense>} />
    {guides.map((g) => (
      <Route key={g.slug} path={`guides/${g.slug}`} element={<GuidePage guide={g} />} />
    ))}
    <Route path="terms" element={<Terms />} />
    <Route path="privacy" element={<Privacy />} />
    <Route path="*" element={<NotFound />} />
  </>
)

function App() {
  return (
    <I18nProvider>
      <Routes>
        <Route path="/" element={<Layout />}>{children}</Route>
        <Route path="/zh" element={<Layout />}>{children}</Route>
      </Routes>
    </I18nProvider>
  )
}

export default App
