const { ChatInputCommandInteraction, Client } = require("discord.js");

module.exports = {
  subCommand: "music.jump",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    const { options, channel, member } = interaction;
    const VoiceChannel = member.voice.channel;

    const position = options.getNumber("position");

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

    client.distube.jump(VoiceChannel, position).catch(err => interaction.reply({ content: "<:warning_908958943466893323:1201844340276862976> | 無效的數字", ephemeral: true }));
    return interaction.reply({ content: `<:frontforward_988409335791124551:1202215991694856262> | 成功跳至清單位置 \`${position}\` - ${song}` });
  },
};