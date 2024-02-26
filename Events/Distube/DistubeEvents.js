const client = require("../../index.js");
const { EmbedBuilder } = require("discord.js");
const DB = require("../../Structures/Schemas/MusicDB.js");
const MusicEmbed = require("../../Systems/MusicEmbed.js");
const MusicButtons = require("../../Systems/MusicButtons.js");

client.distube
  .on("playSong", async (queue, song) => {
    const message = await queue.textChannel.send({
      embeds: [MusicEmbed(queue, song)],
      components: MusicButtons,
    });
    const update = setInterval(() => {
      message.edit({ embeds: [MusicEmbed(queue, song)] });
    }, 5000);
    module.exports = { message, update };
  })
  .on("addSong", (queue, song) => {
    let embed = MusicEmbed(queue, song);
    embed.data.fields = null;
    queue.textChannel.send({
      embeds: [
        embed
          .setDescription(
            `<:plus_988409343743496232:1202215484318302208> | 加入 [${song.name}](${song.url}) - \` ${song.formattedDuration} \` 到清單中`
          )
      ],
    });
  })
  .on("addList", (queue, playlist) => {
    let embed = MusicEmbed(queue, song);
    embed.data.fields = null;
    queue.textChannel.send({
      embeds: [
        embed
          .setDescription(
            `<:plus_988409343743496232:1202215484318302208> | 加入 [${playlist.name}](${playlist.url}) 播放清單 (\` ${
              playlist.songs.length
            } \`首歌) 到清單中`
          )
      ],
    });
  })
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
  .on("initQueue", async (queue) => {
    let Data = await DB.findOne({ GuildID: queue.id });
    if (!Data) {
      Data = new DB({
        GuildID: queue.id,
        volume: queue.volume,
        autoplay: queue.autoplay,
        repeatMode: queue.repeatMode,
      });
      await Data.save();
    }
    queue.autoplay = Data.autoplay;
    queue.volume = Data.volume;
    queue.repeatMode = Data.repeatMode;
  })
  .on("finishSong", async (queue, song) => {
    const { message, update } = require("./DistubeEvents");
    await message.edit({ embeds: [MusicEmbed(queue, song)] });
    if (queue.repeatMode === 0 && !queue.songs[1]) {
      clearInterval(update);
      await queue.textChannel.messages.delete(message.id);
    }
  });