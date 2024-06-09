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
const { SpotifyClientId, SpotifyClientSecret } = require('./Structures/config.json')
const pathToFfmpeg = require('fluent-ffmpeg')

client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    ffmpeg: {
        path: pathToFfmpeg
    },
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
        new DirectLinkPlugin()
    ],
    nsfw: true,
    savePreviousSongs: true
})
/**************************************************/
const errorHandling = require('discord.js-anticrash')
const config = {
    webhookUrl:
        '***REMOV$'
}

errorHandling(client, config)
process.setMaxListeners(0)

loadEvents(client)

client.login(client.config.Token)

module.exports = client
