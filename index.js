const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const {
  Guilds,
  GuildMembers,
  GuildMessages,
  GuildMessageReactions,
  GuildVoiceStates,
} = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({
  shards: "auto",
  intents: [
    Guilds,
    GuildMembers,
    GuildMessages,
    GuildMessageReactions,
    GuildVoiceStates,
  ],
  partials: [User, Message, GuildMember, ThreadMember],
});

const { loadEvents } = require("./Structures/Handlers/eventHandler.js");

client.config = require("./Structures/config.json");
client.commands = new Collection();
client.buttons = new Collection();
client.voiceGenerator = new Collection();
client.events = new Collection();
client.subCommands = new Collection();

require("./keepAlive.js");

["GiveawaySys"].forEach((sys) => {
  require(`./Systems/${sys}`)(client);
});

/**************************************************/
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");

client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnFinish: false,
  emitAddSongWhenCreatingQueue: false,
  plugins: [new SpotifyPlugin()],
});
/**************************************************/
module.exports = client;

const { setMaxListeners, EventEmitter } = require("events");

EventEmitter.defaultMaxListeners = 0;

const target = new EventTarget();
const emitter = new EventEmitter();

setMaxListeners(0, target, emitter);

loadEvents(client);

client.login(client.config.Token);