const {
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  subCommand: "music.seek",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, member } = interaction;
    const VoiceChannel = member.voice.channel;

    if (!VoiceChannel)
      return interaction.reply({
        content: "<:outage_868122243845206087:1202112862990897172> | 你必須待在一個語音頻道裡面才能使用音樂指令!",
        ephemeral: true,
      });
    if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
      return interaction.reply({
        content: `<:outage_868122243845206087:1202112862990897172> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
        ephemeral: true,
      });

    const queue = await client.distube.getQueue(VoiceChannel);
    const Time = options.getNumber("time");

    if (!queue) return interaction.reply({ content: "<:outage_868122243845206087:1202112862990897172> | 找不到清單" });

    await queue.seek(Time);
    return interaction.reply({ content: `<:rightarrow_859388126653186058:1202113627122061403> | 跳到 **\`${Time}\`**` });
  },
};
