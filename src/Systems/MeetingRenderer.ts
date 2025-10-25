import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, User } from 'discord.js'
import {
    type MeetingDoc,
    type PollDoc,
    MeetingStatus,
    ActionStatus,
    type PollResults
} from '@/typings/meeting.js'
import { MEETING_EMOJIS, MEETING_COLORS, MEETING_STRINGS } from '@/libs/meeting/constants.js'
import {
    formatDuration,
    formatDateTime,
    formatTimeRemaining,
    createProgressBar,
    truncateText,
    calculatePollResults
} from '@/libs/meeting/utils.js'
import PollRepository from '@/Systems/PollRepository.js'

export interface MeetingSummary {
    polls: PollDoc[]
    pollResults: Map<string, PollResults>
    participantUsers?: Map<string, User> // For displaying usernames
}

export class MeetingRenderer {
    /**
     * Render the main meeting embed
     */
    static async renderMeetingEmbed(
        meeting: MeetingDoc,
        summary?: MeetingSummary
    ): Promise<EmbedBuilder> {
        const embed = new EmbedBuilder()

        // Set color based on status
        const statusColor = this.getStatusColor(meeting.status)
        embed.setColor(statusColor)

        // Title with status indicator
        const statusEmoji = this.getStatusEmoji(meeting.status)
        const statusText = MEETING_STRINGS.STATUS[meeting.status]
        embed.setTitle(`${statusEmoji} ${meeting.title}`)

        // Description with basic info
        const descriptionLines: string[] = []

        if (meeting.scheduledAt) {
            descriptionLines.push(
                `${MEETING_EMOJIS.SCHEDULED} **排程時間:** ${formatDateTime(meeting.scheduledAt)}`
            )
        }

        descriptionLines.push(
            `${MEETING_EMOJIS.TIMER} **預計時長:** ${formatDuration(meeting.durationMinutes)}`
        )

        if (meeting.participants.length > 0) {
            const participantText = summary?.participantUsers
                ? meeting.participants
                      .map((id) => summary.participantUsers?.get(id)?.displayName || `<@${id}>`)
                      .join(', ')
                : meeting.participants.map((id) => `<@${id}>`).join(', ')

            descriptionLines.push(
                `${MEETING_EMOJIS.PROGRESS} **參與者 (${meeting.participants.length}):** ${truncateText(participantText, 200)}`
            )
        }

        embed.setDescription(descriptionLines.join('\n'))

        // Agenda section
        if (meeting.agenda.length > 0) {
            const agendaLines: string[] = []

            for (let i = 0; i < Math.min(meeting.agenda.length, 10); i++) {
                const item = meeting.agenda[i]
                if (!item) continue
                const ownerMention =
                    summary?.participantUsers?.get(item.ownerId)?.displayName ||
                    `<@${item.ownerId}>`

                let agendaLine = `**${i + 1}.** ${item.title}`

                if (item.timeboxMinutes) {
                    agendaLine += ` (${item.timeboxMinutes}分鐘)`
                }

                agendaLine += ` - ${ownerMention}`

                // Show decisions if any polls are linked
                if (item.decisionPoints.length > 0 && summary?.pollResults) {
                    const decisions = item.decisionPoints
                        .map((pollId) => {
                            const results = summary.pollResults.get(pollId)
                            if (results?.winner) {
                                return `✅ ${results.winner.text}`
                            }
                            return '🗳️ 投票中'
                        })
                        .join(' | ')
                    agendaLine += `\n   ${MEETING_EMOJIS.POLL} ${decisions}`
                }

                agendaLines.push(agendaLine)
            }

            if (meeting.agenda.length > 10) {
                agendaLines.push(`... 還有 ${meeting.agenda.length - 10} 個項目`)
            }

            embed.addFields({
                name: `${MEETING_EMOJIS.AGENDA} ${MEETING_STRINGS.FIELDS.AGENDA}`,
                value: agendaLines.join('\n') || '尚未建立議程項目',
                inline: false
            })
        }

        // Progress indicators
        const progressFields: { name: string; value: string; inline: boolean }[] = []

        // Checklist progress
        if (meeting.checklist.length > 0) {
            const completed = meeting.checklist.filter((item) => item.done).length
            const total = meeting.checklist.length
            const progressBar = createProgressBar(completed, total, 8)

            progressFields.push({
                name: `${MEETING_EMOJIS.CHECKLIST} 準備清單`,
                value: `${progressBar} ${completed}/${total}`,
                inline: true
            })
        }

        // Action items
        if (meeting.actions.length > 0) {
            const openActions = meeting.actions.filter(
                (action) => action.status === ActionStatus.OPEN
            ).length
            const totalActions = meeting.actions.length

            progressFields.push({
                name: `${MEETING_EMOJIS.ACTION} 行動項目`,
                value: `${openActions} 待完成 / ${totalActions} 總計`,
                inline: true
            })
        }

        // Timer status
        if (meeting.timers.currentAgendaItemId && meeting.timers.endsAt) {
            const currentItem = meeting.agenda.find(
                (item) => item.id === meeting.timers.currentAgendaItemId
            )
            const timeRemaining = formatTimeRemaining(meeting.timers.endsAt)

            progressFields.push({
                name: `${MEETING_EMOJIS.TIMER} 當前項目計時`,
                value: `${currentItem?.title || '未知項目'}\n剩餘時間: ${timeRemaining}`,
                inline: true
            })
        }

        if (progressFields.length > 0) {
            embed.addFields(progressFields)
        }

        // Footer with metadata
        const footerText = `會議ID: ${meeting.meetingId} | 最後更新: ${formatDateTime(meeting.lastUpdatedAt)}`
        embed.setFooter({ text: footerText })

        embed.setTimestamp(meeting.lastUpdatedAt)

        return embed
    }

