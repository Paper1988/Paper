const { EmbedBuilder, ChatInputCommandInteraction, Client, PermissionFlagsBits } = require("discord.js");
const ms = require('ms');

module.exports = {
    subCommand: "music.seek",
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(client, interaction) {
        const { options, member, guild, channel } = interaction;
        const VoiceChannel = member.voice.channel;

        if (!VoiceChannel)
            return interaction.reply({ content: "> 你必須待在一個語音頻道裡面才能使用音樂指令!", ephemeral: true });
        if (guild.me.voice.channelId && VoiceChannel.id !== guild.me.voice.channelId)
            return interaction.reply({ content: `> 我已經在語音頻道 - <#${guild.me.voice.channelId}> 裡播放音樂了`, ephemeral: true });

        const queue = await client.distube.getQueue(VoiceChannel);
        const Time = options.getNumber("time");

        if (!queue)
            return interaction.reply({ content: "⛔ 找不到清單" });

        await queue.seek(Time);
        return interaction.reply({ content: `⏩ **跳到 \`${Time}\`**` });
    }
}