import {
    Message,
    User,
    TextChannel,
    ChatInputCommandInteraction,
    ButtonInteraction,
    StringSelectMenuInteraction,
    ModalSubmitInteraction
} from 'discord.js'
import { type MeetingDoc, type PollDoc, MeetingStatus, PollType } from '@/typings/meeting.js'
import MeetingRepository from '@/Systems/MeetingRepository.js'
import PollRepository from '@/Systems/PollRepository.js'
import MeetingRenderer from '@/Systems/MeetingRenderer.js'
import { MEETING_LIMITS, MEETING_STRINGS } from '@/libs/meeting/constants.js'

export class MeetingService {
    // ==================== Meeting Operations ====================

    /**
     * Create a new meeting and post the agenda card
     */
    static async createMeeting(
        interaction: ChatInputCommandInteraction,
        data: {
            title: string
            scheduledAt?: Date
            durationMinutes: number
            participants: User[]
        }
    ): Promise<MeetingDoc | null> {
        try {
            // Validate input
            if (data.title.length > MEETING_LIMITS.TITLE_MAX_LENGTH) {
                throw new Error(MEETING_STRINGS.ERRORS.TITLE_TOO_LONG)
            }

            if (
                data.durationMinutes < MEETING_LIMITS.MIN_DURATION_MINUTES ||
                data.durationMinutes > MEETING_LIMITS.MAX_DURATION_MINUTES
            ) {
                throw new Error(MEETING_STRINGS.ERRORS.INVALID_DURATION)
            }

            if (data.participants.length > MEETING_LIMITS.MAX_PARTICIPANTS) {
                throw new Error(MEETING_STRINGS.ERRORS.TOO_MANY_PARTICIPANTS)
            }

            // Create meeting in database
            const meeting = await MeetingRepository.createMeeting({
                guildId: interaction.guildId!,
                channelId: interaction.channelId,
                creatorId: interaction.user.id,
                title: data.title,
                scheduledAt: data.scheduledAt,
                durationMinutes: data.durationMinutes,
                participants: data.participants.map((user) => user.id)
            })

            if (!meeting) {
                throw new Error('建立會議時發生錯誤')
            }

            // Render and post the agenda card
            const embed = await MeetingRenderer.renderMeetingEmbed(meeting)
            const components = MeetingRenderer.buildMeetingComponents(meeting)

            const message = (await interaction.followUp({
                embeds: [embed],
                components,
                fetchReply: true
            })) as Message

            // Update meeting with message ID
            await MeetingRepository.updateMeeting(meeting.meetingId, {
                messageId: message.id
            })

            return meeting
        } catch (error) {
            console.error('Error creating meeting:', error)

            const errorMessage = error instanceof Error ? error.message : '建立會議時發生未知錯誤'

            await interaction.followUp({
                content: `❌ ${errorMessage}`,
                ephemeral: true
            })

            return null
        }
    }

    /**
     * Start a meeting
     */
    static async startMeeting(interaction: ButtonInteraction, meetingId: string): Promise<void> {
        try {
            const meeting = await MeetingRepository.getMeetingById(meetingId)
            if (!meeting) {
                throw new Error(MEETING_STRINGS.MESSAGES.MEETING_NOT_FOUND)
            }

            // Check permissions
            if (!this.canManageMeeting(interaction, meeting)) {
                throw new Error(MEETING_STRINGS.MESSAGES.PERMISSION_DENIED)
            }

            if (meeting.status !== MeetingStatus.SCHEDULED) {
                throw new Error('只能開始已排程的會議')
            }

            // Start the meeting
            const updatedMeeting = await MeetingRepository.startMeeting(meetingId)
            if (!updatedMeeting) {
                throw new Error('開始會議失敗')
            }

            // Update the message
            await this.updateMeetingMessage(interaction, updatedMeeting)

            await interaction.followUp({
                content: `✅ ${MEETING_STRINGS.MESSAGES.MEETING_STARTED}`,
                ephemeral: true
            })
        } catch (error) {
            console.error('Error starting meeting:', error)

            const errorMessage = error instanceof Error ? error.message : '開始會議時發生錯誤'

            await interaction.followUp({
                content: `❌ ${errorMessage}`,
                ephemeral: true
            })
        }
    }

