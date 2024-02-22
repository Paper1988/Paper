module.exports = {
    id: "related",
    async execute(interaction, client) { // To access an id / value from a button you MUST INCLUDE `client` AND `args` and in the same order as shown
        const { member } = interaction;
        const VoiceChannel = member.voice.channel;
        const message = require("../../Events/Distube/DistubeEvents");
        const Embed = require("../../Systems/MusicEmbed");

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
        await queue.addRelatedSong(VoiceChannel);
        message.edit({ embeds: [Embed(queue, song)] });
        return interaction.reply({
            content: "<:plus_988409343743496232:1202215484318302208> | 成功添加相似歌曲到播放清單中",
            ephemeral: true,
        });
    }
}