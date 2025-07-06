import type { PaperClient } from '@/classes/PaperClient.js'
import type { MenuType } from '@/typings/component.js'
import { YouTubePlugin } from '@distube/youtube'
import { GuildMember, MessageFlags, TextChannel, type AnySelectMenuInteraction } from 'discord.js'

export default {
    id: 'addSong',
    async execute(interaction: AnySelectMenuInteraction, client: PaperClient) {
        const songUrl = interaction.values[0]
        const yt = new YouTubePlugin()

        if (!interaction.member || !(interaction.member instanceof GuildMember)) {
            return interaction.reply({
                content: '此命令只能在伺服器中使用！',
                flags: MessageFlags.Ephemeral
            })
        }

        if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
            return interaction.reply({
                content: '此命令只能在伺服器文字頻道中使用！',
                flags: MessageFlags.Ephemeral
            })
        }

        await client.distube.play(interaction.member.voice.channel!, songUrl!, {
            textChannel: interaction.channel,
            member: interaction.member
        })

        const songs = await yt.search(songUrl!, { limit: 1 })
        const songDetails = songs[0]!

        await interaction.reply({
            content: `**${songDetails.name}** 已成功加入播放清單`,
            flags: MessageFlags.Ephemeral
        })
    }
} satisfies MenuType
