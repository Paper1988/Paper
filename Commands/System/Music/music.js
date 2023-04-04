const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, Client, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("music")
        .setDescription("一個完善的音樂系統")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((sub) =>
            sub
            .setName("play")
            .setDescription("▶ 播放音樂")
            .addStringOption((options) =>
                options
                .setName("query")
                .setDescription("請提供一個歌名或連結")
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
            sub
            .setName("volume")
            .setDescription("🔊 調整音量大小")
            .addNumberOption((options) =>
                options
                .setName("percent")
                .setDescription("請提供一個音量(1 = 1%)")
                .setRequired(true)
            )
        ).addSubcommand((sub) =>
            sub
            .setName("seek")
            .setDescription("⏭ 跳到指定位置")
            .addNumberOption((options) =>
                options
                .setName("time")
                .setDescription("請提供要跳到的位置（以秒為單位）")
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
            sub
            .setName("filters")
            .setDescription("🔃 切換過濾器")
            .addStringOption((options) =>
                options
                .setName("set")
                .setDescription("請選擇一個過濾器")
                .setRequired(true)
                .addChoices({ name: "🔌 關閉所有過濾器", value: "false" }, { name: "📣 切換 8d 過濾器", value: "8d" }, { name: "📣 切換 低音增強 過濾器", value: "bassboost" }, { name: "📣 切換 迴聲 過濾器", value: "echo" }, { name: "📣 切換 nightcore 過濾器", value: "nightcore" }, { name: "📣 切換 surround 過濾器", value: "surround" }, { name: "📣 切換 karaoke 過濾器", value: "karaoke" }, { name: "📣 切換 vaporwave 過濾器", value: "vaporwave" }, { name: "📣 切換 flanger 過濾器", value: "flanger" }, { name: "📣 切換 gate 過濾器", value: "gate" }, { name: "📣 切換 haas 過濾器", value: "haas" }, { name: "📣 切換 reverse 過濾器", value: "reverse" }, { name: "📣 切換 mcompand 過濾器", value: "mcompand" }, { name: "📣 切換 phaser 過濾器", value: "phaser" }, { name: "📣 切換 tremolo 過濾器", value: "tremolo" }, { name: "📣 切換 earwax 過濾器", value: "earwax" })
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
                .addChoices({ name: "🔢 顯示播放清單", value: "queue" }, { name: "⏭ 跳過歌曲", value: "skip" }, { name: "⏸ 暫停播放歌曲", value: "pause" }, { name: "▶ 繼續播放歌曲", value: "resume" }, { name: "⏹ 停止音樂", value: "stop" }, { name: "🔀 隨機播放", value: "shuffle" }, { name: "🔃 切換自動播放", value: "autoplay" }, { name: "🈁 添加相關歌曲", value: "related" }, { name: "🔁 切換重複播放", value: "repeat" }, { name: "⏮ 播放上一首曲目", value: "previous" })
            )
        ),
    usage: "/music (play, volume, settings)",
}