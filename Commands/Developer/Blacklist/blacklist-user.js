const BlackListUser = require('../../../Structures/Schemas/BlacklistUser')
const { CommandInteraction, Client } = require('discord.js')

module.exports = {
    subCommand: 'blacklist.user',
    /**
     *
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true })
        const { options } = interaction
        const ID = options.getString('user-id')
        const reason = options.getString('reason') || '無提供'
        if (isNaN(ID))
            return interaction.editReply({
                content: `<:outage_868122243845206087:1202112862990897172> | ID應該要是一串數字`
            })
        const User = await client.users.fetch(ID)
        let Data = await BlackListUser.findOne({ User: User.id }).catch(() => {})
        if (!Data) {
            Data = new BlackListUser({
                User: User.id,
                Reason: reason,
                Time: Date.now()
            })
            await Data.save()
            interaction.editReply({
                content: `<:correct_859388130411282442:1201843648229294121> | 成功添加 **${User} | ${User.id} | ${User.username}** 至用戶黑名單 , 原因: ${reason}`
            })
        } else {
            await Data.delete()
            interaction.editReply({
                content: `<:correct_859388130411282442:1201843648229294121> | 成功從用戶黑名單中移除 **${User} | ${User.id} | ${User.username}**`
            })
        }
    }
}
