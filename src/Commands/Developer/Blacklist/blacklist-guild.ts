import { ChatInputCommandInteraction, Client, MessageFlags } from 'discord.js'

import type { SubCommandType } from '@/typings/command'
import BlackListGuild from '../../../Structures/Schemas/BlacklistGuild'

export default {
    subCommand: 'blacklist.guild',
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        const { options } = interaction
        const ID = options.getNumber('guild-id')!
        const reason = options.getString('reason') || '無提供'
        if (isNaN(ID))
            return interaction.editReply({
                content: `<:outage:1265561329528471613> | ID應該要是一串數字`
            })
        const Guild = await client.guilds.fetch(ID.toString())
        let Data = await BlackListGuild.findOne({ Guild: Guild.id })
            .exec()
            .catch((err) => {})
        if (!Data) {
            Data = new BlackListGuild({
                Guild: Guild.id,
                Reason: reason,
                Time: Date.now()
            })
            await Data.save()
            interaction.editReply({
                content: `<:correct:1265560254708711467> | 成功添加 **${Guild.name} || ${Guild.id}** 至伺服器黑名單 , 原因: ${reason}`
            })
        } else {
            await Data.deleteOne()
            interaction.editReply({
                content: `<:correct:1265560254708711467> | 成功從伺服器黑名單中移除 **${Guild.name} || ${Guild.id}**`
            })
        }
    }
} as SubCommandType
