import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { buildHelpCommand, buildHelpHome } from '@/Systems/UI/HelpRenderer.js'

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setNameLocalization('zh-TW', '幫助')
        .setNameLocalization('ja', 'ヘルプ')
        .setDescription('View command list')
        .setDescriptionLocalization('zh-TW', '查看指令列表')
        .setDescriptionLocalization('ja', 'コマンドリストを表示')
        .addStringOption((option) =>
            option
                .setName('command')
                .setNameLocalization('zh-TW', '指令')
                .setNameLocalization('ja', 'コマンド')
                .setDescription('Look up a command by name, e.g. botinfo')
                .setDescriptionLocalization('zh-TW', '輸入指令名稱查看用途與參數，例如 botinfo')
                .setDescriptionLocalization('ja', 'コマンド名を入力して使い方と引数を確認します')
                .setRequired(false),
        ),
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        const requestedCommand = interaction.options.getString('command')?.trim().replace(/^\/+/, '').toLowerCase()
        const response = requestedCommand
            ? buildHelpCommand(client, requestedCommand)
            : buildHelpHome(client)

        await interaction.reply(response)
    },
}
