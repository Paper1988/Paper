import { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, validateVoiceChannel } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js'
import { Player } from 'moonlink.js'

export default {
    subCommand: 'music.quit',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        const member = interaction.member! as GuildMember
        const VoiceChannel = member!.voice.channel

        if (!(await validateVoiceChannel(interaction, client, VoiceChannel))) return

        const player = client.moonlink?.players.get(interaction.guildId!) as Player

        await player.destroy()

        await interaction
            .reply({
                content: '<:leave:1265560726240497684> | 成功離開語音頻道!',
                flags: MessageFlags.Ephemeral
            })
            .then(deleteMessageAfter)
    }
} as SubCommandType
