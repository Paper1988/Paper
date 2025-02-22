const BlackListGuild = require('../../../Structures/Schemas/BlacklistGuild')
const { CommandInteraction, Client, MessageFlags } = require('discord.js')

module.exports = {
    subCommand: 'blacklist.guild',
    /**
     *
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        const { options } = interaction
        const ID = options.getString('guild-id')
        const reason = options.getString('reason') || '無提供'
        if (isNaN(ID))
            return interaction.editReply({
                content: `<:outage:1265561329528471613> | ID應該要是一串數字`
            })
        const Guild = await client.guilds.fetch(ID)
        let Data = await BlackListGuild.findOne({ Guild: Guild.id }).catch((err) => {})
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
            await Data.delete()
            interaction.editReply({
                content: `<:correct:1265560254708711467> | 成功從伺服器黑名單中移除 **${Guild.name} || ${Guild.id}**`
            })
        }
    }
}
