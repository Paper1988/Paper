import type { MusicAdapter, MusicAdapterEvents } from '@/Systems/Music/MusicAdapter.js'
import type { MusicSessionManager } from '@/Systems/Music/MusicSessionManager.js'
import type {
    MusicLoopMode,
    MusicPlayerOptions,
    MusicPlayerSnapshot,
    MusicSearchQuery,
    MusicSearchResult,
    MusicTrack
} from '@/Systems/Music/types.js'

/**
 * Stable Paper-owned entry point for music operations.
 *
 * Commands, components, and services should depend on this facade rather than
 * a concrete Lavalink provider. Provider selection stays inside the adapter.
 */
export class MusicManager {
    constructor(
        private readonly adapter: MusicAdapter,
        readonly sessions: MusicSessionManager
    ) {}

    initialize(): Promise<void> {
        return this.adapter.initialize()
    }

    destroy(): Promise<void> {
        return this.adapter.destroy()
    }

    search(query: MusicSearchQuery): Promise<MusicSearchResult> {
        return this.adapter.search(query)
    }

    getPlayer(guildId: string): Promise<MusicPlayerSnapshot | null> {
        return this.adapter.getPlayer(guildId)
    }

    createPlayer(options: MusicPlayerOptions): Promise<void> {
        return this.adapter.createPlayer(options)
    }

    async destroyPlayer(guildId: string, reason?: string): Promise<void> {
        await this.adapter.destroyPlayer(guildId, reason)
        this.sessions.cleanup(guildId)
    }

    connect(guildId: string, selfDeaf?: boolean): Promise<void> {
        return this.adapter.connect(guildId, selfDeaf)
    }

    play(guildId: string): Promise<void> {
        return this.adapter.play(guildId)
    }

    pause(guildId: string): Promise<void> {
        return this.adapter.pause(guildId)
    }

    resume(guildId: string): Promise<void> {
        return this.adapter.resume(guildId)
    }

    stop(guildId: string): Promise<void> {
        return this.adapter.stop(guildId)
    }

    skip(guildId: string): Promise<void> {
        return this.adapter.skip(guildId)
    }

    previous(guildId: string): Promise<void> {
        return this.adapter.previous(guildId)
    }

    seek(guildId: string, positionMs: number): Promise<void> {
        return this.adapter.seek(guildId, positionMs)
    }

    enqueue(guildId: string, tracks: MusicTrack[]): Promise<void> {
        return this.adapter.enqueue(guildId, tracks)
    }

    shuffle(guildId: string): Promise<void> {
        return this.adapter.shuffle(guildId)
    }

    setVolume(guildId: string, volume: number): Promise<void> {
        return this.adapter.setVolume(guildId, volume)
    }

    setLoop(guildId: string, mode: MusicLoopMode): Promise<void> {
        return this.adapter.setLoop(guildId, mode)
    }

    setAutoPlay(guildId: string, enabled: boolean): Promise<void> {
        return this.adapter.setAutoPlay(guildId, enabled)
    }

    on<K extends keyof MusicAdapterEvents>(
        event: K,
        listener: (payload: MusicAdapterEvents[K]) => void
    ): void {
        this.adapter.on(event, listener)
    }

    off<K extends keyof MusicAdapterEvents>(
        event: K,
        listener: (payload: MusicAdapterEvents[K]) => void
    ): void {
        this.adapter.off(event, listener)
    }
}

export default MusicManager
