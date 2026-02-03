import { Outlet, Link } from 'react-router-dom'
import { Wrench } from 'lucide-react'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Hexagon Tools</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Home
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Terms
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Privacy
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Hexagon Tools</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your collection of free, powerful online tools for productivity and creativity.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="hover:text-primary-400 transition-colors">Home</Link>
                </li>
                <li>
                  <a href="https://floorplan.hexagonprofile.com/" className="hover:text-primary-400 transition-colors">Floor Plan Tool</a>
                </li>
                <li>
                  <a href="https://deployment-dashboard.hexagonprofile.com/" className="hover:text-primary-400 transition-colors">Deployment Dashboard</a>
                </li>
                <li>
                  <a href="https://github.com/songjiahong/tools-home" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">⭐ GitHub</a>
                </li>
                <li>
                  <a href="https://github.com/sponsors/songjiahong" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">💖 Sponsor</a>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary-400 transition-colors">Terms & Conditions</Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">About</h3>
              <p className="text-gray-400 text-sm">
                Free, open-source online tools to help you work smarter and faster. No registration required. Licensed under MIT.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Hexagon Tools. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
