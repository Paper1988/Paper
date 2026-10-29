import emojis from '@/libs/emoji/emoji.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, validateDJRole, validateVoiceChannel } from '@/Systems/Music.js'
import type { ButtonType } from '@/typings/component.js'
import { type ButtonInteraction, type GuildMember } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    id: 'previous',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        if (!(await validateDJRole(interaction, client))) return

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

        player.back()
        return await interaction
            .editReply({
                content: `${emojis.backforward} | 成功返回上一首歌曲`
            })
            .then(deleteMessageAfter)
    }
} satisfies ButtonType
