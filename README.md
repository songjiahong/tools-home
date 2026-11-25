# Hexagon Profile (hexagonprofile.com)

A modern, open-source portal for free online tools. SEO-optimized and built with React.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

- 🎨 Modern, responsive UI with TailwindCSS
- 🔍 SEO optimized with meta tags and structured data
- 🛠️ Multiple free tools in one place
- 📱 Mobile-friendly design
- 📄 Legal pages (Terms & Conditions, Privacy Policy)
- 💖 Open source

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit http://localhost:3000

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🛠️ Tools Included

1. **Floor Plan Designer** - Professional 2D floor plan editor with walls, doors, windows, furniture, and real-time dimensions
   - URL: https://floorplan.hexagonprofile.com/
   - Features: Interactive drawing, smart snapping, save/load, keyboard shortcuts

2. **Bitbucket Deployment Dashboard** - Monitor and manage Bitbucket deployments with OAuth authentication
   - URL: https://deployment-dashboard.hexagonprofile.com/
   - Features: OAuth authentication, real-time status, manual triggers, multi-workspace support

More tools coming soon!

## 💻 Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- Lucide Icons

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💖 Support

If you find these tools useful, consider [sponsoring on GitHub](https://github.com/sponsors/songjiahong) to help maintain and improve them.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 🔗 Links

- Website: https://www.hexagonprofile.com/
- GitHub: https://github.com/songjiahong/tools-home
- Sponsor: https://github.com/sponsors/songjiahong


## Structure

- `/` and `/zh/` – home (English, Simplified Chinese; English uses the Australian flag in the menu)
- `/floor-plan` and `/zh/floor-plan` – the 2D floor plan maker (`src/floorplan/`)
- `/terms`, `/privacy` – legal pages (content in `src/pages/legalContent.ts`)
- Bitbucket Deployment Dashboard is no longer hosted; the menu and home page link to
  https://github.com/songjiahong/deployment-dashboard

Translations live in `src/i18n/translations.ts`. `npm run build` also runs `scripts/prerender.mjs`,
which writes per-route/per-language HTML shells (title, description, canonical, hreflang) and `sitemap.xml`.

Optional analytics: set `VITE_GA_ID` (GA4 measurement id) at build time. Events: `floorplan_started`,
`floorplan_template`, `floorplan_export`, `floorplan_save`, `floorplan_load`.

Hosting needs an SPA fallback: unknown paths should serve `/index.html` (status 200) after static files are tried.
