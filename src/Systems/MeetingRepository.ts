import Meeting from '@/Structures/Schemas/Meeting.js'
import {
    type MeetingDoc,
    MeetingStatus,
    ActionStatus,
    type AgendaItem,
    type ActionItem,
    type ChecklistItem,
    type MeetingNote
} from '@/typings/meeting.js'
import { generateId } from '@/libs/meeting/utils.js'
import { DEFAULT_CHECKLIST } from '@/libs/meeting/constants.js'
import { safeDbOperation } from '@/libs/utils/dbHealthCheck.js'

export class MeetingRepository {
    // ==================== Meeting CRUD Operations ====================

    /**
     * Create a new meeting
     */
    static async createMeeting(data: {
        guildId: string
        channelId: string
        creatorId: string
        title: string
        scheduledAt?: Date
        durationMinutes: number
        participants: string[]
        locale?: string
    }): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            const meetingId = generateId(16)

            // Check if creator already has too many active meetings in this guild
            const activeCount = await Meeting.countDocuments({
                guildId: data.guildId,
                creatorId: data.creatorId,
                status: { $in: [MeetingStatus.SCHEDULED, MeetingStatus.IN_PROGRESS] }
            })

            if (activeCount >= 3) {
                throw new Error('您在此伺服器中已有太多進行中的會議')
            }

            // Initialize default checklist
            const checklist: ChecklistItem[] = DEFAULT_CHECKLIST.map((item) => ({
                id: generateId(8),
                ...item
            }))

            const meeting = new Meeting<MeetingDoc>({
                meetingId,
                ...data,
                checklist,
                status: MeetingStatus.SCHEDULED,
                agenda: [],
                timers: {},
                notes: [],
                actions: [],
                lastUpdatedAt: new Date(),
                locale: data.locale || 'zh-TW'
            })

