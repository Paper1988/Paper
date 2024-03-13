const { ChatInputCommandInteraction, Client } = require('discord.js')
const Embed = require('../../../../Systems/MusicEmbed')
const MusicDB = require('../../../../Structures/Schemas/MusicDB')

module.exports = {
    subCommand: 'music.seek',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options, member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return interaction.reply({
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在一個語音頻道裡面才能使用音樂指令!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction.reply({
                content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        const queue = await client.distube.getQueue(VoiceChannel)
        const Data = await MusicDB.findOne({ GuildID: queue.id })
        const message = await queue.textChannel.messages.fetch(Data.message).catch(console.log)
        const Time = options.getNumber('time')

        if (!queue)
            return interaction.reply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        await queue.seek(Time)
        message.edit({ embeds: [Embed(queue, queue.songs[0])] })
        return await interaction
            .reply({
                content: `<:rightarrow_859388126653186058:1202113627122061403> | 成功跳到 **\`${Time}\`**`
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
