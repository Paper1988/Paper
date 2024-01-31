const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("一個完善的音樂系統")
    .addSubcommand((sub) =>
      sub
        .setName("play")
        .setDescription("播放音樂")
        .addStringOption((options) =>
          options
            .setName("query")
            .setDescription("請提供歌名或連結")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("volume")
        .setDescription("調整音量大小")
        .addNumberOption((options) =>
          options
            .setName("percent")
            .setDescription("請提供音量(1 = 1%)")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("seek")
        .setDescription("跳到指定位置")
        .addNumberOption((options) =>
          options
            .setName("time")
            .setDescription("請提供要跳到的時間（以秒為單位）")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("filters")
        .setDescription("切換過濾器")
        .addStringOption((options) =>
          options
            .setName("set")
            .setDescription("請選擇一個過濾器")
            .setRequired(true)
            .addChoices(
              { name: "<:linkremove_865572289022394368:1201843685084647435>關閉所有過濾器", value: "false" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 8d 過濾器", value: "8d" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 低音增強 過濾器", value: "bassboost" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 回音 過濾器", value: "echo" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 nightcore 過濾器", value: "nightcore" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 環繞音 過濾器", value: "surround" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 karaoke 過濾器", value: "karaoke" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 vaporwave 過濾器", value: "vaporwave" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 flanger 過濾器", value: "flanger" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 gate 過濾器", value: "gate" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 haas 過濾器", value: "haas" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 倒放 過濾器", value: "reverse" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 mcompand 過濾器", value: "mcompand" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 phaser 過濾器", value: "phaser" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 tremolo 過濾器", value: "tremolo" },
              { name: "<:linkadd_865572290065072128:1201884016404598814>切換 earwax 過濾器", value: "earwax" }
            )
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("settings")
        .setDescription("⚙歌曲設定")
        .addStringOption((options) =>
          options
            .setName("options")
            .setDescription("請選擇一個選項")
            .setRequired(true)
            .addChoices(
              { name: "<:queue_861852633240961024:1202112866069520385>顯示播放清單", value: "queue" },
              { name: "<:backforward_988409328698523708:1201843626435686440>播放上一首曲目", value: "previous" },
              { name: "<:pause_861852632914198548:1201843739728035961>暫停播放歌曲", value: "pause" },
              { name: "<:play_861852632800952320:1202112864857628692>繼續播放歌曲", value: "resume" },
              { name: "<:frontforward_988409335791124551:1202215991694856262> 跳過歌曲", value: "skip" },
              { name: "<:stop_988409337837924422:1201844316675510364>停止音樂", value: "stop" },
              { name: "<:shuffle_988409354208313404:1201844292751212574>隨機播放", value: "shuffle" },
              { name: "<:update_860123644297871382:1201844333968625695>切換自動播放", value: "autoplay" },
              { name: "<:plus_988409343743496232:1202215484318302208>添加相似歌曲", value: "related" },
              { name: "<:loop_861852632893227029:1201843696031764490>切換重複播放", value: "repeat" }
            
        )
    )
  ),
  usage: "/music (play, volume, settings, seek, filters)",
};
