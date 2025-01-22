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

// Hotfix for DisTubeError "ffmpeg exited with code 1" or 403 Errors
// Sources:
// https://github.com/distubejs/ytdl-core/pull/163
// https://github.com/distubejs/ytdl-core/issues/118#issuecomment-2441791441
// https://github.com/distubejs/ytdl-core/issues/84#issuecomment-2295590460
// https://discord.com/channels/732254550689316914/1271765204253933609/1275273097120841781
const ytdlPatch = async () => {
    const fs = require('fs')
    const fsPromise = require('fs/promises')
    const { Readable } = require('stream')
    const { finished } = require('stream/promises')

    const patchFile = async (file, patchUrl) => {
        const stream = fs.createWriteStream(file)
        const { body } = await fetch(patchUrl)
        return finished(Readable.fromWeb(body).pipe(stream))
    }

    const replaceInFile = (file, find, replace) =>
        fsPromise
            .readFile(file)
            .then((data) => data.toString().replace(find, replace))
            .then((data) => fsPromise.writeFile(file, data))

    // https://github.com/distubejs/ytdl-core/pull/163
    const patchBaseUrl =
        'https://raw.githubusercontent.com/ToddyTheNoobDud/ytdl-core-stuff/37acb1c7ca203bb33c1219bffe5fb2b820b52f69/'
    const buggedInfo = './node_modules/@distube/ytdl-core/lib/info.js'
    const buggedUtils = './node_modules/@distube/ytdl-core/lib/utils.js'
    const buggedYoutubeIndex = './node_modules/@distube/youtube/dist/index.js'
    await patchFile(buggedInfo, patchBaseUrl + 'lib/info.js')
    await patchFile(buggedUtils, patchBaseUrl + 'lib/utils.js')

    // https://github.com/distubejs/ytdl-core/issues/118#issuecomment-2441791441
    // I think you can also edit YoutubePlugin.ytdlOptions,
    // but I like to keep this in a single function
    // (https://discord.com/channels/732254550689316914/1272308260061319269/1330693171172343840)
    await replaceInFile(
        buggedUtils,
        `["WEB", "WEB_CREATOR", "IOS", "WEBEMBEDDED", "MWEB"]`,
        `["WEB", "WEB_CREATOR", "IOS", "WEBEMBEDDED", "MWEB", "ANDROID"]`
    )

    // https://github.com/distubejs/ytdl-core/issues/84#issuecomment-2295590460
    // https://discord.com/channels/732254550689316914/1271765204253933609/1275273097120841781
    await replaceInFile(
        buggedYoutubeIndex,
        `const info = await import_ytdl_core.default.getInfo(song.url, this.ytdlOptions);`,
        `let info = await import_ytdl_core.default.getInfo(song.url, this.ytdlOptions);
    info.formats = info.formats.filter((f) => f.hasAudio); /* 403 Error Workaround */`
    )

    console.log(`Applied hotfix for DisTubeError "ffmpeg exited with code 1" or 403 Errors`)
}

ytdlPatch()

