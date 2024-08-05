const {
    ButtonInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} = require('discord.js')

const Genius = require('genius-lyrics')
const Client = new Genius.Client()

module.exports = {
    id: 'lyrics',
    /**
     *
     * @param {ButtonInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ fetchReply: true, ephemeral: true })

        const VoiceChannel = interaction.member.voice.channel

        if (!VoiceChannel)
            return await interaction.editReply({
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在一個語音頻道裡面才能使用音樂按鈕!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction.editReply({
                content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        const queue = await client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction.editReply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        await Client.songs
            .search(queue.songs[0].name)
            .then(async (songs) => {
                const song = songs[0]

                const lyrics = await song.lyrics()

                const Embed = new EmbedBuilder()
                    .setURL(song.url)
                    .setTitle(queue.songs[0].name)
                    .setAuthor({ name: queue.songs[0].uploader.name })
                    .setDescription(lyrics)
                    .setImage(queue.songs[0].thumbnail)
                    .setFooter({
                        text: '資料來源: Genius Lyrics',
                        iconURL:
                            'https://cdn.discordapp.com/attachments/1202111758764867645/1268911286977298502/unnamed.png?ex=66ae253a&is=66acd3ba&hm=89779e3dd1db9793fa3ea864cff4d22fb6d06997b6c0cc0a5cbdb24f710c5ab5&'
                    })
                    .setColor('Gold')

                await interaction.editReply({ embeds: [Embed] })
            })
            .catch(async () => {
                await interaction
                    .editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setDescription(
                                    `<:loadingerror:1268935312751595622> | 找不到 ${queue.songs[0].name} 的歌詞!`
                                )
                                .setFooter({
                                    text: '資料來源: Genius Lyrics',
                                    iconURL:
                                        'https://cdn.discordapp.com/attachments/1202111758764867645/1268911286977298502/unnamed.png?ex=66ae253a&is=66acd3ba&hm=89779e3dd1db9793fa3ea864cff4d22fb6d06997b6c0cc0a5cbdb24f710c5ab5&'
                                })
                        ]
                    })
                    .then(() =>
                        setTimeout(async () => {
                            await interaction.deleteReply()
                        }, 15 * 1000)
                    )
            })
    }
}
