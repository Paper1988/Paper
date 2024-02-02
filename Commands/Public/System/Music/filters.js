const { ChatInputCommandInteraction, Client } = require("discord.js");

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

    if (!queue) return interaction.reply({ content: "<:warning_908958943466893323:1201844340276862976> | 播放清單是空的!" });

    switch (options.getString("set")) {
      case "false":
        await queue.filters.clear();
        return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功關閉所有過濾器` });

      case "8d":
        if (queue.filters.has(`8d`)) 
          await queue.filters.remove(`8d`);
        else await queue.filters.add(`8d`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 8d 過濾器` });

      case "karaoke":
        if (queue.filters.has(`karaoke`)) 
          await queue.filters.remove(`karaoke`);
        else await queue.filters.add(`karaoke`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 卡拉OK 過濾器` });

      case "vaporwave":
        if (queue.filters.has(`vaporwave`)) 
          await queue.filters.remove(`vaporwave`);
        else await queue.filters.add(`vaporwave`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 vaporwave 過濾器` });

      case "flanger":
        if (queue.filters.has(`flanger`)) 
          await queue.filters.remove(`flanger`);
        else await queue.filters.add(`flanger`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 flanger 過濾器` });

      case "gate":
        if (queue.filters.has(`gate`)) 
          await queue.filters.remove(`gate`);
        else await queue.filters.add(`gate`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 gate 過濾器` });

      case "haas":
        if (queue.filters.has(`haas`)) 
          await queue.filters.remove(`haas`);
        else await queue.filters.add(`haas`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 haas 過濾器` });

      case "reverse":
        if (queue.filters.has(`reverse`)) 
          await queue.filters.remove(`reverse`);
        else await queue.filters.add(`reverse`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 倒放 過濾器` });

      case "mcompand":
        if (queue.filters.has(`mcompand`)) 
          await queue.filters.remove(`mcompand`);
        else await queue.filters.add(`mcompand`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 mcompand 過濾器` });

      case "phaser":
        if (queue.filters.has(`phaser`)) 
          await queue.filters.remove(`phaser`);
        else await queue.filters.add(`phaser`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 phaser 過濾器` });

      case "tremolo":
        if (queue.filters.has(`tremolo`)) 
          await queue.filters.remove(`tremolo`);
        else await queue.filters.add(`8d`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 tremolo 過濾器` });

      case "earwax":
        if (queue.filters.has(`8earwax`)) 
          await queue.filters.remove(`earwax`);
        else await queue.filters.add(`earwax`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 erawax 過濾器` });

      case "bassboost":
        if (queue.filters.has(`bassboost`)) 
          await queue.filters.remove(`bassboost`);
        else await queue.filters.add(`bassboost`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 低音增強 過濾器` });

      case "echo":
        if (queue.filters.has(`echo`)) 
          await queue.filters.remove(`echo`);
        else await queue.filters.add(`echo`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 回音 過濾器` });

      case "nightcore":
        if (queue.filters.has(`nightcore`)) 
          await queue.filters.remove(`nightcore`);
        else await queue.filters.add(`nightcore`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 nightcore 過濾器` });

      case "surround":
        if (queue.filters.has(`surround`)) 
          await queue.filters.remove(`surround`);
        else await queue.filters.add(`surround`);
        return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> 成功增加 環繞聲 過濾器` });
    }
    interaction.channel.send({ content: `<:spark_860123643722727444:1201844297041973320>目前過濾器: \`${filter}\``, ephemeral: true });
  },
};
