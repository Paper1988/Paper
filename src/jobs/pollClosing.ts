import PollRepository from '@/Systems/PollRepository.js'
import MeetingRenderer from '@/Systems/MeetingRenderer.js'
import { TextChannel } from 'discord.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { calculatePollResults } from '@/libs/meeting/utils.js'
import { MEETING_EMOJIS } from '@/libs/meeting/constants.js'

/**
 * Check polls that should be closed and close them automatically
 * Should run every minute
 */
export async function checkExpiringPolls(client: PaperClient) {
    try {
        const now = new Date()

        // Get all active polls with end times
        const expiringPolls = await PollRepository.getExpiringPolls(now)

        if (!expiringPolls || expiringPolls.length === 0) {
            return
        }

        for (const poll of expiringPolls) {
            try {
                // Close the poll
                await PollRepository.closePoll(poll.pollId)

                // Update poll message if it exists
                if (poll.messageId) {
                    const channel = await client.channels.fetch(
                        poll.meetingId ?
                            (await PollRepository.getMeetingChannelId(poll.meetingId)) || ''
                            : ''
                    ) as TextChannel

                    if (channel && channel.isTextBased()) {
                        try {
                            const pollMessage = await channel.messages.fetch(poll.messageId)
                            if (pollMessage) {
                                const closedPoll = await PollRepository.getPollById(poll.pollId)
                                if (closedPoll) {
                                    const results = calculatePollResults(closedPoll)
                                    const pollEmbed = MeetingRenderer.renderPollEmbed(closedPoll, results)

                                    await pollMessage.edit({
                                        embeds: [pollEmbed],
                                        components: [] // Remove voting buttons
                                    })
                                }
                            }
                        } catch (error) {
                            console.warn(`Failed to update poll message ${poll.messageId}:`, error)
                        }
                    }
                }

                // Send notification about poll closing
                await sendPollClosedNotification(client, poll)

            } catch (error) {
                console.error(`Error closing poll ${poll.pollId}:`, error)
            }
        }
    } catch (error) {
        console.error('Error checking expiring polls:', error)
    }
}

async function sendPollClosedNotification(client: PaperClient, poll: any) {
    try {
        // Get channel from meeting or directly from poll
        let channelId: string | null = null

        if (poll.meetingId) {
            channelId = await PollRepository.getMeetingChannelId(poll.meetingId)
        }

        if (!channelId) {
            return
        }

        const channel = await client.channels.fetch(channelId) as TextChannel
        if (!channel || !channel.isTextBased()) {
            return
        }

        const results = calculatePollResults(poll)

        // Build results summary
        let resultsSummary = ''

        if (poll.type === 'yn') {
            resultsSummary = `是: ${results.yesCount || 0} | 否: ${results.noCount || 0}`
        } else if (poll.type === 'multi' && results.optionResults) {
            const topOption = results.optionResults[0]
            if (topOption) {
                resultsSummary = `領先選項: ${topOption.option.text} (${topOption.count} 票)`
            }
        } else if (poll.type === 'ranked' && results.rankedResults) {
            const winner = results.rankedResults[0]
            if (winner) {
                resultsSummary = `第一名: ${winner.option.text} (得分: ${winner.score})`
            }
        }

        await channel.send({
            content:
                `${MEETING_EMOJIS.POLL} **投票已結束**\n` +
                `投票ID: \`${poll.pollId}\`\n` +
                `總投票數: ${results.totalVotes}\n` +
                (resultsSummary ? `結果: ${resultsSummary}` : ''),
            allowedMentions: { parse: [] }
        })
    } catch (error) {
        console.error('Error sending poll closed notification:', error)
    }
}
