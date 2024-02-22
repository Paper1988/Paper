module.exports = {
    name: "interactionCreate",
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        if (!interaction.isModalSubmit()) return;
        if (!interaction.customId === "addSong") return;
        const { member } = interaction;
        const VoiceChannel = member.voice.channel;
        const songName = interaction.fields.getTextInputValue('songName');

        await client.distube.play(VoiceChannel, songName, { member });
        return interaction.reply({ content: `<:plus_988409343743496232:1202215484318302208> | 成功添加新歌曲: ${songName}`, ephemeral: true });
    },
};