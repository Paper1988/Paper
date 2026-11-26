export interface MusicSession {
    guildId: string
    controllerMessageId?: string
    progressUpdater?: NodeJS.Timeout
    queueEndTimeout?: NodeJS.Timeout
}

/**
 * Stores Paper-owned music state independently from the underlying player implementation.
 */
export class MusicSessionManager {
    private readonly sessions = new Map<string, MusicSession>()

    get(guildId: string): MusicSession {
        let session = this.sessions.get(guildId)

        if (!session) {
            session = { guildId }
            this.sessions.set(guildId, session)
        }

        return session
    }

    getControllerMessageId(guildId: string): string | undefined {
        return this.sessions.get(guildId)?.controllerMessageId
    }

    setControllerMessageId(guildId: string, messageId?: string): void {
        this.get(guildId).controllerMessageId = messageId
    }

    setProgressUpdater(guildId: string, timer: NodeJS.Timeout): void {
        const session = this.get(guildId)
        this.clearProgressUpdater(guildId)
        session.progressUpdater = timer
    }

    clearProgressUpdater(guildId: string): void {
        const session = this.sessions.get(guildId)
        if (!session?.progressUpdater) return

        clearInterval(session.progressUpdater)
        session.progressUpdater = undefined
    }

    setQueueEndTimeout(guildId: string, timer: NodeJS.Timeout): void {
        const session = this.get(guildId)
        this.clearQueueEndTimeout(guildId)
        session.queueEndTimeout = timer
    }

    clearQueueEndTimeout(guildId: string): void {
        const session = this.sessions.get(guildId)
        if (!session?.queueEndTimeout) return

        clearTimeout(session.queueEndTimeout)
        session.queueEndTimeout = undefined
    }

    cleanup(guildId: string): void {
        this.clearProgressUpdater(guildId)
        this.clearQueueEndTimeout(guildId)
        this.sessions.delete(guildId)
    }
}

export default MusicSessionManager
