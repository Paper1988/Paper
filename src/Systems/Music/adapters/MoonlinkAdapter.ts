import { Manager, Player, Track } from 'moonlink.js'
import type { MusicAdapter, MusicAdapterEvents } from '@/Systems/Music/MusicAdapter.js'
import type {
    MusicLoopMode,
    MusicPlayerOptions,
    MusicPlayerSnapshot,
    MusicSearchQuery,
    MusicSearchResult,
    MusicTrack
} from '@/Systems/Music/types.js'

type MoonlinkEventListener = (...args: any[]) => void

/**
 * Compatibility adapter for the existing Moonlink.js integration.
 *
 * Keep Moonlink-specific classes and event signatures inside this file.
 * Paper consumers should depend on MusicAdapter and normalized music types.
 */
export class MoonlinkAdapter implements MusicAdapter {
    private readonly listeners = new Map<
        keyof MusicAdapterEvents,
        Map<(...args: any[]) => void, MoonlinkEventListener>
    >()

    constructor(private readonly manager: Manager) {}

    /**
     * Moonlink's Discord.js connector owns initialization when the Discord
     * client becomes ready, so there is no separate initialization step here.
     */
    async initialize(): Promise<void> {}

    async destroy(): Promise<void> {
        await this.manager.players.destroyAll()
    }

    async search(query: MusicSearchQuery): Promise<MusicSearchResult> {
        const result = await this.manager.search({
            query: query.query,
            requester: query.requesterId
        })

        return {
            loadType: result.loadType,
            tracks: result.tracks.map((track) => this.toMusicTrack(track)),
            playlistName: result.playlistName,
            error: result.exception
                ? new Error(result.exception.message ?? 'Music search failed')
                : undefined
        }
    }

    async getPlayer(guildId: string): Promise<MusicPlayerSnapshot | null> {
        const player = this.manager.players.get(guildId)
        if (!player) return null

        return {
            guildId: player.guildId,
            voiceChannelId: player.voiceChannelId,
            textChannelId: player.textChannelId,
            connected: player.connected,
            playing: player.playing,
            paused: player.paused,
            volume: player.volume,
            position: player.current?.position ?? 0,
            currentTrack: player.current ? this.toMusicTrack(player.current) : null,
            queue: player.queue.tracks.map((track) => this.toMusicTrack(track)),
            loop: player.loop,
            autoPlay: player.autoPlay
        }
    }

    async createPlayer(options: MusicPlayerOptions): Promise<void> {
        const player = this.manager.players.create({
            guildId: options.guildId,
            voiceChannelId: options.voiceChannelId,
            textChannelId: options.textChannelId,
            volume: options.volume
        })

        if (options.loop) player.setLoop(options.loop)
        if (options.autoPlay !== undefined) player.setAutoPlay(options.autoPlay)
        if (options.volume !== undefined) player.setVolume(options.volume)
    }

    async destroyPlayer(guildId: string, reason?: string): Promise<void> {
        await this.manager.players.destroy(guildId, reason)
    }

    async connect(guildId: string, selfDeaf = true): Promise<void> {
        const player = this.requirePlayer(guildId)
        await player.connect({ selfDeaf })
    }

    async play(guildId: string): Promise<void> {
        await this.requirePlayer(guildId).play()
    }

    async pause(guildId: string): Promise<void> {
        await this.requirePlayer(guildId).pause()
    }

    async resume(guildId: string): Promise<void> {
        await this.requirePlayer(guildId).resume()
    }

    async stop(guildId: string): Promise<void> {
        await this.requirePlayer(guildId).stop()
    }

    async skip(guildId: string): Promise<void> {
        await this.requirePlayer(guildId).skip()
    }

    async previous(guildId: string): Promise<void> {
        await this.requirePlayer(guildId).back()
    }

    async seek(guildId: string, positionMs: number): Promise<void> {
        await this.requirePlayer(guildId).seek(positionMs)
    }

    async enqueue(guildId: string, tracks: MusicTrack[]): Promise<void> {
        const player = this.requirePlayer(guildId)
        player.queue.add(tracks.map((track) => this.fromMusicTrack(track)))
    }

    async shuffle(guildId: string): Promise<void> {
        this.requirePlayer(guildId).shuffle()
    }

    async setVolume(guildId: string, volume: number): Promise<void> {
        this.requirePlayer(guildId).setVolume(volume)
    }

