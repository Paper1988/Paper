export interface TrackMatchMetadata {
    title?: string | null
    author?: string | null
    durationMs?: number | null
}

export interface TrackMatchAssessment {
    score: number
    titleSimilarity: number
    artistSimilarity: number
    durationSimilarity: number | null
    versionMismatch: boolean
    trusted: boolean
}

const VERSION_MARKERS = [
    /\blive\b/i,
    /\bremix\b/i,
    /\bcover\b/i,
    /\bacoustic\b/i,
    /\binstrumental\b/i,
    /\bkaraoke\b/i,
    /\bnightcore\b/i,
    /\bslowed\b/i,
    /\breverb\b/i,
    /\bsped\s*up\b/i,
    /\b8d\b/i,
    /\bpiano\s+version\b/i,
    /\borchestral\b/i,
    /\btribute\b/i
]

const METADATA_NOISE =
    /\b(official|music\s+video|lyric\s+video|lyrics?|audio|video|hd|4k|mv|visualizer|字幕版|官方版)\b/gi

function normalize(value: string): string {
    return value
        .normalize('NFKC')
        .toLowerCase()
        .replace(METADATA_NOISE, ' ')
        .replace(/[\[\]{}()【】「」『』]/g, ' ')
        .replace(/[‐‑‒–—―]/g, '-')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim()
        .replace(/\s+/g, ' ')
}

function diceCoefficient(left: Set<string>, right: Set<string>): number {
    if (left.size === 0 || right.size === 0) return 0

    let overlap = 0
    for (const token of left) {
        if (right.has(token)) overlap++
    }

    return (2 * overlap) / (left.size + right.size)
}

function characterBigrams(value: string): Set<string> {
    const chars = Array.from(value.replace(/\s/g, ''))
    if (chars.length === 1) return new Set(chars)
    const result = new Set<string>()

    for (let index = 0; index < chars.length - 1; index++) {
        result.add(chars[index] + chars[index + 1])
    }

    return result
}

function similarity(left: string, right: string): number {
    const a = normalize(left)
    const b = normalize(right)
    if (!a || !b) return 0
    if (a === b) return 1

    const tokenScore = diceCoefficient(new Set(a.split(' ')), new Set(b.split(' ')))
    const bigramScore = diceCoefficient(characterBigrams(a), characterBigrams(b))
    return Math.max(tokenScore, bigramScore)
}

function hasVersionMismatch(left: string, right: string): boolean {
    return VERSION_MARKERS.some((marker) => marker.test(left) !== marker.test(right))
}

function getDurationSimilarity(
    left?: number | null,
    right?: number | null
): number | null {
    if (!left || !right || left <= 0 || right <= 0) return null

    const difference = Math.abs(left - right) / Math.max(left, right)
    if (difference <= 0.03) return 1
    if (difference <= 0.07) return 0.85
    if (difference <= 0.12) return 0.65
    if (difference <= 0.18) return 0.35
    return 0
}

export function assessTrackMatch(
    original: TrackMatchMetadata,
    candidate: TrackMatchMetadata
): TrackMatchAssessment {
    const titleSimilarity = similarity(original.title ?? '', candidate.title ?? '')
    const artistSimilarity = similarity(original.author ?? '', candidate.author ?? '')
    const durationSimilarity = getDurationSimilarity(
        original.durationMs,
        candidate.durationMs
    )
    const versionMismatch = hasVersionMismatch(
        original.title ?? '',
        candidate.title ?? ''
    )

    const durationScore = durationSimilarity ?? 0.5
    const score =
        titleSimilarity * 0.55 + artistSimilarity * 0.3 + durationScore * 0.15

    return {
        score,
        titleSimilarity,
        artistSimilarity,
        durationSimilarity,
        versionMismatch,
        trusted:
            !versionMismatch &&
            score >= 0.78 &&
            titleSimilarity >= 0.72 &&
            artistSimilarity >= 0.45 &&
            (durationSimilarity === null || durationSimilarity >= 0.35)
    }
}
