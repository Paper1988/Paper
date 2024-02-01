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
        content: "<:warning_908958943466893323:1201844340276862976> | 你必須待在一個語音頻道裡面才能使用音樂指令!",
        ephemeral: true,
      });
    if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
      return interaction.reply({
        content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
        ephemeral: true,
      });

    const queue = await client.distube.getQueue(VoiceChannel);

    if (!queue) return interaction.reply({ content: "<:outage_868122243845206087:1202112862990897172> | 找不到清單" });

    switch (options.getString("options")) {
      case "skip":
        await queue.skip(VoiceChannel);
        return interaction.reply({ content: "<:frontforward_988409335791124551:1202215991694856262> | 成功跳過歌曲" });

      case "stop":
        await queue.stop(VoiceChannel);
        return interaction.reply({ content: "<:stop_988409337837924422:1201844316675510364> | 成功停止音樂並退出語音頻道" });

      case "pause":
        await queue.pause(VoiceChannel);
        return interaction.reply({ content: "<:pause_861852632914198548:1201843739728035961> | 成功暫停播放歌曲" });

      case "resume":
        await queue.resume(VoiceChannel);
        return interaction.reply({ content: "<:play_861852632800952320:1202112864857628692> | 成功繼續播放歌曲" });

      case "shuffle":
        await queue.shuffle(VoiceChannel);
        return interaction.reply({ content: "<:shuffle_988409354208313404:1201844292751212574> | 成功隨機播放歌曲" });

      case "autoplay":
        let Mode = await queue.toggleAutoplay(VoiceChannel);
        return interaction.reply({
          content: `<:loop_861852632893227029:1201843696031764490> | 成功切換自動播放模式成: \`${Mode ? "<:correct_859388130411282442:1201843648229294121>" : "<:xmark_988409378161954866:1201844342029815848>"}\``,
        });

      case "previous":
        await queue.previous(VoiceChannel);
        return interaction.reply({ content: "<:backforward_988409328698523708:1201843626435686440> | 成功播放上一首曲目" });

      case "related":
        await queue.addRelatedSong(VoiceChannel);
        return interaction.reply({
          content: "<:plus_988409343743496232:1202215484318302208>成功添加相似歌曲到播放清單中",
        });

      case "repeat":
        let Mode2 = await client.distube.setRepeatMode(queue);
        return interaction.reply({
          content: `<:loop_861852632893227029:1201843696031764490> | 成功切換重複播放模式為: \`${(Mode2 = Mode2
            ? Mode2 == 2
              ? "<:loop_988409346637594744:1201843698976178246>整個清單"
              : "<:looponce_988409348826992680:1201884069399363634>單曲"
            : "<:xmark_988409378161954866:1201844342029815848>")}\``,
        });

      case "queue":
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Purple")
              .setDescription(
                `<:queue_861852633240961024:1202112866069520385> | 播放清單\n${queue.songs
                  .slice(0, 10)
                  .map((song, id) => `\n**${id + 1}**. \`${song.name}\` - \`${song.formattedDuration}\``)}`),
          ],
        });
    }
  },
};
