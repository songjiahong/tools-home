import { ExternalLink, Ruler, Sparkles, Zap } from 'lucide-react'

export default function Home() {
  const tools = [
    {
      id: 1,
      name: 'Floor Plan Designer',
      description: 'Create professional 2D floor plans with ease. Draw walls, add windows, doors, and furniture. Perfect for home design, office layouts, and renovation planning.',
      icon: Ruler,
      url: 'https://floorplan.hexagonprofile.com/',
      color: 'bg-blue-500',
      features: ['Draw walls & rooms', 'Add windows & doors', 'Drag & drop furniture', 'Export your designs']
    }
  ]

  const upcomingTools = [
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
                className="btn-primary inline-flex items-center justify-center space-x-2"
              >
                <span>Try Floor Plan Tool</span>
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
                <div key={tool.id} className="tool-card">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className={`${tool.color} p-4 rounded-xl inline-block`}>
                        <Icon className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{tool.name}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{tool.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {tool.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <a 
                        href={tool.url}
                        className="btn-primary inline-flex items-center space-x-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>Launch Tool</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
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
                <div className="text-gray-600 font-medium">Free Forever</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">0</div>
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
    </div>
  )
}
