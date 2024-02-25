const { ChatInputCommandInteraction, Client } = require("discord.js");
const lyricsSearcher = require("lyrics-searcher");

module.exports = {
    subCommand: "music.volume",
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options, member } = interaction;
        const VoiceChannel = member.voice.channel;
        const queue = await client.distube.getQueue(VoiceChannel) || options.getString("queue");

        let lyrics = lyricsSearcher(queue.songs[0].provider.name, queue.songs[0].name) || "<:outage_868122243845206087:1202112862990897172> | 找不到該歌曲的歌詞!";
        return await interaction.reply({ content: `<:speaker_860133545544908802:1201844300099354644> | 成功搜尋到歌詞: \`\`\`${lyrics}\`\`\`` });
    },
};