    /**
     * End a meeting
     */
    static async endMeeting(interaction: ButtonInteraction, meetingId: string): Promise<void> {
        try {
            const meeting = await MeetingRepository.getMeetingById(meetingId)
            if (!meeting) {
                throw new Error(MEETING_STRINGS.MESSAGES.MEETING_NOT_FOUND)
            }

            // Check permissions
            if (!this.canManageMeeting(interaction, meeting)) {
                throw new Error(MEETING_STRINGS.MESSAGES.PERMISSION_DENIED)
            }

            if (meeting.status === MeetingStatus.ENDED) {
                throw new Error(MEETING_STRINGS.ERRORS.MEETING_ALREADY_ENDED)
            }

            // End the meeting
            const updatedMeeting = await MeetingRepository.endMeeting(meetingId)
            if (!updatedMeeting) {
                throw new Error('結束會議失敗')
            }

            // Stop any active timers
            await MeetingRepository.stopTimer(meetingId)

            // Close any active polls for this meeting
            const polls = await PollRepository.listPollsByMeeting(meetingId)
            for (const poll of polls) {
                if (!poll.isClosed) {
                    await PollRepository.closePoll(poll.pollId)
                }
            }

            // Update the message
            await this.updateMeetingMessage(interaction, updatedMeeting)

            await interaction.followUp({
                content: `✅ ${MEETING_STRINGS.MESSAGES.MEETING_ENDED}`,
                ephemeral: true
            })
        } catch (error) {
            console.error('Error ending meeting:', error)

            const errorMessage = error instanceof Error ? error.message : '結束會議時發生錯誤'

            await interaction.followUp({
                content: `❌ ${errorMessage}`,
                ephemeral: true
            })
        }
    }

    /**
     * Add agenda item to meeting
     */
    static async addAgendaItem(
        meetingId: string,
        data: {
            title: string
            topic: string
            expectedOutcome: string
            ownerId: string
            timeboxMinutes?: number
        }
    ): Promise<MeetingDoc | null> {
        try {
            const meeting = await MeetingRepository.getMeetingById(meetingId)
            if (!meeting) return null

            if (meeting.agenda.length >= MEETING_LIMITS.MAX_AGENDA_ITEMS) {
                throw new Error(MEETING_STRINGS.ERRORS.TOO_MANY_AGENDA_ITEMS)
            }

            return await MeetingRepository.addAgendaItem(meetingId, {
                ...data,
                decisionPoints: []
            })
        } catch (error) {
            console.error('Error adding agenda item:', error)
            throw error
        }
    }

    // ==================== Poll Operations ====================

    /**
     * Create a poll for meeting or agenda item
     */
    static async createPoll(
        interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
        data: {
            meetingId?: string
            agendaItemId?: string
            type: PollType
            options?: string[] // For multi-choice and ranked polls
            durationMinutes?: number
        }
    ): Promise<PollDoc | null> {
        try {
            let endsAt: Date | undefined
            if (data.durationMinutes) {
                endsAt = new Date()
                endsAt.setMinutes(endsAt.getMinutes() + data.durationMinutes)
            }

            const pollOptions = data.options?.map((text) => ({ text })) || []

            const poll = await PollRepository.createPoll({
                meetingId: data.meetingId,
                agendaItemId: data.agendaItemId,
                type: data.type,
                options: pollOptions,
                endsAt
            })

            if (!poll) {
                throw new Error('建立投票失敗')
            }

            // If linked to agenda item, update the decision points
            if (data.agendaItemId && data.meetingId) {
                const meeting = await MeetingRepository.getMeetingById(data.meetingId)
                if (meeting) {
                    const agendaItem = meeting.agenda.find((item) => item.id === data.agendaItemId)
                    if (agendaItem) {
                        agendaItem.decisionPoints.push(poll.pollId)
                        await MeetingRepository.updateAgendaItem(
                            data.meetingId,
                            data.agendaItemId,
                            { decisionPoints: agendaItem.decisionPoints }
                        )
                    }
                }
            }

            return poll
        } catch (error) {
            console.error('Error creating poll:', error)

            const errorMessage = error instanceof Error ? error.message : '建立投票時發生錯誤'

            await interaction.followUp({
                content: `❌ ${errorMessage}`,
                ephemeral: true
            })

            return null
        }
    }

