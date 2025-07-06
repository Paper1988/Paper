import { YouTubePlugin } from '@distube/youtube'
import {
    ActionRowBuilder,
    EmbedBuilder,
    ModalSubmitInteraction,
    StringSelectMenuBuilder
} from 'discord.js'

export default {
    id: 'addSong',
    async execute(interaction: ModalSubmitInteraction) {
        const songName = interaction.fields.getTextInputValue('songName')

        const select = new StringSelectMenuBuilder()
            .setCustomId('addSong')
            .setPlaceholder('請選擇歌曲')

        const Menu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)

        const yt = new YouTubePlugin()

        await yt.search(songName, { limit: 20 }).then((results) => {
            select.addOptions(
                results.map((song, id) => ({
                    label: song.name!,
                    description: `作者: ${song.uploader.name}`,
                    value: song.url!
                }))
            )
        })

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('歌曲搜尋')
                    .setDescription('> 請選擇一首歌曲')
                    .setColor('White')
            ],
            components: [Menu]
        })
    }
}
