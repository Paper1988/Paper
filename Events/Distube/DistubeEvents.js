const client = require("../../index.js");
const { EmbedBuilder } = require("discord.js");

const status = (queue) =>
  `<:speaker_860133545544908802:1201844300099354644>音量: \`${queue.volume}%\` | <:spark_860123643722727444:1201844297041973320>過濾器: ${
    queue.filters.names.join(", ") || "<:xmark_988409378161954866:1201844342029815848>"
  } | <:loop_861852632893227029:1201843696031764490>重複播放: ${
    queue.repeatMode ? (queue.repeatMode === 2 ? "<:loop_988409346637594744:1201843698976178246>整個清單" : "<:looponce_988409348826992680:1201884069399363634>單曲") : "<:xmark_988409378161954866:1201844342029815848>"
  } | <:update_860123644297871382:1201844333968625695>自動播放: ${queue.autoplay ? "<:correct_859388130411282442:1201843648229294121>" : "<:xmark_988409378161954866:1201844342029815848>"}`;

client.distube
  .on("playSong", (queue, song) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `<:play_861852632800952320:1202112864857628692> | 播放 [${song.name}](${song.url}) - \`${
              song.formattedDuration
            }\`\n${status(queue)}`
          )
          .setAuthor({ name: `${song.user}`, iconURL: song.user.displayAvatarURL()})
          .setThumbnail(song.thumbnail)
          .setTimestamp(),
      ],
    })
  )
  .on("addSong", (queue, song) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `<:plus_988409343743496232:1202215484318302208> | 加入 [${song.name}](${song.url}) - \`${song.formattedDuration}\` 到清單中`
          )
          .setAuthor({ name: `${song.user}`, iconURL: `${song.user}`.displayAvatarURL()})
          .setThumbnail(song.thumbnail)
          .setTimestamp(),
      ],
    })
  )
  .on("addList", (queue, playlist) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `<:plus_988409343743496232:1202215484318302208> | 加入 [${playlist.name}](${playlist.url}) 播放清單 (\`${
              playlist.songs.length
            }\`首歌) 到清單中\n${status(queue)}`
          )
          .setAuthor({ name: `${song.user}`, iconURL: song.user.displayAvatarURL()})
          .setThumbnail(playlist.thumbnail)
          .setTimestamp(),
      ],
    })
  )
  .on("error", (channel, e) => {
    channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription(`<:outage_868122243845206087:1202112862990897172> | 發生錯誤: ${e.toString().slice(0, 1974)}`),
      ],
    });
  })
  .on("empty", (queue) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription("<:nomember_859424400557604886:1201843730626400256> | 語音頻道是空的！<:leave_860487640113217546:1202217506991771658>離開頻道中..."),
      ],
    })
  )
  .on("searchNoResult", (message, query) =>
    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription(`<:warning_908958943466893323:1201844340276862976> | 搜尋不到你要的結果: \`${query}\`!`)
          .setTimestamp(),
      ],
    })
  )
  .on("finish", (queue) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription(`<:musicstop_861852633979420712:1201843718215438386> | 清單播放完畢！`)
          .setTimestamp(),
      ],
    })
  )
  .on("searchCancel", (message) => 
    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription(`<:outage_868122243845206087:1202112862990897172> | 搜尋取消!`)
          .setTimestamp(),
      ],
    })
  )
  .on("searchDone", (message, answer, query) =>
    message.channel.send({
      embeds: [
        new EmbedBuilder()
        .setColor("Green")
        .setDescription(`<:search_859424401723883560:1201844291098382457> | 搜尋結果: ${query}`)
        .setTimestamp(),
      ],
    })
  )
  .on("searchInvalidAnswer", (message, answer, query) =>
    message.channel.send({
      embeds: [
        new EmbedBuilder()
        .setColor("Red")
        .setDescription(`<:warning_908958943466893323:1201844340276862976> | 無效輸入: \`${answer}\`!`)
        .setTimestamp(),
      ],
    })
  );