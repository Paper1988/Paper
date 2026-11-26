import type {
    MusicLoopMode,
    MusicPlayerOptions,
    MusicPlayerSnapshot,
    MusicSearchQuery,
    MusicSearchResult,
    MusicTrack
} from './types.js'

/**
 * Provider-neutral boundary for Paper's music subsystem.
 *
 * Implementations may use Moonlink, lavalink-client, or another Lavalink
 * client, but provider-specific classes must not cross this interface.
 */
export interface MusicAdapter {
    initialize(): Promise<void>
    destroy(): Promise<void>

    search(query: MusicSearchQuery): Promise<MusicSearchResult>

    getPlayer(guildId: string): Promise<MusicPlayerSnapshot | null>
    createPlayer(options: MusicPlayerOptions): Promise<void>
    destroyPlayer(guildId: string, reason?: string): Promise<void>

    connect(guildId: string, selfDeaf?: boolean): Promise<void>
    play(guildId: string): Promise<void>
    pause(guildId: string): Promise<void>
    resume(guildId: string): Promise<void>
    stop(guildId: string): Promise<void>
    skip(guildId: string): Promise<void>
    previous(guildId: string): Promise<void>
    seek(guildId: string, positionMs: number): Promise<void>

    enqueue(guildId: string, tracks: MusicTrack[]): Promise<void>
    shuffle(guildId: string): Promise<void>
    setVolume(guildId: string, volume: number): Promise<void>
    setLoop(guildId: string, mode: MusicLoopMode): Promise<void>
    setAutoPlay(guildId: string, enabled: boolean): Promise<void>

    on<K extends keyof MusicAdapterEvents>(
        event: K,
        listener: (payload: MusicAdapterEvents[K]) => void
    ): void
    off<K extends keyof MusicAdapterEvents>(
        event: K,
        listener: (payload: MusicAdapterEvents[K]) => void
    ): void
}

export interface MusicAdapterEvents {
    trackStart: { guildId: string; track: MusicTrack }
    trackEnd: { guildId: string; track: MusicTrack; reason?: string }
    trackError: { guildId: string; track?: MusicTrack; error: Error }
    queueEnd: { guildId: string }
    playerDestroy: { guildId: string; reason?: string }
    nodeConnect: { identifier: string }
    nodeDisconnect: { identifier: string; reason?: string }
    nodeError: { identifier: string; error: Error }
}