            return await meeting.save()
        })
        return result ?? null
    }

    /**
     * Get meeting by ID
     */
    static async getMeetingById(meetingId: string): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            return await Meeting.findOne({ meetingId })
        })
        return result ?? null
    }

    /**
     * Get meetings by guild and status
     */
    static async getMeetingsByGuild(
        guildId: string,
        status?: MeetingStatus,
        limit: number = 10
    ): Promise<MeetingDoc[]> {
        const result = await safeDbOperation(async () => {
            const query: any = { guildId }
            if (status) query.status = status

            return await Meeting.find(query).sort({ scheduledAt: 1, createdAt: 1 }).limit(limit)
        }, [])
        return result ?? []
    }

    /**
     * Update meeting basic info
     */
    static async updateMeeting(
        meetingId: string,
        updates: Partial<
            Pick<
                MeetingDoc,
                'title' | 'scheduledAt' | 'durationMinutes' | 'participants' | 'messageId'
            >
        >
    ): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            return await Meeting.findOneAndUpdate(
                { meetingId },
                { $set: { ...updates, lastUpdatedAt: new Date() } },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    /**
     * Start meeting
     */
    static async startMeeting(meetingId: string): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            return await Meeting.findOneAndUpdate(
                { meetingId, status: MeetingStatus.SCHEDULED },
                { $set: { status: MeetingStatus.IN_PROGRESS, lastUpdatedAt: new Date() } },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    /**
     * End meeting
     */
    static async endMeeting(meetingId: string): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            const now = new Date()
            return await Meeting.findOneAndUpdate(
                { meetingId },
                {
                    $set: {
                        status: MeetingStatus.ENDED,
                        closedAt: now,
                        lastUpdatedAt: now
                    }
                },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    /**
     * Archive old ended meetings
     */
    static async archiveOldMeetings(): Promise<number> {
        const result = await safeDbOperation(async () => {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const dbResult = await Meeting.updateMany(
                {
                    status: MeetingStatus.ENDED,
                    closedAt: { $lt: thirtyDaysAgo }
                },
                { $set: { status: MeetingStatus.ARCHIVED } }
            )

            return dbResult.modifiedCount
        }, 0)
        return result ?? 0
    }

    // ==================== Agenda Operations ====================

    /**
     * Add agenda item
     */
    static async addAgendaItem(
        meetingId: string,
        agendaItem: Omit<AgendaItem, 'id'>
    ): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            const item: AgendaItem = {
                id: generateId(8),
                ...agendaItem
            }

            return await Meeting.findOneAndUpdate(
                { meetingId },
                {
                    $push: { agenda: item },
                    $set: { lastUpdatedAt: new Date() }
                },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    /**
     * Update agenda item
     */
    static async updateAgendaItem(
        meetingId: string,
        agendaItemId: string,
        updates: Partial<Omit<AgendaItem, 'id'>>
    ): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            const updateFields: any = { lastUpdatedAt: new Date() }

            Object.entries(updates).forEach(([key, value]) => {
                updateFields[`agenda.$.${key}`] = value
            })

            return await Meeting.findOneAndUpdate(
                { meetingId, 'agenda.id': agendaItemId },
                { $set: updateFields },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    /**
     * Remove agenda item
     */
    static async removeAgendaItem(
        meetingId: string,
        agendaItemId: string
    ): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            return await Meeting.findOneAndUpdate(
                { meetingId },
                {
                    $pull: { agenda: { id: agendaItemId } },
                    $set: { lastUpdatedAt: new Date() }
                },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    // ==================== Checklist Operations ====================

    /**
     * Toggle checklist item
     */
    static async toggleChecklistItem(
        meetingId: string,
        checklistItemId: string
    ): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            const meeting = await Meeting.findOne({ meetingId })
            if (!meeting) return null

            const item = meeting.checklist.find((item) => item.id === checklistItemId)
            if (!item) return null

            return await Meeting.findOneAndUpdate(
                { meetingId, 'checklist.id': checklistItemId },
                {
                    $set: {
                        'checklist.$.done': !item.done,
                        lastUpdatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    // ==================== Action Item Operations ====================

    /**
     * Add action item
     */
    static async addActionItem(
        meetingId: string,
        actionItem: Omit<ActionItem, 'id' | 'createdAt'>
    ): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            const item: ActionItem = {
                id: generateId(8),
                ...actionItem,
                createdAt: new Date()
            }

            return await Meeting.findOneAndUpdate(
                { meetingId },
                {
                    $push: { actions: item },
                    $set: { lastUpdatedAt: new Date() }
                },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    /**
     * Update action item status
     */
    static async updateActionStatus(
        meetingId: string,
        actionId: string,
        status: ActionStatus
    ): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            const updateFields: any = {
                'actions.$.status': status,
                lastUpdatedAt: new Date()
            }

            if (status === ActionStatus.DONE) {
                updateFields['actions.$.completedAt'] = new Date()
            }

            return await Meeting.findOneAndUpdate(
                { meetingId, 'actions.id': actionId },
                { $set: updateFields },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    // ==================== Notes Operations ====================

    /**
     * Add meeting note
     */
    static async addNote(
        meetingId: string,
        note: Omit<MeetingNote, 'id' | 'createdAt'>
    ): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            const noteItem: MeetingNote = {
                id: generateId(8),
                ...note,
                createdAt: new Date()
            }

            return await Meeting.findOneAndUpdate(
                { meetingId },
                {
                    $push: { notes: noteItem },
                    $set: { lastUpdatedAt: new Date() }
                },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    // ==================== Timer Operations ====================

    /**
     * Start timer for agenda item
     */
    static async startTimer(
        meetingId: string,
        agendaItemId: string,
        durationMinutes: number
    ): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            const now = new Date()
            const endsAt = new Date(now.getTime() + durationMinutes * 60 * 1000)

            return await Meeting.findOneAndUpdate(
                { meetingId },
                {
                    $set: {
                        'timers.currentAgendaItemId': agendaItemId,
                        'timers.startedAt': now,
                        'timers.endsAt': endsAt,
                        lastUpdatedAt: now
                    }
                },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    /**
     * Stop timer
     */
    static async stopTimer(meetingId: string): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            return await Meeting.findOneAndUpdate(
                { meetingId },
                {
                    $unset: {
                        'timers.currentAgendaItemId': '',
                        'timers.startedAt': '',
                        'timers.endsAt': '',
                        'timers.lastNotifiedAt': ''
                    },
                    $set: { lastUpdatedAt: new Date() }
                },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    /**
     * Get all active meetings with running timers
     */
    static async getActiveMeetingsWithTimers(): Promise<MeetingDoc[]> {
        const result = await safeDbOperation(async () => {
            return await Meeting.find({
                status: { $in: [MeetingStatus.IN_PROGRESS] },
                'timers.startedAt': { $exists: true },
                'timers.endsAt': { $exists: true }
            })
        }, [])
        return result ?? []
    }

    /**
     * Update timer notification timestamp
     */
    static async updateTimerNotification(
        meetingId: string,
        notificationTime: Date
    ): Promise<MeetingDoc | null> {
        const result = await safeDbOperation(async () => {
            return await Meeting.findOneAndUpdate(
                { meetingId },
                {
                    $set: {
                        'timers.lastNotifiedAt': notificationTime,
                        lastUpdatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }
}

export default MeetingRepository
