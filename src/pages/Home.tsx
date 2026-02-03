import { ExternalLink, Ruler, Sparkles, Zap, LucideIcon, GitBranch } from 'lucide-react'

interface Tool {
  id: number
  name: string
  description: string
  icon: LucideIcon
  url: string
  color: string
  features: string[]
  screenshots?: string[]
}

interface UpcomingTool {
  name: string
  description: string
  icon: LucideIcon
}

export default function Home() {
  const tools: Tool[] = [
    {
      id: 1,
      name: 'Floor Plan Designer',
      description: 'A modern, interactive floor plan editor for creating professional 2D floor plans. Draw walls with precision, add doors and windows, place furniture, and measure dimensions in real-time. Perfect for architects, interior designers, real estate professionals, home renovation planning, and office layouts. Features smart snapping, auto-alignment, and save/load functionality.',
      icon: Ruler,
      url: 'https://floorplan.hexagonprofile.com/',
      color: 'bg-blue-500',
      screenshots: ['/images/floorplan.png'],
      features: [
        'Draw walls with adjustable thickness (5-50 cm) and smart snapping to endpoints and midpoints',
        'Add doors with arc swing animation and windows with glass panes - fully customizable widths (30-300 cm)',
        'Place furniture including Queen (160×200cm) and Single (100×200cm) beds',
        'Add dimension lines between any two points with real-time measurements in centimeters',
        'Edit mode: drag wall endpoints, move doors/windows along walls, and adjust all properties',
        'Grid snapping for precise alignment and connected walls that move together',
        'Save your floor plans as JSON files and load them later - all elements preserved',
        'Keyboard shortcuts: Delete to remove elements, Escape to cancel operations'
      ]
    },
    {
      id: 2,
      name: 'Bitbucket Deployment Dashboard',
      description: 'A modern web application for managing and monitoring Bitbucket deployments with OAuth authentication. Streamline your CI/CD workflow with real-time deployment tracking, manual deployment triggers, and comprehensive project management. Perfect for development teams, DevOps engineers, and project managers who need centralized control over their Bitbucket pipelines and deployments.',
      icon: GitBranch,
      url: 'https://deployment-dashboard.hexagonprofile.com/',
      color: 'bg-purple-500',
      screenshots: ['/images/deployment-dashboard/home.png', '/images/deployment-dashboard/dashboard.png'],
      features: [
        'Secure Bitbucket OAuth authentication - users sign in with their Bitbucket credentials, no manual token creation needed',
        'Dashboard overview displaying all projects and repositories in one centralized location',
        'Real-time deployment status monitoring with color-coded badges (Success, Failed, In Progress, Unknown)',
        'Manual deployment triggers - deploy directly from the dashboard with a single click',
        'Project management - add or remove projects/repositories from your dashboard view',
        'Multi-workspace support - switch between different Bitbucket workspaces seamlessly',
        'Pipeline monitoring with build numbers, branches, and deployment environments'
      ]
    }
  ]

  const upcomingTools: UpcomingTool[] = [
    {
      name: 'Image Optimizer',
      description: 'Compress and optimize images without losing quality',
      icon: Sparkles
    },
    {
      name: 'PDF Converter',
      description: 'Convert documents to and from PDF format',
      icon: Zap
    }
  ]

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Free Online Tools
              <span className="block text-primary-200 mt-2">For Everyone</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Access powerful, easy-to-use tools right in your browser. No registration, no downloads, completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://floorplan.hexagonprofile.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center justify-center space-x-2"
              >
                <span>Try Floor Plan Tool</span>
                <ExternalLink className="w-5 h-5" />
              </a>
              <a 
                href="https://deployment-dashboard.hexagonprofile.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center justify-center space-x-2"
              >
                <span>Try Deployment Dashboard</span>
                <ExternalLink className="w-5 h-5" />
              </a>
              <a 
                href="#tools" 
                className="bg-white text-primary-700 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center justify-center"
              >
                Explore All Tools
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="tools" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Available Tools</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start using our free tools instantly. More tools are being added regularly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-16">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <div key={tool.id} className="tool-card overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`${tool.color} p-3 rounded-xl`}>
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-3xl font-bold text-gray-900">{tool.name}</h3>
                        </div>
                        
                        <p className="text-gray-600 mb-6 leading-relaxed text-lg">{tool.description}</p>
                        
                        <div className="space-y-3 mb-8">
                          {tool.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 leading-relaxed">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <a 
                        href={tool.url}
                        className="btn-primary inline-flex items-center justify-center space-x-2 w-full sm:w-auto"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>Launch Tool</span>
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                    
                    <div className={`relative h-full flex ${tool.screenshots && tool.screenshots.length > 1 ? 'items-start' : 'items-center'} justify-center`}>
                      <div className={`w-full ${tool.screenshots && tool.screenshots.length > 1 ? 'space-y-3' : ''}`}>
                        {tool.screenshots?.map((screenshot, idx) => (
                          <div key={idx} className={`relative group ${tool.screenshots && tool.screenshots.length > 1 && idx === 0 ? 'flex justify-center' : ''}`}>
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                            <div className={`relative ${tool.screenshots && tool.screenshots.length > 1 && idx === 0 ? 'w-auto' : 'w-full'}`}>
                              <a 
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img 
                                  src={screenshot} 
                                  alt={`${tool.name} Screenshot ${idx + 1}`}
                                  className={`${tool.screenshots && tool.screenshots.length > 1 && idx === 0 ? 'h-auto max-h-[300px] w-auto' : 'w-full h-auto'} rounded-2xl shadow-2xl border-4 border-white group-hover:scale-[1.02] transition-transform duration-300`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
              <p className="text-lg text-gray-600">More powerful tools are on the way</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingTools.map((tool, idx) => {
                const Icon = tool.icon
                return (
                  <div key={idx} className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-300 p-3 rounded-lg">
                        <Icon className="w-8 h-8 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">{tool.name}</h3>
                        <p className="text-gray-600">{tool.description}</p>
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
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
                <div className="text-gray-600 font-medium">Free</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">NO</div>
                <div className="text-gray-600 font-medium">Registration Required</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">∞</div>
                <div className="text-gray-600 font-medium">Unlimited Usage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Our Tools?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">No Installation Needed</h3>
                  <p className="text-gray-600 text-sm">All tools run directly in your browser. Start working immediately.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Privacy Focused</h3>
                  <p className="text-gray-600 text-sm">Your data stays on your device. We don't track or store your work.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Always Updated</h3>
                  <p className="text-gray-600 text-sm">Get the latest features automatically without any updates.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Cross-Platform</h3>
                  <p className="text-gray-600 text-sm">Works on Windows, Mac, Linux, and mobile devices.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">💖 Open Source</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            These tools are completely free, open-source (MIT License), and available for everyone. If you find them useful, consider sponsoring to help keep them running and support future development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://github.com/songjiahong/tools-home"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>⭐</span>
              <span>View on GitHub</span>
            </a>
            <a 
              href="https://github.com/sponsors/songjiahong"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>💖</span>
              <span>Sponsor on GitHub</span>
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Open source MIT License • Your support helps maintain and improve these free tools
          </p>
        </div>
      </section>
    </div>
  )
}
