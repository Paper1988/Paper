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

    if (!VoiceChannel)
      return interaction.reply({
        content: "<:icons_outage:868122243845206087> | 你必須待在一個語音頻道裡面才能使用音樂指令!",
        ephemeral: true,
      });
    if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
      return interaction.reply({
        content: `<:icons_outage:868122243845206087> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
        ephemeral: true,
      });

    const Volume = options.getNumber("percent");
    if (Volume > 100 || Volume < 1)
      return interaction.reply({ content: "<:icons_outage:868122243845206087> | 你必須指定1到100之間的數字!" });

    client.distube.setVolume(VoiceChannel, Volume);
    if (Volume === 0)
      return interaction.reply({ content: `<:icons_speakermute:860133545963159563> | 成功設置音量為 \`${Volume}%\`` });
    else if (Volume < 50 || Volume > 0)
      return interaction.reply({ content: `<:icons_speakerlow:860133546278387763> | 成功設置音量為 \`${Volume}%\`` });
    else if (Volume > 50)
      return interaction.reply({ content: `<:icons_speaker:860133545544908802> | 成功設置音量為 \`${Volume}%\`` });
  },
};