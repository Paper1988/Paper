const Button = require("../../Systems/MusicButtons");
const Embed = require("../../Systems/MusicEmbed");

module.exports = {
    id: "togglePause", // The buttons .setCustomId
    async execute(interaction, client) { // To access an id / value from a button you MUST INCLUDE `client` AND `args` and in the same order as shown
        const { member } = interaction;
        const VoiceChannel = member.voice.channel;
        const message = require("../../Events/Distube/DistubeEvents");

        if (!VoiceChannel)
        return interaction.reply({
            content: "<:warning_908958943466893323:1201844340276862976> | 你必須待在一個語音頻道裡面才能使用音樂按鈕!",
            ephemeral: true,
        });
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
        return interaction.reply({
            content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
            ephemeral: true,
        });

        const queue = client.distube.getQueue(VoiceChannel);
        if (!queue) return interaction.reply({ content: "<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!" });

        if (!queue.paused) {
            await queue.pause(VoiceChannel);
            Button[0].components[2].setEmoji("<:play_861852632800952320:1202112864857628692>");
            message.edit({ embeds: [Embed(queue, queue.songs[0])], components: Button });
            return interaction.reply({ content: "<:pause_861852632914198548:1201843739728035961> | 成功暫停播放歌曲", ephemeral: true, });
        } else {
            await queue.resume(VoiceChannel);
            Button[0].components[2].setEmoji("<:pause_861852632914198548:1201843739728035961>");
            message.edit({ embeds: [Embed(queue, queue.songs[0])], components: Button });
            return interaction.reply({ content: "<:play_861852632800952320:1202112864857628692> | 成功恢復播放歌曲", ephemeral: true, });
        }
    }
}