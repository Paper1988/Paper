const { ChatInputCommandInteraction, Client } = require("discord.js");
const ms = require("ms");

module.exports = {
  subCommand: "music.play",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    const { options, channel, member } = interaction;
    const VoiceChannel = member.voice.channel;

    if (!VoiceChannel)
      return interaction.reply({
        content: "> 你必須待在一個語音頻道裡面才能使用音樂指令!",
        ephemeral: true,
      });
    if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
      return interaction.reply({
        content: `> 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
        ephemeral: true,
      });

    client.distube.play(VoiceChannel, options.getString("query"), {
      textChannel: channel,
      member: member,
    });
    return interaction.reply({ content: "> 🎼 請求已接受 - 預設音量為`50%`" });
  },
};