const { DisTube } = require('distube')
const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { DirectLinkPlugin } = require('@distube/direct-link')
const { YouTubePlugin } = require('@distube/youtube')
const { DeezerPlugin } = require('@distube/deezer')
const { AppleMusicPlugin } = require('distube-apple-music')
const { TidalPlugin } = require('distube-tidal')

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
                clientId: client.config.SpotifyClientId,
                clientSecret: client.config.SpotifyClientSecret,
                topTracksCountry: 'TW'
            }
        }),
        new SoundCloudPlugin({
            clientId: client.config.SoundCloudClientId,
            oauthToken: client.config.SoundCloudOAuthToken
        }),
        new DirectLinkPlugin(),
        new TidalPlugin(),
        new DeezerPlugin(),
        new AppleMusicPlugin(),
        new YouTubePlugin({
            ytdlOptions: {
                highWaterMark: 1024 * 1024 * 64,
                quality: 'highestaudio',
                format: 'audioonly',
                liveBuffer: 60000,
                dlChunkSize: 1024 * 1024 * 4,
                playerClients: ['IOS', 'WEB_CREATOR', 'ANDROID', 'WEB'],
                requestOptions: {
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                }
            },
            cookies: [
                {
                    domain: '.youtube.com',
                    expirationDate: 1772080140,
                    hostOnly: false,
                    httpOnly: false,
                    name: '__Secure-1PAPISID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: '6gzl5J-Xpu3ZkBnc/AlKyj1i5hjbMxwmps',
                    id: 1
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1772080140,
                    hostOnly: false,
                    httpOnly: true,
                    name: '__Secure-1PSID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'g.a000sggb6PTpN_WPvmz-lzS0r7CNPtYGw0CYmJPOoZyvm6Lfcpyh2Krj0eGG4AE5t_ertX2CjgACgYKAYsSARMSFQHGX2Mijl5xjgQvRS6iryLJwHrawxoVAUF8yKqiwMDsTqHR24rpdwj5p1100076',
                    id: 2
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1769058641.542375,
                    hostOnly: false,
                    httpOnly: true,
                    name: '__Secure-1PSIDCC',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'AKEyXzUAMrPTgmGuWehOYim17CLIpRjGIRNKCVKLMV3OLCT1lSZ2_ZwJ27x9A1vj8VzrXlvdTA',
                    id: 3
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1769058180,
                    hostOnly: false,
                    httpOnly: true,
                    name: '__Secure-1PSIDTS',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'sidts-CjIBmiPuTRMp3kTIbTFX6JGW8usqclnfPYjOqsDLJNSZLr2oeHTRA3IuV3_93DNNkXU2cBAA',
                    id: 4
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1772080140,
                    hostOnly: false,
                    httpOnly: false,
                    name: '__Secure-3PAPISID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: '6gzl5J-Xpu3ZkBnc/AlKyj1i5hjbMxwmps',
                    id: 5
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1772080140,
                    hostOnly: false,
                    httpOnly: true,
                    name: '__Secure-3PSID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'g.a000sggb6PTpN_WPvmz-lzS0r7CNPtYGw0CYmJPOoZyvm6LfcpyhWKisu0z-66OYQPgwVgpz1QACgYKAZQSARMSFQHGX2Mi00yPvMNFIqNnKuCczw7ThhoVAUF8yKoYuIFK-89bw1hgIiH-CxJc0076',
                    id: 6
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1769058641.5424,
                    hostOnly: false,
                    httpOnly: true,
                    name: '__Secure-3PSIDCC',
                    path: '/',
                    sameSite: 'no_restriction',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'AKEyXzWTW8EOMuGugbF1sMohFpEq5XGBWiSqYJbWRQrvsntKTxLxkb8SxbXlEiK-xPrvzCWbXIE',
                    id: 7
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1769058180,
                    hostOnly: false,
                    httpOnly: true,
                    name: '__Secure-3PSIDTS',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'sidts-CjIBmiPuTRMp3kTIbTFX6JGW8usqclnfPYjOqsDLJNSZLr2oeHTRA3IuV3_93DNNkXU2cBAA',
                    id: 8
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1772080140,
                    hostOnly: false,
                    httpOnly: false,
                    name: 'APISID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: false,
                    session: false,
                    storeId: '0',
                    value: 'SazPmfjpxqZtnGuc/ADzKCLF5BeLcfQF4w',
                    id: 9
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1772080140,
                    hostOnly: false,
                    httpOnly: true,
                    name: 'HSID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: false,
                    session: false,
                    storeId: '0',
                    value: 'ArSTVWs8miF2B-f18',
                    id: 10
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1772080740,
                    hostOnly: false,
                    httpOnly: true,
                    name: 'LOGIN_INFO',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'AFmmF2swRAIgHRWz2KcT4nS9FUiDgjp4VO6gQcUbaoU0GPu5yl0utrECIAiNagX8K2SivJ4w5u6SxNz2C5sMcxmkPDaq6QkS7w--:QUQ3MjNmenR4V1BvNi1YLTJFN3Q5TXRXNEFhVWFDRkdCcDgydlhjS3BYZ0pIV3FBVlVKT3JEY1ZhYlppTUNTeGNXWmZELTBtMzViMjFYVW9xN3BUa1ZjYWZBWkk4anNTNlVDVExjOFVhVDd5N3RhWDNYUlE3YmN0OEg3NnNzYlh4cWRBVGFOWS0wNjZsdV9ITS1HaVVpNUxRVXgwUmYyV2VR',
                    id: 11
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1772082615.73252,
                    hostOnly: false,
                    httpOnly: false,
                    name: 'PREF',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'f6=40000000&f7=100&tz=Asia.Taipei',
                    id: 12
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1772080140,
                    hostOnly: false,
                    httpOnly: false,
                    name: 'SAPISID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: '6gzl5J-Xpu3ZkBnc/AlKyj1i5hjbMxwmps',
                    id: 13
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1772080140,
                    hostOnly: false,
                    httpOnly: false,
                    name: 'SID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: false,
                    session: false,
                    storeId: '0',
                    value: 'g.a000sggb6PTpN_WPvmz-lzS0r7CNPtYGw0CYmJPOoZyvm6Lfcpyh6T1FLHjcgFPG-VvYVgZjLAACgYKAcQSARMSFQHGX2MiDOM7DQcNKXlmATy_nZDaoRoVAUF8yKpTviQuVUSDhwX0-Lp41xjp0076',
                    id: 14
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1769058641.542345,
                    hostOnly: false,
                    httpOnly: false,
                    name: 'SIDCC',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: false,
                    session: false,
                    storeId: '0',
                    value: 'AKEyXzURcFdugg09m3ABvPvz_NpBokgxyWCqPG1CXGa2cUS_4qCqEDUaE9pSQRvG6x6ZFQ00hQ',
                    id: 15
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1772080140,
                    hostOnly: false,
                    httpOnly: true,
                    name: 'SSID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'AGTCkUywoSCbSZni5',
                    id: 16
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1753074641.542208,
                    hostOnly: false,
                    httpOnly: true,
                    name: 'VISITOR_INFO1_LIVE',
                    path: '/',
                    sameSite: 'no_restriction',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'lgFR9w8aEew',
                    id: 17
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1753074641.542308,
                    hostOnly: false,
                    httpOnly: true,
                    name: 'VISITOR_PRIVACY_METADATA',
                    path: '/',
                    sameSite: 'no_restriction',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'CgJUVxIEGgAgTA%3D%3D',
                    id: 18
                },
                {
                    domain: '.youtube.com',
                    hostOnly: false,
                    httpOnly: true,
                    name: 'YSC',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: true,
                    storeId: '0',
                    value: '5gAvmV35T-M',
                    id: 19
                }
            ]
        })
    ]
})

/**************************************************/
const errorHandling = require('discord.js-anticrash')
const config = {
    webhookUrl: client.config.AntiCrashWebhookUrl
}

errorHandling(client, config)
client.setMaxListeners(0)

loadEvents(client)

client.login(client.config.Token)

module.exports = client
