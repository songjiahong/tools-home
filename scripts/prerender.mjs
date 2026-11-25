// Post-build: writes a static HTML shell per route/language with correct <title>, description,
// canonical, hreflang and OG tags so crawlers and link previews see them without running JS.
import { build } from 'esbuild'
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

const SITE = 'https://www.hexagonprofile.com'
const tmp = join('node_modules', '.prerender-tmp')
mkdirSync(tmp, { recursive: true })
const bundle = async (entry, out) => {
  await build({ entryPoints: [entry], outfile: join(tmp, out), bundle: true, format: 'esm', platform: 'node', logLevel: 'silent' })
  return import(pathToFileURL(join(tmp, out)).href)
}
const { dictionaries } = await bundle('src/i18n/translations.ts', 'tr.mjs')
const { terms, privacy } = await bundle('src/pages/legalContent.ts', 'legal.mjs')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const routes = [
  { path: '/', meta: (l) => [dictionaries[l]['home.title'], dictionaries[l]['home.desc']] },
  { path: '/floor-plan', meta: (l) => [dictionaries[l]['fp.title'], dictionaries[l]['fp.desc']] },
  ...[['studio-apartment', 'studio'], ['1-bedroom-apartment', 'one'], ['2-bedroom-apartment', 'two']].map(([slug, k]) => ({
    path: `/floor-plan/${slug}`,
    meta: (l) => [dictionaries[l][`fp.tplPage.${k}.title`], dictionaries[l][`fp.tplPage.${k}.desc`]],
  })),
  { path: '/terms', meta: (l) => [`${terms[l].title} | Hexagon Profile`, terms[l].metaDesc] },
  { path: '/privacy', meta: (l) => [`${privacy[l].title} | Hexagon Profile`, privacy[l].metaDesc] },
]

const base = readFileSync('dist/index.html', 'utf8')
const urlFor = (l, p) => (l === 'zh' ? `${SITE}/zh${p === '/' ? '/' : p}` : `${SITE}${p}`)

for (const r of routes) {
  for (const lang of ['en', 'zh']) {
    const [title, desc] = r.meta(lang)
    const self = urlFor(lang, r.path)
    let html = base
      .replace(/<html lang="[^"]*"/, `<html lang="${lang === 'zh' ? 'zh-CN' : 'en-AU'}"`)
      .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(desc)}"`)
      .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(title)}"`)
      .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(desc)}"`)
      .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${self}"`)
      .replace(/(<meta property="og:locale" content=")[^"]*"/, `$1${lang === 'zh' ? 'zh_CN' : 'en_AU'}"`)
      .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${esc(title)}"`)
      .replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${esc(desc)}"`)
      .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${self}" />`)
      .replace(/<link rel="alternate" hreflang="en"[^>]*>/, `<link rel="alternate" hreflang="en" href="${urlFor('en', r.path)}" />`)
      .replace(/<link rel="alternate" hreflang="zh"[^>]*>/, `<link rel="alternate" hreflang="zh" href="${urlFor('zh', r.path)}" />`)
      .replace(/<link rel="alternate" hreflang="x-default"[^>]*>/, `<link rel="alternate" hreflang="x-default" href="${urlFor('en', r.path)}" />`)
    const dir = join('dist', lang === 'zh' ? 'zh' : '', r.path === '/' ? '' : r.path)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), html)
  }
}

// sitemap with hreflang alternates
const today = new Date().toISOString().slice(0, 10)
const entries = routes.map((r) => {
  const prio = r.path === '/' ? '1.0' : r.path === '/floor-plan' ? '0.9' : r.path.startsWith('/floor-plan/') ? '0.8' : '0.3'
  return ['en', 'zh'].map((l) => `  <url>
    <loc>${urlFor(l, r.path)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${prio}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${urlFor('en', r.path)}"/>
    <xhtml:link rel="alternate" hreflang="zh" href="${urlFor('zh', r.path)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor('en', r.path)}"/>
  </url>`).join('\n')
}).join('\n')
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`)
rmSync(tmp, { recursive: true, force: true })
console.log('prerendered', routes.length * 2, 'pages + sitemap')
