const { ChatInputCommandInteraction, Client } = require("discord.js");
const ms = require("ms");

module.exports = {
  subCommand: "music.volume",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    const { options, member } = interaction;
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

    const Volume = options.getNumber("percent");
    if (Volume > 100 || Volume < 1)
      return interaction.reply({ content: "> 你必須指定1到100之間的數字!" });

    client.distube.setVolume(VoiceChannel, Volume);
    return interaction.reply({ content: `> 📶 成功設置音量為 \`${Volume}%\`` });
  },
};
