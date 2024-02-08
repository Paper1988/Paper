const { ChatInputCommandInteraction, Client } = require("discord.js");

module.exports = {
  subCommand: "music.volume",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    const { options, member } = interaction;
    const VoiceChannel = member.voice.channel;
    const Volume = options.getNumber("percent");

    if (!VoiceChannel)
      return interaction.reply({
        content: "<:warning_908958943466893323:1201844340276862976> | 你必須待在一個語音頻道裡面才能使用音樂指令!",
        ephemeral: true,
      });
    if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
      return interaction.reply({
        content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
        ephemeral: true,
      });

    if (Volume > 100 || Volume < 1)
      return interaction.reply({ content: "<:outage_868122243845206087:1202112862990897172> | 你必須指定1到100之間的數字!" });

    client.distube.setVolume(VoiceChannel, Volume);
    if (Volume < 50 && Volume > 0)
      return interaction.reply({ content: `<:speaker_low_860133546278387763:1201844302725255178> | 成功設置音量為 \`${Volume}%\`` });
    else if (Volume >= 50)
      return interaction.reply({ content: `<:speaker_860133545544908802:1201844300099354644> | 成功設置音量為 \`${Volume}%\`` });
  },
};