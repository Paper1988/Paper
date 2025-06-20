import { PaperClient } from '@/classes/PaperClient.js'
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder().setName('debug').setDescription('Show debug information'),
    developer: true,
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        await interaction.deferReply({ ephemeral: true })

        const commandsCount = client.commands.size
        const eventsCount = client.events?.size ?? 0
        const buttonsCount = client.buttons.size
        const subsCount = client.subCommands.size
        const modalsCount = client.modals.size
        const menusCount = client.selectMenus.size
        const contextCount = client.contextMenus.size
        const guildCount = client.guilds.cache.size
        const userCount = client.users.cache.size

        const logStr = `
            命令數量: ${commandsCount}
            事件數量: ${eventsCount}
            按鈕數量: ${buttonsCount}
            子命令數量: ${subsCount}
            模態對話框: ${modalsCount}
            選單數量: ${menusCount}
            右鍵菜單: ${contextCount}
            伺服器數: ${guildCount}
            用戶數: ${userCount}
            互動 ID: ${interaction.id}
            用戶 ID: ${interaction.user.id}
            節點版本: ${process.version}
            機器人延遲: ${client.ws.ping}ms
            記憶體用量: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
        `
        console.log('>>> 調試命令執行:\n', logStr)

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('🔍 Debug Information')
            .setDescription('```' + logStr + '```')
            .setFooter({ text: 'Interaction Test Success!' })
            .setTimestamp()

        await interaction.editReply({ embeds: [embed] })
    }
}
