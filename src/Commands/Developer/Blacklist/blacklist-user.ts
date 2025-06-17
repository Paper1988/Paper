import BlackListUser from '@/Structures/Schemas/BlacklistUser.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, Client, MessageFlags } from 'discord.js'

export default {
    subCommand: 'blacklist.user',

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        const { options } = interaction
        const ID = options.getNumber('user-id')!
        const reason = options.getString('reason') || '無提供'
        if (isNaN(ID)) {
            return interaction.editReply({
                content: '<:outage:1265561329528471613> | ID應該要是一串數字'
            })
        }
        const User = await client.users.fetch(ID.toString())
        let Data = await BlackListUser.findOne({ User: User.id })
            .exec()
            .catch(() => {})
        if (!Data) {
            Data = new BlackListUser({
                User: User.id,
                Reason: reason,
                Time: Date.now()
            })
            await Data.save()
            interaction.editReply({
                content: `<:correct:1265560254708711467> | 成功添加 **${User} | ${User.id} | ${User.username}** 至用戶黑名單 , 原因: ${reason}`
            })
        } else {
            await Data.deleteOne()
            interaction.editReply({
                content: `<:correct:1265560254708711467> | 成功從用戶黑名單中移除 **${User} | ${User.id} | ${User.username}**`
            })
        }
    }
} as SubCommandType
