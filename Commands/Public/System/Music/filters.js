const { ChatInputCommandInteraction, Client } = require("discord.js");
const ms = require("ms");

module.exports = {
  subCommand: "music.filters",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, member } = interaction;
    const VoiceChannel = member.voice.channel;

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

    const queue = await client.distube.getQueue(VoiceChannel);

    if (!queue) return interaction.reply({ content: "<:warning_908958943466893323:1201844340276862976> 找不到清單" });

    switch (options.getString("set")) {
      case "false":
        await queue.filters.clear();
        return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> 成功關閉所有過濾器` });

      case "8d":
        await queue.addFilter(`3d`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 8D 過濾器` });

      case "karaoke":
        await queue.addFilter(`karaoke`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 卡拉OK 過濾器` });

      case "vaporwave":
        await queue.addFilter(`vaporwave`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 vaporwave 過濾器` });

      case "flanger":
        await queue.addFilter(`flanger`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 flanger 過濾器` });

      case "gate":
        await queue.addFilter(`gate`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 gate 過濾器` });

      case "haas":
        await queue.addFilter(`haas`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 haas 過濾器` });

      case "reverse":
        await queue.addFilter(`reverse`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 倒放 過濾器` });

      case "mcompand":
        await queue.addFilter(`mcompand`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 mcompand 過濾器` });

      case "phaser":
        await queue.addFilter(`phaser`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 phaser 過濾器` });

      case "tremolo":
        await queue.addFilter(`tremolo`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 tremolo 過濾器` });

      case "earwax":
        await queue.addFilter(`earwax`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 erawax 過濾器` });

      case "bassboost":
        await queue.addFilter(`bassboost`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 低音增強 過濾器` });

      case "echo":
        await queue.addFilter(`echo`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 回音 過濾器` });

      case "nightcore":
        await queue.addFilter(`nightcore`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 nightcore 過濾器` });

      case "surround":
        await queue.addFilter(`surround`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 環繞聲 過濾器` });
    }
  },
};
