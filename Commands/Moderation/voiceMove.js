const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("voice-move")
        .setDescription("將所有用戶從目前語音頻道移動到另一個語音頻道")
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
        .addChannelOption((option) => option.setName("move-to").setDescription("選擇要將成員移動到的頻道").setRequired(true)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * 
     */
    async execute(interaction) {
        const { member, options } = interaction;
        const newChannel = options.getChannel("move-to");
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) return interaction.reply({ content: "您需要在語音頻道中才能移動成員!", ephemeral: true });
        if (newChannel === voiceChannel) return interaction.reply({ content: "您不能將成員移動到同一個頻道!", ephemeral: true })

        voiceChannel.members.forEach(m => {
            m.voice.setChannel(newChannel, `由 ${member.user.tag} 移動`)
        })
        interaction.reply({ content: `> 成功將所有成員移動到 ${newChannel}`, ephemeral: true })
    }
}