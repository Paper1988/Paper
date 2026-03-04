import client from '@/index.js'
import cron from 'node-cron'
import { checkMeetingTimers } from './meetingTimers.js'
import { checkExpiringPolls } from './pollClosing.js'
import { aggregateWeeklyStats } from './weeklyAggregation.js'

class CronJob {
    startJobs(): void {
        this.weeklyStats()
        this.meetingTimers()
        this.pollClosing()
    }

    weeklyStats() {
        // Weekly statistics aggregation - runs every Monday at midnight
        cron.schedule(
            '0 0 * * 1',
            async () => {
                console.log('開始每週統計...')
                try {
                    await aggregateWeeklyStats()
                    console.log('每週統計完成')
                } catch (err) {
                    console.error('每週統計失敗', err)
                }
            },
            {
                timezone: 'Asia/Taipei'
            }
        )
    }

    meetingTimers() {
        // Meeting timer checks - runs every minute
        cron.schedule(
            '* * * * *',
            async () => {
                try {
                    if (client) {
                        await checkMeetingTimers(client)
                    }
                } catch (err) {
                    console.error('會議計時器檢查失敗', err)
                }
            },
            {
                timezone: 'Asia/Taipei'
            }
        )
    }

    pollClosing() {
        // Poll expiration checks - runs every minute
        cron.schedule(
            '* * * * *',
            async () => {
                try {
                    if (client) {
                        await checkExpiringPolls(client)
                    }
                } catch (err) {
                    console.error('投票到期檢查失敗', err)
                }
            },
            {
                timezone: 'Asia/Taipei'
            }
        )
    }
}

export const cronJob = new CronJob()
