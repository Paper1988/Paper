import { PaperClient } from '@/Structures/classes/PaperClient.js'
import { buildComponentsV2Prototype } from '@/Systems/UI/ComponentsV2Prototype.js'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

export default {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('components-v2-test')
        .setDescription('(僅限開發人員) 測試 Components V2 訊息'),
    async execute(interaction: ChatInputCommandInteraction, _client: PaperClient) {
        await interaction.reply(buildComponentsV2Prototype())
    }
}
