import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import WeeklyStats from '@/Structures/Schemas/weeklyStats.js'

export default {
    data: new SlashCommandBuilder().setName('stats').setDescription('顯示最近一週的使用統計'),
    developer: true,
    async execute(interaction: ChatInputCommandInteraction) {
        const latest = await WeeklyStats.findOne().sort({ weekStart: -1 })
        if (!latest) {
            return interaction.reply('目前沒有統計資料。')
        }

        let reply = `📊 **${latest.weekStart.toDateString()} 的週統計**\n`
        reply += `- 活躍用戶數：${latest.activeUsers}\n`
        reply += `- 最常用的指令：\n`

        for (const c of latest.topCommands) {
            reply += `  • \`${c.command}\` (${c.count} 次)\n`
        }

        await interaction.reply({ content: reply })
    }
}
