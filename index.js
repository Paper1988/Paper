const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const { Guilds, GuildMembers, GuildMessages, GuildMessageReactions, GuildVoiceStates } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({
    shards: "auto",
    intents: [Guilds, GuildMembers, GuildMessages, GuildMessageReactions, GuildVoiceStates],
    partials: [User, Message, GuildMember, ThreadMember]
});

const { loadEvents } = require("./Structures/Handlers/eventHandler.js");
require("./Page/app.js");

client.config = require("./Structures/config.json");
client.commands = new Collection();
client.buttons = new Collection();
client.voiceGenerator = new Collection();
client.events = new Collection();
client.subCommands = new Collection();

["GiveawaySys", "antiCrash"].forEach((sys) => {
    require(`./Systems/${sys}`)(client);
});
/**************************************************/
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { SpotifyClientId, SpotifyClientSecret } = require("./Structures/config.json");

client.distube = new DisTube(client, {
    searchSongs: 10,
    emitNewSongOnly: true,
    leaveOnFinish: false,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    plugins: [
        new SpotifyPlugin({
            emitEventsAfterFetching: true,
            api: {
                clientId: SpotifyClientId,
                clientSecret: SpotifyClientSecret,
                topTracksCountry: "TW",
            },
        }),
        new SoundCloudPlugin(),
    ],
});
/**************************************************/
module.exports = client;

Events.defaultMaxListeners = 0;
process.setMaxListeners(0);

loadEvents(client);

client.login(client.config.Token);