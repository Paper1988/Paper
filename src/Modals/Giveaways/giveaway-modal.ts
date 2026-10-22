import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import Giveaway from '@/Structures/Schemas/Giveaway.js'
import GiveawayStats from '@/Structures/Schemas/GiveawayStats.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    MessageFlags,
    ModalSubmitInteraction,
    TextChannel
} from 'discord.js'

interface RequirementOptions {
    requiredRoles?: string[]
    blacklistedRoles?: string[]
    minAccountAge?: number
    minServerTime?: number
}

const ACCENT_COLOR = 0xA3A3A3
const MAX_DURATION_MINUTES = 525600

function parseRequirements(input: string): RequirementOptions {
    const options: RequirementOptions = {}

    for (const line of input.split(/\r?\n/)) {
        const match = line.trim().match(/^(role|blacklist|age|server)\s*:\s*(.+)$/i)
        if (!match) continue

        const rawKey = match[1]!.toLowerCase()
        const value = match[2]!.trim()

        if (rawKey === 'role' || rawKey === 'blacklist') {
            const ids = value
                .split(/[\s,]+/)
                .map((id) => id.replace(/^<@&(\d+)>$/, '$1'))
                .filter(Boolean)

            if (ids.some((id) => !/^\d{17,20}$/.test(id))) {
                throw new Error('身分組請填寫 Discord 身分組 ID，或使用身分組提及格式。')
            }

            if (rawKey === 'role') options.requiredRoles = [...new Set(ids)]
            else options.blacklistedRoles = [...new Set(ids)]
            continue
        }

        const days = Number(value)
        if (!Number.isInteger(days) || days < 0 || days > 36500) {
            throw new Error(
                (rawKey === 'age' ? '帳號年齡' : '伺服器停留時間') +
                    '必須是 0 至 36500 的整數天數。'
            )
        }

        if (rawKey === 'age') options.minAccountAge = days
        else options.minServerTime = days
    }

    return options
}

