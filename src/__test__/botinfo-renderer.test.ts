import { expect } from 'chai'
import { MessageFlags } from 'discord.js'
import { describe, it } from 'mocha'
import { buildBotInfoMessage, type BotInfoViewModel } from '@/Systems/UI/BotInfoRenderer.js'

const sampleInfo: BotInfoViewModel = {
    username: 'Paper',
    userId: '123456789012345678',
    createdTimestamp: 1_700_000_000_000,
    owner: '<@123456789012345678>',
    verified: true,
    tags: ['music', 'utility'],
    commandCount: 42,
    operatingSystem: 'macOS',
    uptimeTimestamp: 1_700_000_000_000,
    ping: 38,
    cpu: 'Apple M-series',
    memoryUsagePercentage: 32.4,
    databaseStatus: '已連線',
    nodeVersion: 'v22.0.0',
    discordJsVersion: '14.x',
    activePlayers: 2,
    guildCount: 10,
    cachedUserCount: 1200,
    cachedEmojiCount: 50,
    textChannelCount: 80,
    voiceChannelCount: 12,
    threadCount: 4,
}

describe('Bot Info Renderer', function () {
    it('應使用 Components V2 與 ephemeral 回覆，不混用舊式 embeds/content', function () {
        const payload = buildBotInfoMessage(sampleInfo)

        expect(payload.flags).to.equal(
            MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        )
        expect(payload.components).to.have.length(1)
        expect(payload).to.not.have.property('content')
        expect(payload).to.not.have.property('embeds')
    })

    it('應按身分、執行狀態與快取規模分組顯示資訊', function () {
        const payload = buildBotInfoMessage(sampleInfo)
        const container = JSON.parse(JSON.stringify(payload.components?.[0])) as {
            type: number
            components: Array<{ type: number; content?: string }>
        }
        const text = container.components
            .filter((component) => component.type === 10)
            .map((component) => component.content ?? '')
            .join('\n')

        expect(container.type).to.equal(17)
        expect(text).to.include('身分資料')
        expect(text).to.include('執行狀態')
        expect(text).to.include('快取與規模')
        expect(text).to.include('系統記憶體使用率')
        expect(text).to.include('部分數據來自目前快取')
    })
})
