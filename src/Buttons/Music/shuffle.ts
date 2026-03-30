import emojis from '@/libs/emoji/emoji.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, validateVoiceChannel } from '@/Systems/Music.js'
import type { ButtonType } from '@/typings/component.js'
import type { ButtonInteraction, GuildMember } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    id: 'shuffle',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        await interaction.deferReply()
        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel

        if (!(await validateVoiceChannel(interaction, client, VoiceChannel))) return

        const player = client.moonlink?.players.get(interaction.guildId!) as Player
        if (!player || !player.current) {
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 目前沒有正在播放的音樂!`
                })
                .then(deleteMessageAfter)
        }

        player.shuffle()

        return interaction
            .editReply({
                content: '<:shuffle:1265561846690222081> | 成功隨機打亂歌曲'
            })
            .then(deleteMessageAfter)
    }
} satisfies ButtonType
