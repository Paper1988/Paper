const normalizeText = (value: string): string =>
    value
        .normalize('NFKC')
        .toLocaleLowerCase()
        .replace(/\b(?:official\s+(?:audio|video)|audio|video|topic)\b/g, '')
        .replace(/[^\p{L}\p{N}]/gu, '')

const VERSION_MARKERS =
    /\b(?:live|remix|remaster(?:ed)?|acoustic|instrumental|karaoke|sped\s*up|slowed|nightcore|cover|演唱會|現場版|混音|重混版|翻唱)\b/i

export interface TrackMatchInput {
    title: string
    author: string
    durationMs: number
}

export interface TrackMatchAssessment {
    trusted: boolean
    versionMismatch: boolean
    durationSimilarity: number
}

export function assessTrackMatch(
    reference: TrackMatchInput,
    candidate: TrackMatchInput
): TrackMatchAssessment {
    const versionMismatch =
        VERSION_MARKERS.test(reference.title) !== VERSION_MARKERS.test(candidate.title) ||
        VERSION_MARKERS.test(candidate.title)

    const referenceTitle = normalizeText(reference.title)
    const candidateTitle = normalizeText(candidate.title)
    const referenceAuthor = normalizeText(reference.author.replace(/\s*-\s*topic$/i, ''))
    const candidateAuthor = normalizeText(candidate.author.replace(/\s*-\s*topic$/i, ''))

    const longestDuration = Math.max(reference.durationMs, candidate.durationMs)
    const durationDifference = Math.abs(reference.durationMs - candidate.durationMs)
    const durationSimilarity =
        longestDuration > 0 && durationDifference / longestDuration <= 0.05
            ? 1 - durationDifference / longestDuration
            : 0

    const sameTitle = referenceTitle.length > 0 && referenceTitle === candidateTitle
    const sameAuthor = referenceAuthor.length > 0 && referenceAuthor === candidateAuthor

    return {
        trusted: sameTitle && sameAuthor && durationSimilarity >= 0.95 && !versionMismatch,
        versionMismatch,
        durationSimilarity
    }
}
