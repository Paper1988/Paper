import {
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    UserFlags,
    version,
} from 'discord.js'

import { PaperClient } from '@/Structures/classes/PaperClient.js'
import { buildBotInfoMessage } from '@/Systems/UI/BotInfoRenderer.js'
import mongoose from 'mongoose'
import os from 'os'

export default {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setNameLocalization('zh-TW', '機器人資訊')
        .setNameLocalization('ja', 'ボット情報')
        .setDescription('View bot information')
        .setDescriptionLocalization('zh-TW', '查看機器人資訊')
        .setDescriptionLocalization('ja', 'ボットの情報を表示'),
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        await client.user!.fetch()
        await client.application!.fetch()

        const getChannelTypeSize = (types: ChannelType[]) =>
            client.channels.cache.filter((channel) => types.includes(channel.type)).size

        const totalMemory = os.totalmem()
        const usedMemory = totalMemory - os.freemem()
        const memoryUsagePercentage = (usedMemory / totalMemory) * 100
        const owner = client.application!.owner
        const ownerMention = owner
            ? 'ownerId' in owner
                ? `<@${owner.ownerId}>`
                : `<@${owner.id}>`
            : '未知'
        const databaseStates = ['未連線', '已連線', '連線中', '正在中斷']
        const databaseStatus =
            databaseStates[mongoose.connection.readyState] ?? '未知'

        const operatingSystem = os
            .type()
            .replace('Windows_NT', 'Windows')
            .replace('Darwin', 'macOS')

        await interaction.reply(
            buildBotInfoMessage({
                username: client.user!.username,
                userId: client.user!.id,
                createdTimestamp: client.user!.createdTimestamp,
                owner: ownerMention,
                verified: Boolean(client.user!.flags?.has(UserFlags.VerifiedBot)),
                tags: client.application!.tags ?? [],
                commandCount: client.commands.size,
                operatingSystem,
                uptimeTimestamp: client.readyTimestamp,
                ping: client.ws.ping,
                cpu: os.cpus()[0]?.model ?? '未知',
                memoryUsagePercentage,
                databaseStatus,
                nodeVersion: process.version,
                discordJsVersion: version,
                activePlayers: client.moonlink?.players.playingPlayers.length ?? 0,
                guildCount: client.guilds.cache.size,
                cachedUserCount: client.users.cache.size,
                cachedEmojiCount: client.emojis.cache.size,
                textChannelCount: getChannelTypeSize([
                    ChannelType.GuildText,
                    ChannelType.GuildForum,
                ]),
                voiceChannelCount: getChannelTypeSize([
                    ChannelType.GuildVoice,
                    ChannelType.GuildStageVoice,
                ]),
                threadCount: getChannelTypeSize([
                    ChannelType.PublicThread,
                    ChannelType.PrivateThread,
                    ChannelType.AnnouncementThread,
                ]),
            }),
        )
    },
}
