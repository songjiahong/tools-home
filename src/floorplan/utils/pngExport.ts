/** Rasterises the SVG produced by generateFloorPlanSVG into a PNG blob (2x for sharpness). */
export function svgToPngBlob(svg: string, scale = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
    const img = new Image()
    img.onload = () => {
      const w = Math.max(1, Math.round((img.naturalWidth || img.width) * scale))
      const h = Math.max(1, Math.round((img.naturalHeight || img.height) * scale))
      const max = 8000
      const k = Math.min(1, max / Math.max(w, h))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(w * k)
      canvas.height = Math.round(h * k)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        return reject(new Error('Canvas not supported'))
      }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not render SVG'))
    }
    img.src = url
  })
}
