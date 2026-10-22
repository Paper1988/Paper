const NEKOS_BEST_BASE_URL = 'https://nekos.best/api/v2'
const GIFUKAI_BASE_URL = 'https://api.gifukai.com/v1'
const REQUEST_TIMEOUT_MS = 8_000

const NEKOS_BEST_ENDPOINTS = {
    pat: 'pat',
    hug: 'hug',
    kill: 'kill',
    kiss: 'kiss',
    bite: 'bite',
    dance: 'dance',
    punch: 'punch',
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

const GIFUKAI_ENDPOINTS = {
    pat: 'pat',
    hug: 'hug',
    kiss: 'kiss',
    cry: 'cry',
} as const

export type GifAction = keyof typeof NEKOS_BEST_ENDPOINTS

interface NekosBestResponse {
    results?: Array<{
        url?: unknown
    }>
}

interface GifukaiResponse {
    url?: unknown
}

function validateGifUrl(value: unknown, provider: string): string {
    if (typeof value !== 'string') {
        throw new Error(`${provider} API returned an invalid response`)
    }

    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        throw new Error(`${provider} API returned an unsupported URL protocol`)
    }

    return url.toString()
}

async function fetchJson<T>(url: string, provider: string): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
        const response = await fetch(url, {
            method: 'GET',
            ...(provider === 'Nekos.best'
                ? { headers: { 'User-Agent': 'Paper Discord Bot (https://github.com/Paper1988/Paper)' } }
                : {}),
            signal: controller.signal,
        })

        if (!response.ok) {
            throw new Error(`${provider} API returned HTTP ${response.status}`)
        }

        return await response.json() as T
    } finally {
        clearTimeout(timeout)
    }
}

async function getNekosBestGifUrl(action: GifAction): Promise<string> {
    const data = await fetchJson<NekosBestResponse>(
        `${NEKOS_BEST_BASE_URL}/${NEKOS_BEST_ENDPOINTS[action]}`,
        'Nekos.best',
    )

    return validateGifUrl(data.results?.[0]?.url, 'Nekos.best')
}

async function getGifukaiGifUrl(action: GifAction): Promise<string> {
    const endpoint = GIFUKAI_ENDPOINTS[action as keyof typeof GIFUKAI_ENDPOINTS]
    if (!endpoint) {
        throw new Error(`Gifukai does not support the "${action}" action`)
    }

    const data = await fetchJson<GifukaiResponse>(
        `${GIFUKAI_BASE_URL}/${endpoint}`,
        'Gifukai',
    )

    return validateGifUrl(data.url, 'Gifukai')
}

export async function getGifUrl(action: GifAction): Promise<string> {
    const providers = action in GIFUKAI_ENDPOINTS
        ? [
            { name: 'Gifukai', fetch: () => getGifukaiGifUrl(action) },
            { name: 'Nekos.best', fetch: () => getNekosBestGifUrl(action) },
        ]
        : [
            { name: 'Nekos.best', fetch: () => getNekosBestGifUrl(action) },
            { name: 'Gifukai', fetch: () => getGifukaiGifUrl(action) },
        ]

    const errors: string[] = []

    for (const provider of providers) {
        try {
            return await provider.fetch()
        } catch (error) {
            errors.push(`${provider.name}: ${error instanceof Error ? error.message : String(error)}`)
            console.warn(`[GIF API] ${provider.name} failed for "${action}", trying fallback.`, error)
        }
    }

    throw new Error(`All GIF providers failed for "${action}". ${errors.join(' | ')}`)
}
