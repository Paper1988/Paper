const {
    EmbedBuilder,
    ChatInputCommandInteraction,
    Client,
    ChannelType,
    UserFlags,
    version,
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js')

const { connection } = require('mongoose')
const os = require('os')

const pidusage = require('pidusage')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setNameLocalization('zh-TW', '機器人資訊')
        .setNameLocalization('ja', 'ボット情報')
        .setDescription('View bot information')
        .setDescriptionLocalization('zh-TW', '查看機器人資訊')
        .setDescriptionLocalization('ja', 'ボットの情報を表示'),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        const formatter = new Intl.ListFormat('en-GB', {
            style: 'long',
            type: 'conjunction'
        })

        const status = [
            '<:highping:1265560498502369290>離線',
            '<:lowping:1265560970185674772>連線',
            '<:midping:1265561041081995385>連線中...',
            '<:midping:1265561041081995385>離線中...'
        ]

        await client.user.fetch()
        await client.application.fetch()

        const getChannelTypeSize = (type) =>
            client.channels.cache.filter((channel) => type.includes(channel.type)).size

        let memoryUsageMB
        pidusage(process.pid, (err, stats) => {
            if (err) {
                console.error('Error fetching memory usage:', err)
                return
            }

            memoryUsageMB = stats.memory / (1024 * 1024) // 轉換成 MB
        })

        const embed = new EmbedBuilder()
            .setColor(interaction.guild.members.me.roles.highest.hexColor)
            .setTitle(`${client.user.username} 的機器人資訊`)
            .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
            .addFields(
                {
                    name: '<:generalinfo:1265560439002234986> | 一般',
                    value: [
                        `<:person:1265561455529562154> **用戶端** \`${client.user.tag}\``,
                        `<:id:1265560530462969978> **ID** \`${client.user.id}\``,
                        `<:clock:1265560238137016372> **創建時間** <t:${parseInt(
                            client.user.createdTimestamp / 1000
                        )}:R>`,
                        `<:owner:1265561364693258383> **擁有者** ${`<@${client.application.owner.ownerId}> (${client.application.owner.owner.user.tag})`}`,
                        `<:verifiedserver:1265562506114629652> **驗證** ${
                            client.user.flags & UserFlags.VerifiedBot
                                ? '<:verified:1265562485415743609>'
                                : '<:xmark:1265562550947545089>'
                        }`,
                        `<:label:1265560709673123851> **標籤** \`${
                            client.application.tags.length
                                ? formatter.format(client.application.tags.map((tag) => `*${tag}*`))
                                : '<:xmark:1265562550947545089>'
                        }\``,
                        `<:slashcommandsupport:1265561877648375929> **指令數** \`${client.commands.size}\``
                    ].join('\n')
                },
                {
                    name: '<:monitor:1265561066876833923> | 系統',
                    value: [
                        `<:settings:1265561822883483668> **作業系統** \`${os
                            .type()
                            .replace('Windows_NT', 'Windows')
                            .replace('Darwin', 'macOS')}\``,
                        `<:reminder:1265561686358753280> **上線時間** <t:${parseInt(
                            client.readyTimestamp / 1000
                        )}:R>`,
                        `<:internet:1265560594321375333> **Ping** \`${client.ws.ping}ms\``,
                        `<:dollar:1265560329040039979> **CPU型號** \`${os.cpus()[0].model}\``,
                        `<:bulb:1265560195178958941> **RAM使用率** \`${memoryUsageMB.toFixed(2)}%\``,
                        `<:library:1265560754241929289> **資料庫連線** ${status[connection.readyState]}`,
                        `<:nodejs:1265561229624213636> **Node.js** \`${process.version}\``,
                        `<:djs:1265560315928772619> **Discord.js** \`${version}\``,
                        `<:linkadd:1265560789503311915> **已連接語音頻道** \`${client.distube.voices.size}\``,
                        `<:queue:1265561609632485478> **已創建音樂佇列** \`${client.distube.voices.queues.size}\``
                    ].join('\n'),
                    inline: true
                },
                {
                    // Using the caches for some of these isn't always reliable, but it would be a waste of resources to loop through all servers every single time someone used this command.
                    name: '<:list:1265560873876062340> | 各項統計',
                    value: [
                        `<:globe:1265560486208864318> **伺服器**(快取) \`${client.guilds.cache.size}\``,
                        `<:people_964425853930995783:1201843743762681906> **使用者**(快取) \`${client.users.cache.size}\``,
                        `<:addreaction:1265557152953798747> **表情符號**(快取) \`${client.emojis.cache.size}\``,
                        `<:channel:1265560212824260609> **文字頻道** \`${getChannelTypeSize([
                            ChannelType.GuildText,
                            ChannelType.GuildForum
                        ])}\``,
                        `<:speaker:1265561928533807146> **語音頻道** \`${getChannelTypeSize([
                            ChannelType.GuildVoice,
                            ChannelType.GuildStageVoice
                        ])}\``,
                        `<:forum:1265560396933234729> **討論串** \`${getChannelTypeSize([
                            11, 12, 10
                        ])}\``
                    ].join('\n'),
                    inline: true
                }
            )
        await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral })
    }
}
