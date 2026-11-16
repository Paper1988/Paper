import client from '@/index.js'
import cron from 'node-cron'
import BotStatusHistory from '@/Structures/Schemas/BotStatusHistory.js'
import { checkMeetingTimers } from './meetingTimers.js'
import { checkExpiringPolls } from './pollClosing.js'
import { aggregateWeeklyStats } from './weeklyAggregation.js'

class CronJob {
    private tasks: ReturnType<typeof cron.schedule>[] = []

    startJobs(): void {
        this.weeklyStats()
        this.meetingTimers()
        this.pollClosing()
        this.botStatusHistory()
        client.once('shutdown', () => this.stopJobs())
    }

    stopJobs(): void {
        for (const task of this.tasks) task.stop()
        this.tasks = []
    }

    private schedule(expression: string, callback: () => void | Promise<void>): void {
        this.tasks.push(cron.schedule(expression, callback, { timezone: 'Asia/Taipei' }))
    }

    private weeklyStats(): void {
        // Weekly statistics aggregation - runs every Monday at midnight
        this.schedule('0 0 * * 1', async () => {
            console.log('開始每週統計...')
            try {
                await aggregateWeeklyStats()
                console.log('每週統計完成')
            } catch (err) {
                console.error('每週統計失敗', err)
            }
        })
    }

    private meetingTimers(): void {
        // Meeting timer checks - runs every minute
        this.schedule('* * * * *', async () => {
            try {
                await checkMeetingTimers(client)
            } catch (err) {
                console.error('會議計時器檢查失敗', err)
            }
        })
    }

    private pollClosing(): void {
        // Poll expiration checks - runs every minute
        this.schedule('* * * * *', async () => {
            try {
                await checkExpiringPolls(client)
            } catch (err) {
                console.error('投票到期檢查失敗', err)
            }
        })
    }

    private botStatusHistory(): void {
        // Record bot readiness every five minutes for the dashboard history chart.
        this.schedule('*/5 * * * *', async () => {
            try {
                await BotStatusHistory.create({
                    timestamp: new Date(),
                    status: client.isReady() ? 1 : 0
                })
            } catch (error) {
                console.error('記錄機器人狀態失敗', error)
            }
        })
    }
}

export const cronJob = new CronJob()
