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
/**************************************************/
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
    //ffmpeg: pathToFFmpeg,
    plugins: [
        new SpotifyPlugin({
            api: {
                clientId: client.config.SpotifyClientId,
                clientSecret: client.config.SpotifyClientSecret,
                topTracksCountry: 'TW'
            }
        }),
        new SoundCloudPlugin(),
        new DirectLinkPlugin(),
        new TidalPlugin(),
        new DeezerPlugin(),
        new AppleMusicPlugin()
        /* new YouTubePlugin({
            ytdlOptions: {
                highWaterMark: 1024 * 1024 * 64,
                quality: 'highestaudio',
                format: 'audioonly',
                liveBuffer: 60000,
                dlChunkSize: 1024 * 1024 * 4
            },
            cookies: [
                {
                    domain: '.youtube.com',
                    expirationDate: 1757161045.096163,
                    hostOnly: false,
                    httpOnly: false,
                    name: '__Secure-1PAPISID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'hSPy6GQjAOtGB4SD/A3MTYlTtlRLbnWpLQ',
                    id: 1
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1757161045.095983,
                    hostOnly: false,
                    httpOnly: true,
                    name: '__Secure-1PSID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'g.a000mggb6LI3YUFTnKKwh_fYuy7tzI04RlEsET86QzMNkyGnAO-zAIyKziDs0ANZSIZss9_RgAACgYKASgSARMSFQHGX2MiaPwsYgBYwv38JcyO922m1BoVAUF8yKq4TSo5Q1qxNv1oxP9NDtka0076',
                    id: 2
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1754652792.375821,
                    hostOnly: false,
                    httpOnly: true,
                    name: '__Secure-1PSIDCC',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'AKEyXzWeEc4g4hZQcEFmVGjVSUyNjtaUnNnb-EsgMEdeKoLSFiwcQo2--czqIk_0XeyuUH-4fjs',
                    id: 3
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1754652425.128332,
                    hostOnly: false,
                    httpOnly: true,
                    name: '__Secure-1PSIDTS',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'sidts-CjEB4E2dkXouEmLWm01THjWbOPkLGftOFD-EajF8c4Z_m_FO6dVd0bv-hkxPhxssecRLEAA',
                    id: 4
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1757161045.096192,
                    hostOnly: false,
                    httpOnly: false,
                    name: '__Secure-3PAPISID',
                    path: '/',
                    sameSite: 'no_restriction',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'hSPy6GQjAOtGB4SD/A3MTYlTtlRLbnWpLQ',
                    id: 5
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1757161045.096013,
                    hostOnly: false,
                    httpOnly: true,
                    name: '__Secure-3PSID',
                    path: '/',
                    sameSite: 'no_restriction',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'g.a000mggb6LI3YUFTnKKwh_fYuy7tzI04RlEsET86QzMNkyGnAO-zTVvoAft-kSxmd1Tdba3UeQACgYKAYYSARMSFQHGX2MiA_-Lcm6X-Za43eWnWRwdlRoVAUF8yKqr5uE3aFDQDi0DXpChZVLV0076',
                    id: 6
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1754652792.375852,
                    hostOnly: false,
                    httpOnly: true,
                    name: '__Secure-3PSIDCC',
                    path: '/',
                    sameSite: 'no_restriction',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'AKEyXzVrgwzmThgmxlkUpgmiSb781E-AD9dRCtUbZuw4gy6Gj0BQQnod_IktBar3rzFoAs4KmCE',
                    id: 7
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1754652425.128427,
                    hostOnly: false,
                    httpOnly: true,
                    name: '__Secure-3PSIDTS',
                    path: '/',
                    sameSite: 'no_restriction',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'sidts-CjEB4E2dkXouEmLWm01THjWbOPkLGftOFD-EajF8c4Z_m_FO6dVd0bv-hkxPhxssecRLEAA',
                    id: 8
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1727348996,
                    hostOnly: false,
                    httpOnly: false,
                    name: '_gcl_au',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: false,
                    session: false,
                    storeId: '0',
                    value: '1.1.843218584.1719572996',
                    id: 9
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1757161045.0961,
                    hostOnly: false,
                    httpOnly: false,
                    name: 'APISID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: false,
                    session: false,
                    storeId: '0',
                    value: 'KWz1pH33i3r8R5BM/AsqK9IERyjRB5Orad',
                    id: 10
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1757161045.096043,
                    hostOnly: false,
                    httpOnly: true,
                    name: 'HSID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: false,
                    session: false,
                    storeId: '0',
                    value: 'AW7ksTj85FK5haBLz',
                    id: 11
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1757676785.572222,
                    hostOnly: false,
                    httpOnly: true,
                    name: 'LOGIN_INFO',
                    path: '/',
                    sameSite: 'no_restriction',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'AFmmF2swRQIhANiLw1f41JxrY-Z9KBRJgujEgX5PoYnFGI-OOmUN0zGPAiBQI9_xtzARCyfvzQWvTUTrA1Uf1azf3q0KrHGVh9Gk8w:QUQ3MjNmeHplTjhCSGhkcWNadERRMGk5R3c5d2NCRTl5dGgya0pyRGFFV0ZGd25WM1pxMmd1V2pPcWFsekl5cTZ5WVVzNldNV1lMTkZRWXFrZ201NnhoLThBdW1STmJzYVpVb2JQNGJyX2tpb3VjWXNHWFFCUC0zUHhtTHo0cmtCdEVyTFkzRWtpSmR5MGpxZ0MyOWM0QThCLVpCS0hqVUtB',
                    id: 12
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1737780532.476369,
                    hostOnly: false,
                    httpOnly: true,
                    name: 'NID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: '516=FXZz4HD4mORfyR1g_oafwLz6nkv8GiQRPjyVD3dupEC9-EIRP23M0vfptUXKufvuENr2acuqasOarjZ1oarbGCp-qjHe7lp9aamI65BnhAT4OLMVOji-2ImKHT4amj_1rVCK9d_bmi8pZwJDZ8KCpXn86BSzzPh8GqeblnEfnsqJpV78vI2Ns07yKJ4h9jlEGUtUYnUe3EickEsQ0jhOBQpzemxCthg',
                    id: 13
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1757676792.239925,
                    hostOnly: false,
                    httpOnly: false,
                    name: 'PREF',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'tz=Asia.Taipei&f6=40000000&f5=30000&f7=100',
                    id: 14
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1757161045.096128,
                    hostOnly: false,
                    httpOnly: false,
                    name: 'SAPISID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'hSPy6GQjAOtGB4SD/A3MTYlTtlRLbnWpLQ',
                    id: 15
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1757161045.09582,
                    hostOnly: false,
                    httpOnly: false,
                    name: 'SID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: false,
                    session: false,
                    storeId: '0',
                    value: 'g.a000mggb6LI3YUFTnKKwh_fYuy7tzI04RlEsET86QzMNkyGnAO-z8efrPkpxKrGTSqEXz_CYhwACgYKAdISARMSFQHGX2MighnnIGfq_IlkJxQQfbJ8KRoVAUF8yKoFVcwMNssPbfgPopJMyIPD0076',
                    id: 16
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1754652792.375738,
                    hostOnly: false,
                    httpOnly: false,
                    name: 'SIDCC',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: false,
                    session: false,
                    storeId: '0',
                    value: 'AKEyXzX4vAtuYC9lJWP-59IlS1BRs6VqgHPk3nCj1TdcFFqcEYc05OBdt5aPh35H4fWA3ojGYN5b',
                    id: 17
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1757161045.096072,
                    hostOnly: false,
                    httpOnly: true,
                    name: 'SSID',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'AOqrpLBMpDkTv1dPt',
                    id: 18
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1733751880.763934,
                    hostOnly: false,
                    httpOnly: true,
                    name: 'VISITOR_INFO1_LIVE',
                    path: '/',
                    sameSite: 'no_restriction',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'PTZTmg4r5LQ',
                    id: 19
                },
                {
                    domain: '.youtube.com',
                    expirationDate: 1733751880.763963,
                    hostOnly: false,
                    httpOnly: true,
                    name: 'VISITOR_PRIVACY_METADATA',
                    path: '/',
                    sameSite: 'no_restriction',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: 'CgJUVxIEGgAgSA%3D%3D',
                    id: 20
                },
                {
                    domain: '.youtube.com',
                    hostOnly: false,
                    httpOnly: true,
                    name: 'YSC',
                    path: '/',
                    sameSite: 'no_restriction',
                    secure: true,
                    session: true,
                    storeId: '0',
                    value: 'LYxRVtdA1_Q',
                    id: 21
                },
                {
                    domain: 'www.youtube.com',
                    expirationDate: 1724561332,
                    hostOnly: true,
                    httpOnly: false,
                    name: 'OTZ',
                    path: '/',
                    sameSite: 'unspecified',
                    secure: true,
                    session: false,
                    storeId: '0',
                    value: '7661089_24_24__24_',
                    id: 22
                }
            ]
        }) */
    ]
})

process.env.YTSR_NO_UPDATE = 1
process.env.YTDL_NO_UPDATE = 1
/**************************************************/
const errorHandling = require('discord.js-anticrash')
const config = {
    webhookUrl:
        '***REMOV$'
}

errorHandling(client, config)
client.setMaxListeners(0)

loadEvents(client)

client.login(client.config.Token)

module.exports = client