    /**
     * Cast a vote in a poll
     */
    static async castVote(
        interaction: ButtonInteraction,
        pollId: string,
        vote: { choice?: boolean; optionIds?: string[]; ranking?: string[] }
    ): Promise<void> {
        try {
            const poll = await PollRepository.getPollById(pollId)
            if (!poll) {
                throw new Error(MEETING_STRINGS.MESSAGES.POLL_NOT_FOUND)
            }

            if (poll.isClosed) {
                throw new Error(MEETING_STRINGS.ERRORS.POLL_ALREADY_CLOSED)
            }

            // Cast the vote
            await PollRepository.upsertVote(pollId, interaction.user.id, vote)

            await interaction.followUp({
                content: `✅ ${MEETING_STRINGS.MESSAGES.VOTE_CAST}`,
                ephemeral: true
            })

            // Update related meeting embed if applicable
            if (poll.meetingId) {
                const meeting = await MeetingRepository.getMeetingById(poll.meetingId)
                if (meeting && meeting.messageId) {
                    await this.updateMeetingMessage(interaction, meeting)
                }
            }
        } catch (error) {
            console.error('Error casting vote:', error)

            const errorMessage = error instanceof Error ? error.message : '投票時發生錯誤'

            await interaction.followUp({
                content: `❌ ${errorMessage}`,
                ephemeral: true
            })
        }
    }

    // ==================== Helper Methods ====================

    /**
     * Check if user can manage meeting (creator or admin)
     */
    private static canManageMeeting(
        interaction: ButtonInteraction | ChatInputCommandInteraction | StringSelectMenuInteraction | ModalSubmitInteraction,
        meeting: MeetingDoc
    ): boolean {
        // Meeting creator can always manage
        if (meeting.creatorId === interaction.user.id) {
            return true
        }

        // Check if user has manage guild permission
        if (interaction.memberPermissions?.has('ManageGuild')) {
            return true
        }

        return false
    }

    /**
     * Update meeting message with latest data
     */
    static async updateMeetingMessage(
        interaction: ButtonInteraction | ChatInputCommandInteraction | StringSelectMenuInteraction | ModalSubmitInteraction,
        meeting: MeetingDoc
    ): Promise<void> {
        try {
            if (!meeting.messageId) return

            const channel = interaction.channel as TextChannel
            if (!channel) return

            const message = await channel.messages.fetch(meeting.messageId)
            if (!message) return

            const summary = await MeetingRenderer.getMeetingSummary(meeting)
            const embed = await MeetingRenderer.renderMeetingEmbed(meeting, summary)
            const components = MeetingRenderer.buildMeetingComponents(meeting)

            await message.edit({
                embeds: [embed],
                components
            })
        } catch (error) {
            console.error('Error updating meeting message:', error)
        }
    }

    /**
     * Get meeting by message interaction
     */
    static async getMeetingFromInteraction(
        interaction: ButtonInteraction | ChatInputCommandInteraction | StringSelectMenuInteraction | ModalSubmitInteraction,
        meetingId: string
    ): Promise<MeetingDoc | null> {
        const meeting = await MeetingRepository.getMeetingById(meetingId)

        if (!meeting) {
            await interaction.followUp({
                content: `❌ ${MEETING_STRINGS.MESSAGES.MEETING_NOT_FOUND}`,
                ephemeral: true
            })
            return null
        }

        // Verify the meeting is in the same guild and channel
        if (
            meeting.guildId !== interaction.guildId ||
            meeting.channelId !== interaction.channelId
        ) {
            await interaction.followUp({
                content: '❌ 無法在此頻道存取該會議',
                ephemeral: true
            })
            return null
        }

        return meeting
    }
}

export default MeetingService