    async setLoop(guildId: string, mode: MusicLoopMode): Promise<void> {
        this.requirePlayer(guildId).setLoop(mode)
    }

    async setAutoPlay(guildId: string, enabled: boolean): Promise<void> {
        this.requirePlayer(guildId).setAutoPlay(enabled)
    }

    on<K extends keyof MusicAdapterEvents>(
        event: K,
        listener: (payload: MusicAdapterEvents[K]) => void
    ): void {
        const wrapped = this.createEventListener(event, listener)
        const eventListeners = this.listeners.get(event) ?? new Map()
        eventListeners.set(listener, wrapped)
        this.listeners.set(event, eventListeners)
        this.eventEmitter.on(this.toMoonlinkEvent(event), wrapped)
    }

    off<K extends keyof MusicAdapterEvents>(
        event: K,
        listener: (payload: MusicAdapterEvents[K]) => void
    ): void {
        const eventListeners = this.listeners.get(event)
        const wrapped = eventListeners?.get(listener)
        if (!wrapped) return

        this.eventEmitter.off(this.toMoonlinkEvent(event), wrapped)
        eventListeners?.delete(listener)
        if (eventListeners?.size === 0) this.listeners.delete(event)
    }

    private get eventEmitter() {
        return this.manager as unknown as {
            on(event: string, listener: MoonlinkEventListener): unknown
            off(event: string, listener: MoonlinkEventListener): unknown
        }
    }

    private requirePlayer(guildId: string): Player {
        const player = this.manager.players.get(guildId)
        if (!player) throw new Error(`No music player exists for guild ${guildId}`)
        return player
    }

    private toMusicTrack(track: Track): MusicTrack {
        return {
            identifier: track.identifier,
            encoded: track.encoded,
            title: track.title,
            author: track.author,
            duration: track.duration,
            uri: track.uri ?? '',
            artworkUrl: track.artworkUrl ?? track.thumbnail ?? undefined,
            sourceName: track.sourceName,
            isStream: track.isStream,
            requesterId:
                typeof track.requester === 'string'
                    ? track.requester
                    : undefined
        }
    }

    private fromMusicTrack(track: MusicTrack): Track {
        const decoded = this.manager.decodeTrack(track.encoded)
        const moonlinkTrack = new Track(decoded)

        if (track.requesterId) moonlinkTrack.setRequester(track.requesterId)

        return moonlinkTrack
    }

    private toMoonlinkEvent(event: keyof MusicAdapterEvents): string {
        const events: Record<keyof MusicAdapterEvents, string> = {
            trackStart: 'trackStart',
            trackEnd: 'trackEnd',
            trackError: 'trackException',
            queueEnd: 'queueEnd',
            playerDestroy: 'playerDestroy',
            nodeConnect: 'nodeConnected',
            nodeDisconnect: 'nodeDisconnect',
            nodeError: 'nodeError'
        }

        return events[event]
    }

    private createEventListener<K extends keyof MusicAdapterEvents>(
        event: K,
        listener: (payload: MusicAdapterEvents[K]) => void
    ): MoonlinkEventListener {
        return (...args) => {
            const [first, second, third] = args

            switch (event) {
                case 'trackStart':
                    listener({
                        guildId: first.guildId,
                        track: this.toMusicTrack(second)
                    } as MusicAdapterEvents[K])
                    break
                case 'trackEnd':
                    listener({
                        guildId: first.guildId,
                        track: this.toMusicTrack(second),
                        reason: third
                    } as MusicAdapterEvents[K])
                    break
                case 'trackError':
                    listener({
                        guildId: first.guildId,
                        track: second ? this.toMusicTrack(second) : undefined,
                        error: third instanceof Error ? third : new Error(String(third))
                    } as MusicAdapterEvents[K])
                    break
                case 'queueEnd':
                case 'playerDestroy':
                    listener({
                        guildId: first.guildId,
                        reason: second
                    } as MusicAdapterEvents[K])
                    break
                case 'nodeConnect':
                    listener({ identifier: first.identifier } as MusicAdapterEvents[K])
                    break
                case 'nodeDisconnect':
                    listener({
                        identifier: first.identifier,
                        reason: third ? String(third) : undefined
                    } as MusicAdapterEvents[K])
                    break
                case 'nodeError':
                    listener({
                        identifier: first.identifier,
                        error: second
                    } as MusicAdapterEvents[K])
                    break
            }
        }
    }
}

export default MoonlinkAdapter
