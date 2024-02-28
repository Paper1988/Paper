const { ModalSubmitInteraction, Client } = require("discord.js");

module.exports = {
    id: "addSong",
    /**
     * @param {ModalSubmitInteraction} interaction 
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { member } = interaction;
        const VoiceChannel = member.voice.channel;
        const songName = interaction.fields.getTextInputValue('songName');

        await client.distube.play(VoiceChannel, songName, { member });
        const msg = await interaction.reply({ content: `<:plus_988409343743496232:1202215484318302208> | 成功添加新歌曲: ${songName}`, ephemeral: true });
        setTimeout(async () => {
            await msg.delete();
        }, 10 * 1000);
    }
}