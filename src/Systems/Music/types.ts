export type MusicLoopMode = 'off' | 'track' | 'queue'

/**
 * Normalized track data consumed by Paper's commands and UI.
 * No Lavalink-client or provider-specific track object should escape an adapter.
 */
export interface MusicTrack {
    identifier: string
    title: string
    author: string
    duration: number
    uri: string
    artworkUrl?: string
    sourceName: string
    isStream: boolean
    requesterId?: string
}

export interface MusicSearchQuery {
    query: string
    requesterId: string
}

export interface MusicSearchResult {
    loadType: 'track' | 'search' | 'playlist' | 'empty' | 'error'
    tracks: MusicTrack[]
    playlistName?: string
    error?: Error
}

export interface MusicPlayerOptions {
    guildId: string
    voiceChannelId: string
    textChannelId: string
    selfDeaf?: boolean
    volume?: number
    autoPlay?: boolean
    loop?: MusicLoopMode
}

export interface MusicPlayerSnapshot {
    guildId: string
    voiceChannelId: string
    textChannelId: string
    connected: boolean
    playing: boolean
    paused: boolean
    volume: number
    position: number
    currentTrack: MusicTrack | null
    queue: MusicTrack[]
    loop: MusicLoopMode
    autoPlay: boolean
}