    /**
     * Build action rows with buttons for meeting controls
     */
    static buildMeetingComponents(meeting: MeetingDoc): ActionRowBuilder<ButtonBuilder>[] {
        const rows: ActionRowBuilder<ButtonBuilder>[] = []

        // Row 1: Meeting control buttons
        const controlRow = new ActionRowBuilder<ButtonBuilder>()

        if (meeting.status === MeetingStatus.SCHEDULED) {
            controlRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`meeting_start_${meeting.meetingId}`)
                    .setLabel(MEETING_STRINGS.BUTTONS.START_MEETING)
                    .setEmoji(MEETING_EMOJIS.START)
                    .setStyle(ButtonStyle.Success)
            )
        }

        if (meeting.status === MeetingStatus.IN_PROGRESS) {
            controlRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`meeting_end_${meeting.meetingId}`)
                    .setLabel(MEETING_STRINGS.BUTTONS.END_MEETING)
                    .setEmoji(MEETING_EMOJIS.END)
                    .setStyle(ButtonStyle.Danger)
            )
        }

        controlRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`meeting_checklist_${meeting.meetingId}`)
                .setLabel(MEETING_STRINGS.BUTTONS.VIEW_CHECKLIST)
                .setEmoji(MEETING_EMOJIS.CHECKLIST)
                .setStyle(ButtonStyle.Secondary)
        )

        // Timer button
        if (meeting.timers.currentAgendaItemId) {
            controlRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`meeting_timer_stop_${meeting.meetingId}`)
                    .setLabel(MEETING_STRINGS.BUTTONS.STOP_TIMER)
                    .setEmoji(MEETING_EMOJIS.PAUSE)
                    .setStyle(ButtonStyle.Secondary)
            )
        } else {
            controlRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`meeting_timer_start_${meeting.meetingId}`)
                    .setLabel(MEETING_STRINGS.BUTTONS.START_TIMER)
                    .setEmoji(MEETING_EMOJIS.TIMER)
                    .setStyle(ButtonStyle.Secondary)
            )
        }

        rows.push(controlRow)

        // Row 2: Agenda management buttons
        if (meeting.status !== MeetingStatus.ENDED) {
            const agendaRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`meeting_agenda_add_${meeting.meetingId}`)
                    .setLabel(MEETING_STRINGS.BUTTONS.ADD_AGENDA)
                    .setEmoji(MEETING_EMOJIS.ADD)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`meeting_agenda_edit_${meeting.meetingId}`)
                    .setLabel(MEETING_STRINGS.BUTTONS.EDIT_AGENDA)
                    .setEmoji(MEETING_EMOJIS.EDIT)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(meeting.agenda.length === 0),
                new ButtonBuilder()
                    .setCustomId(`meeting_agenda_remove_${meeting.meetingId}`)
                    .setLabel(MEETING_STRINGS.BUTTONS.REMOVE_AGENDA)
                    .setEmoji(MEETING_EMOJIS.REMOVE)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(meeting.agenda.length === 0),
                new ButtonBuilder()
                    .setCustomId(`meeting_poll_create_${meeting.meetingId}`)
                    .setLabel(MEETING_STRINGS.BUTTONS.CREATE_POLL)
                    .setEmoji(MEETING_EMOJIS.POLL)
                    .setStyle(ButtonStyle.Primary)
            )

            rows.push(agendaRow)
        }

        // Row 3: Notes and actions buttons
        const notesRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`meeting_note_add_${meeting.meetingId}`)
                .setLabel(MEETING_STRINGS.BUTTONS.ADD_NOTE)
                .setEmoji(MEETING_EMOJIS.NOTE)
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`meeting_action_add_${meeting.meetingId}`)
                .setLabel(MEETING_STRINGS.BUTTONS.ADD_ACTION)
                .setEmoji(MEETING_EMOJIS.ACTION)
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`meeting_action_view_${meeting.meetingId}`)
                .setLabel(MEETING_STRINGS.BUTTONS.VIEW_ACTIONS)
                .setEmoji(MEETING_EMOJIS.VIEW)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(meeting.actions.length === 0),
            new ButtonBuilder()
                .setCustomId(`meeting_export_${meeting.meetingId}`)
                .setLabel(MEETING_STRINGS.BUTTONS.EXPORT_SUMMARY)
                .setEmoji(MEETING_EMOJIS.EXPORT)
                .setStyle(ButtonStyle.Secondary)
        )

        rows.push(notesRow)

        return rows
    }

    /**
     * Build poll-specific components
     */
    static buildPollComponents(poll: PollDoc): ActionRowBuilder<ButtonBuilder>[] {
        const rows: ActionRowBuilder<ButtonBuilder>[] = []

        switch (poll.type) {
            case 'yn':
                // Yes/No buttons
                const ynRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`poll_vote_yes_${poll.pollId}`)
                        .setLabel('是')
                        .setEmoji(MEETING_EMOJIS.YES)
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(poll.isClosed),
                    new ButtonBuilder()
                        .setCustomId(`poll_vote_no_${poll.pollId}`)
                        .setLabel('否')
                        .setEmoji(MEETING_EMOJIS.NO)
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(poll.isClosed)
                )

                rows.push(ynRow)
                break
        }

        return rows
    }

    // ==================== Helper Methods ====================

    private static getStatusColor(status: MeetingStatus): number {
        switch (status) {
            case MeetingStatus.SCHEDULED:
                return MEETING_COLORS.SCHEDULED
            case MeetingStatus.IN_PROGRESS:
                return MEETING_COLORS.IN_PROGRESS
            case MeetingStatus.ENDED:
                return MEETING_COLORS.ENDED
            case MeetingStatus.ARCHIVED:
                return MEETING_COLORS.ARCHIVED
            default:
                return MEETING_COLORS.INFO
        }
    }

    private static getStatusEmoji(status: MeetingStatus): string {
        switch (status) {
            case MeetingStatus.SCHEDULED:
                return MEETING_EMOJIS.SCHEDULED
            case MeetingStatus.IN_PROGRESS:
                return MEETING_EMOJIS.IN_PROGRESS
            case MeetingStatus.ENDED:
                return MEETING_EMOJIS.ENDED
            case MeetingStatus.ARCHIVED:
                return MEETING_EMOJIS.ARCHIVED
            default:
                return MEETING_EMOJIS.PROGRESS
        }
    }

    /**
     * Render poll results embed
     */
    static renderPollEmbed(poll: PollDoc, results: PollResults): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setColor(MEETING_COLORS.POLL)
            .setTitle(`${MEETING_EMOJIS.POLL} 投票結果`)
            .setTimestamp()

        const description = [`總投票數: ${results.totalVotes}`]

        if (poll.type === 'yn') {
            description.push('')
            description.push(`${MEETING_EMOJIS.YES} **是:** ${results.yesCount || 0} 票`)
            description.push(`${MEETING_EMOJIS.NO} **否:** ${results.noCount || 0} 票`)
        } else if (poll.type === 'multi' && results.optionResults) {
            description.push('')
            results.optionResults.forEach((result, index) => {
                const progressBar = createProgressBar(result.count, results.totalVotes, 6)
                description.push(`**${result.option.text}**`)
                description.push(`${progressBar} ${result.count} 票 (${result.percentage}%)`)
            })
        } else if (poll.type === 'ranked' && results.rankedResults) {
            description.push('')
            results.rankedResults.forEach((result, index) => {
                const medal =
                    index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
                description.push(`${medal} **${result.option.text}** - ${result.score} 分`)
            })
        }

        if (results.winner) {
            description.push('')
            description.push(`🏆 **獲勝選項:** ${results.winner.text}`)
        }

        embed.setDescription(description.join('\n'))

        if (poll.isClosed) {
            embed.setFooter({ text: '✅ 投票已結束' })
        } else if (poll.endsAt) {
            embed.setFooter({ text: `投票結束時間: ${formatDateTime(poll.endsAt)}` })
        }

        return embed
    }

    /**
     * Get summary for meeting with polls
     */
    static async getMeetingSummary(meeting: MeetingDoc): Promise<MeetingSummary> {
        const polls = (await PollRepository.listPollsByMeeting(meeting.meetingId)) || []
        const pollResults = new Map<string, PollResults>()

        for (const poll of polls) {
            const results = calculatePollResults(poll)
            pollResults.set(poll.pollId, results)
        }

        return {
            polls,
            pollResults
        }
    }
}

export default MeetingRenderer
