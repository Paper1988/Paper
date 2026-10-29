/**
 * Remove Genius song-page metadata accidentally included before the lyrics.
 * Keep the original text when no recognizable section header is found.
 */
export function cleanGeniusLyrics(input: string): string {
    const lyrics = input.replace(/\r\n?/g, '\n').trim()
    const sectionHeader = /\[(?:intro|verse|pre[- ]?chorus|chorus|post[- ]?chorus|refrain|hook|bridge|outro|interlude|breakdown|instrumental|part|drop|spoken|skit)\b[^\]]*\]/i
    const match = sectionHeader.exec(lyrics)

    if (!match || match.index === undefined || match.index === 0) return lyrics

    const prefix = lyrics.slice(0, match.index)
    if (/\bRead More\b/i.test(prefix) || /\bContributorsTranslations\b/i.test(prefix)) {
        return lyrics.slice(match.index).trim()
    }

    return lyrics
}
