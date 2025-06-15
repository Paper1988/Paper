import { PaperClient } from '@/classes/PaperClient'
import { Collection, GatewayIntentBits, Partials } from 'discord.js'

const client = new PaperClient({
    shards: 'auto',
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Channel,
        Partials.User,
        Partials.Message,
        Partials.GuildMember,
        Partials.ThreadMember
    ]
})

client.commands = new Collection()
client.buttons = new Collection()
client.events = new Collection()
client.subCommands = new Collection()
client.modals = new Collection()
client.selectMenus = new Collection()
client.contextMenus = new Collection()

client.initDistube()
client.start({ Test: true })

export default client
