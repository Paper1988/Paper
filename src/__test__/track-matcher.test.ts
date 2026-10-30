import { expect } from 'chai'
import { describe, it } from 'mocha'
import { assessTrackMatch } from '@/Systems/Music/TrackMatcher.js'

describe('Track fallback matching', function () {
    it('accepts the same recording when only upload metadata differs', function () {
        const result = assessTrackMatch(
            {
                title: 'deja vu',
                author: 'Olivia Rodrigo',
                durationMs: 215000
            },
            {
                title: 'deja vu (Official Audio)',
                author: 'Olivia Rodrigo - Topic',
                durationMs: 216000
            }
        )

        expect(result.trusted).to.equal(true)
    })

    it('rejects a different version such as a live recording', function () {
        const result = assessTrackMatch(
            {
                title: 'deja vu',
                author: 'Olivia Rodrigo',
                durationMs: 215000
            },
            {
                title: 'deja vu (Live)',
                author: 'Olivia Rodrigo',
                durationMs: 230000
            }
        )

        expect(result.versionMismatch).to.equal(true)
        expect(result.trusted).to.equal(false)
    })

    it('rejects a remix even when the title and artist are similar', function () {
        const result = assessTrackMatch(
            {
                title: 'Song Name',
                author: 'Artist',
                durationMs: 200000
            },
            {
                title: 'Song Name Remix',
                author: 'Artist',
                durationMs: 200000
            }
        )

        expect(result.trusted).to.equal(false)
    })

    it('rejects a different song by the same artist', function () {
        const result = assessTrackMatch(
            {
                title: 'First Song',
                author: 'Same Artist',
                durationMs: 200000
            },
            {
                title: 'Completely Different Song',
                author: 'Same Artist',
                durationMs: 200000
            }
        )

        expect(result.trusted).to.equal(false)
    })

    it('rejects a candidate with a substantially different duration', function () {
        const result = assessTrackMatch(
            {
                title: 'Same Song',
                author: 'Same Artist',
                durationMs: 200000
            },
            {
                title: 'Same Song',
                author: 'Same Artist',
                durationMs: 260000
            }
        )

        expect(result.durationSimilarity).to.equal(0)
        expect(result.trusted).to.equal(false)
    })

    it('supports CJK titles', function () {
        const result = assessTrackMatch(
            {
                title: '秒針を噛む',
                author: 'ずっと真夜中でいいのに。',
                durationMs: 250000
            },
            {
                title: '秒針を噛む',
                author: 'ずっと真夜中でいいのに',
                durationMs: 251000
            }
        )

        expect(result.trusted).to.equal(true)
    })
})
