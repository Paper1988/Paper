import { PaperClient } from '@/Structures/classes/PaperClient.js'
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

        const logStr = `命令數量: ${commandsCount}\n事件數量: ${eventsCount}\n按鈕數量: ${buttonsCount}\n子命令數量: ${subsCount}\n模態對話框: ${modalsCount}\n選單數量: ${menusCount}\n右鍵菜單: ${contextCount}\n伺服器數: ${guildCount}\n用戶數: ${userCount}\n互動 ID: ${interaction.id}\n用戶 ID: ${interaction.user.id}\n節點版本: ${process.version}\n機器人延遲: ${client.ws.ping}ms\n記憶體用量: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('🔍 Debug Information')
            .setDescription('```' + logStr + '```')
            .setFooter({ text: 'Interaction Test Success!' })
            .setTimestamp()

        await interaction.editReply({ embeds: [embed] })
    }
}
