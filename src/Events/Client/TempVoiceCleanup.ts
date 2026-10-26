import TempVoiceChannel from '@/Structures/Schemas/TempVoiceChannel.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import type { EventType } from '@/typings/event.js'
import { Events } from 'discord.js'

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: PaperClient) {
        const records = await TempVoiceChannel.find().exec().catch(() => [])

        for (const record of records) {
            const channel = client.channels.cache.get(record.ChannelID)
            if (!channel) {
                // 只清掉這個 shard 負責的伺服器，避免誤刪其他 shard 的紀錄
                if (client.guilds.cache.has(record.GuildID)) await record.deleteOne()
                continue
            }
            if (channel.isVoiceBased() && channel.members.size === 0) {
                await channel.delete('清理遺留的臨時語音頻道').catch(() => {})
                await record.deleteOne()
            }
        }
    }
} satisfies EventType
