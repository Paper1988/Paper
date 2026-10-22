const API_BASE_URL = 'https://api.waifu.pics/sfw'
const REQUEST_TIMEOUT_MS = 8_000

const ENDPOINTS = {
    pat: 'pat',
    hug: 'cuddle',
    kill: 'kill',
    kiss: 'kiss',
    bite: 'bite',
    dance: 'dance',
    punch: 'bonk',
    wave: 'wave',
    smile: 'smile',
    blush: 'blush',
    cry: 'cry',
    wink: 'wink',
    highfive: 'highfive',
    handhold: 'handhold',
    glomp: 'glomp',
    poke: 'poke',
    nom: 'nom',
} as const

export type GifAction = keyof typeof ENDPOINTS

interface WaifuPicsResponse {
    url?: unknown
}

export async function getGifUrl(action: GifAction): Promise<string> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
        const response = await fetch(`${API_BASE_URL}/${ENDPOINTS[action]}`, {
            method: 'GET',
            signal: controller.signal,
        })

        if (!response.ok) {
            throw new Error(`Waifu.pics API returned HTTP ${response.status}`)
        }

        const data = (await response.json()) as WaifuPicsResponse
        if (typeof data.url !== 'string') {
            throw new Error('Waifu.pics API returned an invalid response')
        }

        const url = new URL(data.url)
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
            throw new Error('Waifu.pics API returned an unsupported URL protocol')
        }

        return url.toString()
    } finally {
        clearTimeout(timeout)
    }
}
