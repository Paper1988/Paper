import MeetingRepository from '@/Systems/MeetingRepository.js'
import { TextChannel } from 'discord.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { MEETING_EMOJIS } from '@/libs/meeting/constants.js'

/**
 * Check active meeting timers and send reminders
 * Should run every minute
 */
export async function checkMeetingTimers(client: PaperClient) {
    try {
        const now = new Date()

        // Get all active meetings with running timers
        const activeMeetings = await MeetingRepository.getActiveMeetingsWithTimers()

        if (!activeMeetings || activeMeetings.length === 0) {
            return
        }

        for (const meeting of activeMeetings) {
            if (!meeting.timers.endsAt || !meeting.timers.startedAt) {
                continue
            }

            const endsAt = new Date(meeting.timers.endsAt)
            const startedAt = new Date(meeting.timers.startedAt)
            const timeLeft = endsAt.getTime() - now.getTime()
            const totalDuration = endsAt.getTime() - startedAt.getTime()
            const elapsed = totalDuration - timeLeft

            // Skip if timer hasn't started or already ended
            if (timeLeft <= 0 || elapsed < 0) {
                if (timeLeft <= 0) {
                    // Timer finished - send final notification
                    await sendTimerNotification(client, meeting, 'finished')
                    await MeetingRepository.stopTimer(meeting.meetingId)
                }
                continue
            }

            const minutesLeft = Math.floor(timeLeft / 60000)
            const halfwayPoint = totalDuration / 2

            // Check for notification triggers
            const lastNotified = meeting.timers.lastNotifiedAt
                ? new Date(meeting.timers.lastNotifiedAt).getTime()
                : startedAt.getTime()

            const timeSinceLastNotification = now.getTime() - lastNotified

            // Halfway reminder (only once, at least 30 seconds since last notification)
            if (
                elapsed >= halfwayPoint &&
                elapsed < halfwayPoint + 60000 &&
                timeSinceLastNotification > 30000
            ) {
                await sendTimerNotification(client, meeting, 'halfway')
                await MeetingRepository.updateTimerNotification(meeting.meetingId, now)
            }
            // 5 minutes left reminder
            else if (
                minutesLeft === 5 &&
                minutesLeft * 60000 < totalDuration / 2 &&
                timeSinceLastNotification > 30000
            ) {
                await sendTimerNotification(client, meeting, '5min')
                await MeetingRepository.updateTimerNotification(meeting.meetingId, now)
            }
            // 1 minute left reminder
            else if (
                minutesLeft === 1 &&
                timeSinceLastNotification > 30000
            ) {
                await sendTimerNotification(client, meeting, '1min')
                await MeetingRepository.updateTimerNotification(meeting.meetingId, now)
            }
        }
    } catch (error) {
        console.error('Error checking meeting timers:', error)
    }
}

async function sendTimerNotification(
    client: PaperClient,
    meeting: any,
    type: 'halfway' | '5min' | '1min' | 'finished'
) {
    try {
        const channel = await client.channels.fetch(meeting.channelId) as TextChannel
        if (!channel || !channel.isTextBased()) {
            return
        }

        const currentAgenda = meeting.agenda.find(
            (item: any) => item.id === meeting.timers.currentAgendaItemId
        )

        if (!currentAgenda) {
            return
        }

        let message = ''

        switch (type) {
            case 'halfway':
                message = `${MEETING_EMOJIS.TIMER} **計時器提醒**\n議程「${currentAgenda.title}」已過半！`
                break
            case '5min':
                message = `${MEETING_EMOJIS.TIMER} **計時器提醒**\n議程「${currentAgenda.title}」剩餘 5 分鐘！`
                break
            case '1min':
                message = `${MEETING_EMOJIS.TIMER} **計時器提醒**\n議程「${currentAgenda.title}」剩餘 1 分鐘！`
                break
            case 'finished':
                message = `${MEETING_EMOJIS.COMPLETE} **計時器結束**\n議程「${currentAgenda.title}」時間到！`
                break
        }

        await channel.send({
            content: message,
            allowedMentions: { parse: [] }
        })
    } catch (error) {
        console.error('Error sending timer notification:', error)
    }
}
