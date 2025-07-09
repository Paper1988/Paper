import { createRequire } from 'module'
const require = createRequire(import.meta.url)

require('opusscript')
require.cache[require.resolve('opusscript')]!.exports = require('@discordjs/opus')
