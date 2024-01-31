const {
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  subCommand: "music.settings",
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

    if (!queue) return interaction.reply({ content: "<:outage_868122243845206087:1202112862990897172> | 找不到清單" });

    switch (options.getString("options")) {
      case "skip":
        await queue.skip(VoiceChannel);
        return interaction.reply({ content: "<:icons_frontforward:988409335791124551> | 成功跳過歌曲" });

      case "stop":
        await queue.stop(VoiceChannel);
        return interaction.reply({ content: "<:icons_musicstop:988409337837924422> | 成功停止音樂並退出語音頻道" });

      case "pause":
        await queue.pause(VoiceChannel);
        return interaction.reply({ content: "<:icons_pause:861852632914198548> | 成功暫停播放歌曲" });

      case "resume":
        await queue.resume(VoiceChannel);
        return interaction.reply({ content: "<:play_861852632800952320:1202112864857628692> | 成功繼續播放歌曲" });

      case "shuffle":
        await queue.shuffle(VoiceChannel);
        return interaction.reply({ content: "<:icons_shuffle:988409354208313404> | 成功隨機播放歌曲" });

      case "autoplay":
        let Mode = await queue.toggleAutoplay(VoiceChannel);
        return interaction.reply({
          content: `<:icons_update:860123644297871382> | 成功切換自動播放模式成: \`${Mode ? "<:correct_859388130411282442:1201843648229294121>" : "<:icons_xmarkwhite:988409378161954866>"}\``,
        });

      case "previous":
        await queue.previous(VoiceChannel);
        return interaction.reply({ content: "<:icons_reply:859388126153932802> | 成功播放上一首曲目" });

      case "related":
        await queue.addRelatedSong(VoiceChannel);
        return interaction.reply({
          content: "<:icons_plus:988409343743496232>成功添加相似歌曲到播放清單中",
        });

      case "repeat":
        let Mode2 = await client.distube.setRepeatMode(queue);
        return interaction.reply({
          content: `<:icons_loop:861852632893227029> | 成功切換重複播放模式為: \`${(Mode2 = Mode2
            ? Mode2 == 2
              ? "<:icons_repeat:988409346637594744>整個清單"
              : "<:icons_repeatonce:988409348826992680>單曲"
            : "<:icons_xmarkwhite:988409378161954866>")}\``,
        });

      case "queue":
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Purple")
              .setDescription(
                `${queue.songs
                  .slice(0, 10)
                  .map(
                    (song, id) =>
                      `\n**${id + 1}**. ${song.name} - \`${
                        song.formattedDuration
                      }\``
                  )}`
              ),
          ],
        });
    }
  },
};
