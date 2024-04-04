const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const row1 = new ActionRowBuilder().addComponents([
    new ButtonBuilder()
        .setCustomId(`autoplay`)
        .setEmoji('<:update_860123644297871382:1201844333968625695>')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId(`previous`) // Note the buttons ID is on the left of the _ and the id is on the right. Also note your CANNOT have another _ in the customid eg `my_coolbutton_${target.id}`
        .setEmoji('<:backforward_988409328698523708:1201843626435686440>')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId(`togglePause`)
        .setEmoji('<:pause_861852632914198548:1201843739728035961>')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId(`skip`)
        .setEmoji('<:frontforward_988409335791124551:1202215991694856262>')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId(`shuffle`)
        .setEmoji('<:shuffle_988409354208313404:1201844292751212574>')
        .setStyle(ButtonStyle.Secondary)
])
// next column
const row2 = new ActionRowBuilder().addComponents([
    new ButtonBuilder()
        .setCustomId(`loop`)
        .setEmoji('<:loop_988409346637594744:1201843698976178246>')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId(`volumeDown`)
        .setEmoji('<:speaker_low_860133546278387763:1201844302725255178>')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId(`stop`)
        .setEmoji('<:stop_988409337837924422:1201844316675510364>')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId(`volumeUp`)
        .setEmoji('<:speaker_860133545544908802:1201844300099354644>')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId(`related`)
        .setEmoji('<:add_988409343743496232:1201843618508185600>')
        .setStyle(ButtonStyle.Secondary)
])
// next column
const row3 = new ActionRowBuilder().addComponents([
    new ButtonBuilder()
        .setCustomId(`queue`)
        .setEmoji('<:queue_861852633240961024:1202112866069520385>')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId(`addSong`)
        .setEmoji('<:friend_861852632767528970:1201843652704616448>')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId(`filters`)
        .setEmoji('<:spark_860123643722727444:1201844297041973320>')
        .setStyle(ButtonStyle.Secondary)
])

module.exports = [row1, row2, row3]
