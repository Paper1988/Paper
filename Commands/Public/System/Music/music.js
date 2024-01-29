const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("<:icons_music:860123644201271326>一個完善的音樂系統")
    .addSubcommand((sub) =>
      sub
        .setName("play")
        .setDescription("<:icons_play:861852632800952320> 播放音樂")
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
        .setDescription("<:icons_speaker:860133545544908802> 調整音量大小")
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
        .setDescription("<:icons_rightarrow:859388126653186058> 跳到指定位置")
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
        .setDescription("<:icons_linkupdate:865572289180205057> 切換過濾器")
        .addStringOption((options) =>
          options
            .setName("set")
            .setDescription("請選擇一個過濾器")
            .setRequired(true)
            .addChoices(
              { name: "<:icons_linkrevoke:865572289022394368>關閉所有過濾器", value: "false" },
              { name: "<:icons_linkadd:865572290065072128>切換 8d 過濾器", value: "8d" },
              { name: "<:icons_linkadd:865572290065072128>切換 低音增強 過濾器", value: "bassboost" },
              { name: "<:icons_linkadd:865572290065072128>切換 回音 過濾器", value: "echo" },
              { name: "<:icons_linkadd:865572290065072128>切換 nightcore 過濾器", value: "nightcore" },
              { name: "<:icons_linkadd:865572290065072128>切換 環繞音 過濾器", value: "surround" },
              { name: "<:icons_linkadd:865572290065072128>切換 karaoke 過濾器", value: "karaoke" },
              { name: "<:icons_linkadd:865572290065072128>切換 vaporwave 過濾器", value: "vaporwave" },
              { name: "<:icons_linkadd:865572290065072128>切換 flanger 過濾器", value: "flanger" },
              { name: "<:icons_linkadd:865572290065072128>切換 gate 過濾器", value: "gate" },
              { name: "<:icons_linkadd:865572290065072128>切換 haas 過濾器", value: "haas" },
              { name: "<:icons_linkadd:865572290065072128>切換 倒放 過濾器", value: "reverse" },
              { name: "<:icons_linkadd:865572290065072128>切換 mcompand 過濾器", value: "mcompand" },
              { name: "<:icons_linkadd:865572290065072128>切換 phaser 過濾器", value: "phaser" },
              { name: "<:icons_linkadd:865572290065072128>切換 tremolo 過濾器", value: "tremolo" },
              { name: "<:icons_linkadd:865572290065072128>切換 earwax 過濾器", value: "earwax" }
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
              { name: "<:icons_queue:861852633240961024>顯示播放清單", value: "queue" },
              { name: "<:icons_reply:859388126153932802>播放上一首曲目", value: "previous" },
              { name: "<:icons_pause:861852632914198548>暫停播放歌曲", value: "pause" },
              { name: "<:icons_play:861852632800952320>繼續播放歌曲", value: "resume" },
              { name: "<:icons_frontforward:988409335791124551>跳過歌曲", value: "skip" },
              { name: "<:icons_musicstop:861852633979420712>停止音樂", value: "stop" },
              { name: "<:icons_shuffle:988409354208313404>隨機播放", value: "shuffle" },
              { name: "<:icons_update:860123644297871382>切換自動播放", value: "autoplay" },
              { name: "<:icons_plus:988409343743496232>添加相似歌曲", value: "related" },
              { name: "<:icons_loop:861852632893227029> 切換重複播放", value: "repeat" }
            
        )
    ),
  usage: "/music (play, volume, settings, seek, filters)",
};
