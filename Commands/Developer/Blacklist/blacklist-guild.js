const BlackListGuild = require('../../../Structures/Schemas/BlacklistGuild')
const { CommandInteraction, Client } = require('discord.js')

module.exports = {
    subCommand: 'blacklist.guild',
    /**
     *
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true })
        const { options } = interaction
        const ID = options.getString('guild-id')
        const reason = options.getString('reason') || '無提供'
        if (isNaN(ID))
            return interaction.editReply({
                content: `<:outage_868122243845206087:1202112862990897172> | ID應該要是一串數字`
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
                content: `<:correct_859388130411282442:1201843648229294121> | 成功添加 **${Guild.name} || ${Guild.id}** 至伺服器黑名單 , 原因: ${reason}`
            })
        } else {
            await Data.delete()
            interaction.editReply({
                content: `<:correct_859388130411282442:1201843648229294121> | 成功從伺服器黑名單中移除 **${Guild.name} || ${Guild.id}**`
            })
        }
    }
}