export default {
    id: 'giveaway-modal',
    async execute(interaction: ModalSubmitInteraction, client: PaperClient) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const channelId = interaction.customId.split('/')[1]
        if (!channelId) {
            return interaction.editReply({ content: '無法辨識發布頻道，請重新建立抽獎。' })
        }

        const channel = await client.channels.fetch(channelId)
        if (!channel || !(channel instanceof TextChannel)) {
            return interaction.editReply({ content: '找不到指定的文字頻道，請重新建立抽獎。' })
        }

        const prize = interaction.fields.getTextInputValue('prize').trim()
        const duration = Number(interaction.fields.getTextInputValue('duration').trim())
        const winners = Number(interaction.fields.getTextInputValue('winners').trim())
        const description = interaction.fields.getTextInputValue('description').trim()
        const requirements = interaction.fields.getTextInputValue('requirements').trim()

        if (!prize) {
            return interaction.editReply({ content: '請填寫獎品名稱。' })
        }

        if (!Number.isInteger(duration) || duration < 1 || duration > MAX_DURATION_MINUTES) {
            return interaction.editReply({
                content: '活動時間必須是 1 至 525600 分鐘之間的整數（最多一年）。'
            })
        }

        if (!Number.isInteger(winners) || winners < 1 || winners > 100) {
            return interaction.editReply({ content: '得獎人數必須是 1 至 100 之間的整數。' })
        }

        let requirementOptions: RequirementOptions
        try {
            requirementOptions = parseRequirements(requirements)
        } catch (error) {
            return interaction.editReply({
                content: error instanceof Error ? error.message : '參加條件格式不正確，請檢查後重試。'
            })
        }

        const startAt = new Date()
        const endAt = new Date(startAt.getTime() + duration * 60_000)
        const endTimestamp = Math.floor(endAt.getTime() / 1000)
        const requirementLines = [
            '需要身分組：' +
                (requirementOptions.requiredRoles?.length
                    ? requirementOptions.requiredRoles.map((id) => '<@&' + id + '>').join(', ')
                    : '無'),
            '排除身分組：' +
                (requirementOptions.blacklistedRoles?.length
                    ? requirementOptions.blacklistedRoles.map((id) => '<@&' + id + '>').join(', ')
                    : '無'),
            '最低帳號年齡：' +
                (requirementOptions.minAccountAge ? requirementOptions.minAccountAge + ' 天' : '無'),
            '最低伺服器停留時間：' +
                (requirementOptions.minServerTime ? requirementOptions.minServerTime + ' 天' : '無')
        ]

        const giveawayEmbed = new EmbedBuilder()
            .setColor(ACCENT_COLOR)
            .setTitle('🎁 抽獎活動')
            .setDescription([
                '## ' + prize,
                description || '參加活動並等待結束，即有機會獲得獎品。',
                '',
                '**參加人數** · 0',
                '**得獎名額** · ' + winners,
                '**截止時間** · <t:' + endTimestamp + ':F>（<t:' + endTimestamp + ':R>）'
            ].join('\n'))
            .addFields({
                name: '參加條件',
                value: requirementLines.map((line) => '• ' + line).join('\n')
            })
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setFooter({ text: 'Paper Giveaway · 點擊下方按鈕即可參加或退出' })

        const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway-join')
                .setLabel('參加抽獎')
                .setEmoji('🎟️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('giveaway-reroll/' + interaction.user.id)
                .setLabel('重新抽獎')
                .setEmoji('🎲')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        )

        let messageId: string | undefined
        let giveawaySaved = false
        try {
            const message = await channel.send({
                embeds: [giveawayEmbed],
                components: [buttons],
                allowedMentions: { parse: [] }
            })
            messageId = message.id

            const giveawayData = {
                messageId: message.id,
                guildId: channel.guild.id,
                channelId: channel.id,
                startAt: startAt.getTime(),
                endAt: endAt.getTime(),
                winnerCount: winners,
                prize,
                hostedBy: interaction.user.id,
                participants: [] as string[],
                winners: [] as string[],
                description,
                ...requirementOptions
            }
            await client.giveawaysManager.saveGiveaway(message.id, giveawayData)
            giveawaySaved = true
            client.giveawaysManager.scheduleEnd(message.id, endAt.getTime() - Date.now())

            const stats = await GiveawayStats.findOneAndUpdate(
                { guildId: interaction.guildId },
                {
                    $inc: { totalGiveaways: 1, activeGiveaways: 1, totalPrizes: 1 },
                    $setOnInsert: { totalParticipants: 0, totalWinners: 0 }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )

            const hostedCount = await Giveaway.countDocuments({
                guildId: interaction.guildId,
                hostedBy: interaction.user.id
            })
            if (stats && (!stats.mostActiveHoster?.userId || hostedCount >= (stats.mostActiveHoster.count ?? 0))) {
                stats.mostActiveHoster = { userId: interaction.user.id, count: hostedCount }
                await stats.save()
            }

            return interaction.editReply({
                content:
                    '抽獎已建立並發布至 ' + channel + '\n' +
                    '[前往活動](https://discord.com/channels/' +
                    channel.guild.id + '/' + channel.id + '/' + message.id + ')'
            })
        } catch (error) {
            console.error('建立抽獎失敗：', error)

            if (messageId && !giveawaySaved) {
                const persisted = await Giveaway.exists({ messageId }).catch(() => null)
                if (!persisted) await channel.messages.delete(messageId).catch(() => null)
            }

            if (giveawaySaved) {
                return interaction.editReply({
                    content: '抽獎已發布，但統計資料更新失敗。活動仍可正常參加。'
                })
            }

            return interaction.editReply({
                content: '建立抽獎時發生錯誤，請稍後再試。如果活動訊息已出現，請先查看進行中的活動清單。'
            })
        }
    }
}
