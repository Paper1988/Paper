const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voice-move')
        .setDescription('將用戶從目前語音頻道移動到另一個語音頻道')
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
        .setDMPermission(false)
        .addChannelOption((option) =>
            option
                .setName('move-to')
                .setDescription('請選擇頻道')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true)
        )
        .addUserOption((option) =>
            option.setName('target').setDescription('選擇用戶').setRequired(false)
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { member, options } = interaction
        const newChannel = options.getChannel('move-to')
        const voiceChannel = member.voice.channel
        const target = options.getMember('target')

        if (!voiceChannel)
            return await interaction.reply({
                content: '<:warning:1265562532857380936> | 您需要在語音頻道中才能移動成員!',
                ephemeral: true
            })
        if (newChannel === voiceChannel)
            return await interaction.reply({
                content: '<:warning:1265562532857380936> | 您不能將成員移動到同一個頻道!',
                ephemeral: true
            })

        if (!target) {
            voiceChannel.members.forEach((m) => {
                m.voice.setChannel(newChannel, `由 ${member.user.tag} 移動`)
            })
            return await interaction.reply({
                content: `<:moveaudience:1265561080386555978> | 成功將所有成員移動到 ${newChannel}`,
                ephemeral: true
            })
        } else {
            const members = voiceChannel.members.map((m) => m.id)
            if (members.includes(target.id)) {
                await target.voice.setChannel(newChannel, `由 ${member.user.tag} 移動`)
                return await interaction.reply({
                    content: `<:moveaudience:1265561080386555978> | 成功將成員 ${target} 移動到 ${newChannel}`,
                    ephemeral: true
                })
            } else {
                return await interaction.reply({
                    content: '<:warning:1265562532857380936> | 該成員不在語音頻道中!',
                    ephemeral: true
                })
            }
        }
    }
}
