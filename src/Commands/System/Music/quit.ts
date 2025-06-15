import type { SubCommandType } from '@/typings/command'
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js'
import { PaperClient } from './../../../classes/PaperClient'

export default {
    subCommand: 'music.quit',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        const member = interaction.member! as GuildMember
        const VoiceChannel = member!.voice.channel

        if (!VoiceChannel)
            await interaction.reply({
                content: '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂指令!',
                flags: MessageFlags.Ephemeral
            })

        client.distube.voices.leave(VoiceChannel!)
        await interaction.reply({
            content: '<:leave:1265560726240497684> | 成功離開語音頻道!',
            flags: MessageFlags.Ephemeral
        })
    }
} as SubCommandType
