const { EmbedBuilder } = require('discord.js')

module.exports = (queue, song) =>
    new EmbedBuilder()
        .setColor('Green')
        .setDescription(
            `<:music_860123644201271326:1201843716097327185> | [${song.name}](${song.url}) - \` ${song.stream.playFromSource ? song.formattedDuration : song.stream.song?.formattedDuration} \``
        )
        .setAuthor({ name: `${song.user.displayName}`, iconURL: song.user.displayAvatarURL() })
        .addFields(
            {
                name: '<:speaker_860133545544908802:1201844300099354644>音量',
                value: `\`${queue.volume}%\``,
                inline: true
            },
            {
                name: '<:spark_860123643722727444:1201844297041973320>過濾器',
                value: `${
                    queue.filters.names.join(', ') ||
                    '<:xmark_988409378161954866:1201844342029815848>'
                }`,
                inline: true
            },
            {
                name: '<:loop_861852632893227029:1201843696031764490>重複播放',
                value: `${
                    queue.repeatMode
                        ? queue.repeatMode === 2
                            ? '<:loop_988409346637594744:1201843698976178246>整個清單'
                            : '<:looponce_988409348826992680:1201884069399363634>單曲'
                        : '<:xmark_988409378161954866:1201844342029815848>'
                }`,
                inline: true
            },
            {
                name: '<:update_860123644297871382:1201844333968625695>自動播放',
                value: `${queue.autoplay ? '<:correct_859388130411282442:1201843648229294121>' : '<:xmark_988409378161954866:1201844342029815848>'}`,
                inline: true
            },
            {
                name: '<:people_964425853930995783:1201843743762681906>歌曲作者',
                value: `\`${song.uploader.name || '無'}\``,
                inline: true
            },
            {
                name: '<:clock_964491800465276940:1201843646203433030>進度',
                value: `\` ${queue.formattedCurrentTime} \` - \` ${song.stream.playFromSource ? song.formattedDuration : song.stream.song?.formattedDuration} \``,
                inline: true
            }
        )
        .setImage(song.thumbnail)
        .setTimestamp()
