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

require(`./Systems/GiveawaySys`)(client)
/**************************************************/
const { DisTube } = require('distube')
const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { SpotifyClientId, SpotifyClientSecret } = require('./Structures/config.json')

client.distube = new DisTube(client, {
    searchSongs: 10,
    emitNewSongOnly: true,
    leaveOnFinish: false,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    plugins: [
        new SpotifyPlugin({
            parallel: true,
            emitEventsAfterFetching: true,
            api: {
                clientId: SpotifyClientId,
                clientSecret: SpotifyClientSecret,
                topTracksCountry: 'TW'
            }
        }),
        new SoundCloudPlugin()
    ],
    ytdlOptions: {
        highWaterMark: 1024 * 1024 * 64,
        quality: 'highestaudio',
        format: 'audioonly',
        liveBuffer: 60000,
        dlChunkSize: 1024 * 1024 * 4
    }
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
