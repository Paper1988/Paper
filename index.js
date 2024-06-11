const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js')
const { Guilds, GuildMembers, GuildMessages, GuildMessageReactions, GuildVoiceStates } =
    GatewayIntentBits
const { User, Message, GuildMember, ThreadMember } = Partials

const client = new Client({
    shards: 'auto',
    intents: [Guilds, GuildMembers, GuildMessages, GuildMessageReactions, GuildVoiceStates],
    partials: [User, Message, GuildMember, ThreadMember]
})

const { loadEvents } = require('./Structures/Handlers/eventHandler.js')

client.config = require('./Structures/config.json')
client.commands = new Collection()
client.buttons = new Collection()
client.events = new Collection()
client.subCommands = new Collection()
client.modals = new Collection()
client.selectMenus = new Collection()
;['GiveawaySys'].forEach((sys) => {
    require(`./Systems/${sys}`)(client)
})
/**************************************************/
const { DisTube } = require('distube')
const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { YtDlpPlugin } = require('@distube/yt-dlp')
const { DirectLinkPlugin } = require('@distube/direct-link')
const { YouTubePlugin } = require('@distube/youtube')
const { SpotifyClientId, SpotifyClientSecret } = require('./Structures/config.json')

client.distube = new DisTube(client, {
    customFilters: {
        // https://distube.js.org/types/DisTubeOptions.html
        speed_025: 'atempo=0.25',
        speed_050: 'atempo=0.5',
        speed_075: 'atempo=0.75',
        speed_1: 'atempo=1',
        speed_125: 'atempo=1.25',
        speed_150: 'atempo=1.5',
        speed_175: 'atempo=1.75',
        speed_2: 'atempo=2'
    },
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    nsfw: true,
    plugins: [
        new SpotifyPlugin({
            api: {
                clientId: SpotifyClientId,
                clientSecret: SpotifyClientSecret,
                topTracksCountry: 'TW'
            }
        }),
        new SoundCloudPlugin(),
        new YtDlpPlugin({ update: true }),
        new DirectLinkPlugin(),
        new YouTubePlugin({
            ytdlOptions: {
                highWaterMark: 1024 * 1024 * 64,
                quality: 'highestaudio',
                format: 'audioonly',
                liveBuffer: 60000,
                dlChunkSize: 1024 * 1024 * 4
            }
        })
    ]
})
/**************************************************/
const errorHandling = require('discord.js-anticrash')
const config = {
    webhookUrl:
        'https://discord.com/api/webhooks/967768559688249344/dp6yrq5Jw4boYyZiS6NBhS3hGKIP_lTL7uP6DDYNr-XrJL6T5Gy0_smg5lcoZsvAu5EB'
}

errorHandling(client, config)
process.setMaxListeners(0)

loadEvents(client)

client.login(client.config.Token)

module.exports = client
