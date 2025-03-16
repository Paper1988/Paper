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
client.contextMenus = new Collection()

require(`./Systems/Giveaway`)(client)
/**************************************************/
const { DisTube } = require('distube')
const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { DirectLinkPlugin } = require('@distube/direct-link')
const { YouTubePlugin } = require('@distube/youtube')
const { DeezerPlugin } = require('@distube/deezer')
const { AppleMusicPlugin } = require('distube-apple-music')
const { TidalPlugin } = require('distube-tidal')
const { BandlabPlugin } = require('@distube/bandlab')
const { YtDlpPlugin } = require('@distube/yt-dlp')
const cookieManager = require('./libs/utils/youtubeCookies.js')

// 初始化時檢查 cookies
cookieManager.formatExistingFile()
const cookieStatus = cookieManager.getStatus()
if (!cookieStatus.isValid) {
    console.warn('YouTube cookies are invalid or missing!')
}
const cookies = cookieManager.getCookies()

const { exec } = require('child_process')

let ffmpeg

exec('which ffmpeg', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`)
        return
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`)
        return
    }
    console.log(`FFmpeg path: ${stdout.trim()}`)
    ffmpeg = stdout.trim()
})

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
    ffmpeg,
    plugins: [
        new YouTubePlugin({
            ytdlOptions: {
                lang: 'en',
                playerClients: ['WEB_EMBEDDED', 'IOS', 'ANDROID', 'TV', 'WEB'],
                agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            },
            cookies
        }),
        new SpotifyPlugin({
            api: {
                clientId: client.config.SpotifyClientId,
                clientSecret: client.config.SpotifyClientSecret,
                topTracksCountry: 'TW'
            }
        }),
        new SoundCloudPlugin({
            clientId: 'f1TFyuaI8LX1Ybd1zvQRX8GpsNYcQ3Y5',
            oauthToken: '2-299981-1401119139-7LPovqeFlWRcY'
        }),
        new DirectLinkPlugin(),
        new TidalPlugin(),
        new DeezerPlugin(),
        new AppleMusicPlugin(),
        new BandlabPlugin(),
        new YtDlpPlugin({ update: true })
    ]
})

/**************************************************/
const Anticrash = require('discord.js-anticrash')
const config = {
    webhookUrl:
        'https://discord.com/api/webhooks/967768559688249344/dp6yrq5Jw4boYyZiS6NBhS3hGKIP_lTL7uP6DDYNr-XrJL6T5Gy0_smg5lcoZsvAu5EB'
}

Anticrash(client, config)
client.setMaxListeners(0)

loadEvents(client)

client.login(client.config.Token)

module.exports = client
