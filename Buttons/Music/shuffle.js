module.exports = {
    id: "shuffle",
    async execute(interaction, client) {
        const { member } = interaction;
        const VoiceChannel = member.voice.channel;
        const queue = client.distube.getQueue(VoiceChannel);
        if (!queue) return interaction.reply({ content: "<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!" });

        await queue.shuffle(VoiceChannel);
        return interaction.reply({ content: "<:shuffle_988409354208313404:1201844292751212574> | 成功隨機打亂歌曲", ephemeral: true, });
    }
}