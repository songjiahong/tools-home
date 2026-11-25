import { PlanData } from './templates'

/** Share links keep the whole plan in the URL hash (#p=...), so nothing is sent to a server. */
const toB64Url = (bytes: Uint8Array) => {
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const fromB64Url = (s: string) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Response(new Blob([data as BlobPart]).stream().pipeThrough(stream as unknown as ReadableWritablePair<Uint8Array, Uint8Array>))
  return new Uint8Array(await out.arrayBuffer())
}

export async function encodePlan(plan: PlanData): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify(plan))
  if (typeof CompressionStream === 'undefined') return 'r.' + toB64Url(raw)
  return 'z.' + toB64Url(await pipe(raw, new CompressionStream('deflate-raw')))
}

export async function decodePlan(token: string): Promise<PlanData | null> {
  try {
    const [kind, body] = [token.slice(0, 2), token.slice(2)]
    let bytes: Uint8Array = fromB64Url(body)
    if (kind === 'z.') {
      if (typeof DecompressionStream === 'undefined') return null
      bytes = await pipe(bytes, new DecompressionStream('deflate-raw'))
    } else if (kind !== 'r.') return null
    const d = JSON.parse(new TextDecoder().decode(bytes))
    if (!d || !Array.isArray(d.walls)) return null
    return {
      walls: d.walls ?? [],
      openings: d.openings ?? [],
      dimensions: d.dimensions ?? [],
      beds: d.beds ?? [],
      wardrobes: d.wardrobes ?? [],
      stairs: d.stairs ?? [],
    }
  } catch {
    return null
  }
}

export function readShareToken(): string | null {
  const m = window.location.hash.match(/[#&]p=([^&]+)/)
  return m ? m[1] : null
}
