const client = require("../../index.js");
const { EmbedBuilder } = require("discord.js");

const status = (queue) =>
  `<:icons_speaker:860133545544908802>音量: \`${queue.volume}%\` | <:icons_spark:860123643722727444>過濾器: \`${
    queue.filters.names.join(", ") || "<:icons_xmarkwhite:988409378161954866>"
  }\` | <:icons_loop:861852632893227029>重複播放: \`${
    queue.repeatMode ? (queue.repeatMode === 2 ? "<:icons_repeat:988409346637594744>整個清單" : "<:icons_repeatonce:988409348826992680>單曲") : "<:icons_xmarkwhite:988409378161954866>"
  }\` | <:icons_update:860123644297871382>自動播放: \`${queue.autoplay ? "<:correct_859388130411282442:1201843648229294121>" : "<:icons_xmarkwhite:988409378161954866>"}\``;

client.distube
  .on("playSong", (queue, song) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `<:play_861852632800952320:1202112864857628692> | 播放 \`${song.name}\` - \`${
              song.formattedDuration
            }\`\n<:icons_friends:861852632767528970>請求者: ${song.user}\n${status(queue)}`
          ),
      ],
    })
  )
  .on("addSong", (queue, song) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `<:icons_plus:988409343743496232> | <:icons_friends:861852632767528970>${song.user} 加入 ${song.name} - \`${song.formattedDuration}\` 到清單中`
          ),
      ],
    })
  )
  .on("addList", (queue, playlist) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `<:icons_plus:988409343743496232> | <:icons_friends:861852632767528970>${song.user} 加入 \`${playlist.name}\` 播放清單 (\`${
              playlist.songs.length
            }\`首歌) 到清單中\n${status(queue)}`
          ),
      ],
    })
  )
  .on("error", (channel, e) => {
    channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription(`<:icons_Wrong:859388130636988436> | 發生錯誤: ${e.toString().slice(0, 1974)}`),
      ],
    });
    console.error(e);
  })
  .on("empty", (queue) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription("<:icons_kick:859424400557604886>語音頻道是空的！<:icons_leave:860487640113217546>離開頻道中..."),
      ],
    })
  )
  .on("searchNoResult", (message, query) =>
    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription(`<:warning_908958943466893323:1201844340276862976> | 找不到: \`${query}\`!`),
      ],
    })
  )
  .on("finish", (queue) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription(`<:icons_musicstop:861852633979420712>清單播放完畢！`),
      ],
    })
  );
