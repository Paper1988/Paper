const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js')

module.exports = {
    id: 'filters',
    async execute(interaction, client) {
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return interaction.reply({
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在一個語音頻道裡面才能使用音樂按鈕!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction.reply({
                content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        const queue = client.distube.getQueue(VoiceChannel)

        if (!queue)
            return interaction.reply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!'
            })

        const selectMenu = new ActionRowBuilder().addComponents([
            new StringSelectMenuBuilder()
                .setCustomId('filters')
                .setPlaceholder('請選擇過濾器')
                .setMinValues(1)
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('8d')
                        .setDescription('增加/移除 `8d` 過濾器')
                        .setValue('8d'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('karaoke')
                        .setDescription('增加/移除 `karaoke` 過濾器')
                        .setValue('karaoke'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('vaporwave')
                        .setDescription('增加/移除 `vaporwave` 過濾器')
                        .setValue('vaporwave'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('flanger')
                        .setDescription('增加/移除 `flanger` 過濾器')
                        .setValue('flanger'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('gate')
                        .setDescription('增加/移除 `gate` 過濾器')
                        .setValue('gate'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('reverse')
                        .setDescription('增加/移除 `reverse` 過濾器')
                        .setValue('reverse'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('mcompand')
                        .setDescription('增加/移除 `mcompand` 過濾器')
                        .setValue('mcompand'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('phaser')
                        .setDescription('增加/移除 `phaser` 過濾器')
                        .setValue('phaser'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('tremolo')
                        .setDescription('增加/移除 `tremolo` 過濾器')
                        .setValue('tremolo'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('earwax')
                        .setDescription('增加/移除 `earwax` 過濾器')
                        .setValue('earwax'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('bassboost')
                        .setDescription('增加/移除 `bassboost` 過濾器')
                        .setValue('bassboost'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('echo')
                        .setDescription('增加/移除 `echo` 過濾器')
                        .setValue('echo'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('nightcore')
                        .setDescription('增加/移除 `nightcore` 過濾器')
                        .setValue('nightcore'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('surround')
                        .setDescription('增加/移除 `surround` 過濾器')
                        .setValue('surround')
                )
        ])

        const button = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setLabel('關')
                .setCustomId('false')
                .setEmoji('<:xmark_988409378161954866:1201844342029815848>')
                .setStyle(ButtonStyle.Danger)
        ])

        await interaction.reply({
            content: '<:spark_860123643722727444:1201844297041973320> | 請選擇過濾器',
            components: [selectMenu, button],
            ephemeral: true
        })
    }
}
