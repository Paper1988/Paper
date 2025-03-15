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
    const buggedInfo = '../../node_modules/@distube/ytdl-core/lib/info.js'
    const buggedUtils = '../../node_modules/@distube/ytdl-core/lib/utils.js'
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

module.exports = ytdlPatch
