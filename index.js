const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const { Guilds, GuildMembers, GuildMessages, GuildMessageReactions, GuildVoiceStates } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({
  shards: "auto",
  intents: [Guilds, GuildMembers, GuildMessages, GuildMessageReactions, GuildVoiceStates],
  partials: [User, Message, GuildMember, ThreadMember]
});

const { loadEvents } = require("./Structures/Handlers/eventHandler.js");

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

client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnFinish: true,
  emitAddSongWhenCreatingQueue: false,
  plugins: [new SpotifyPlugin()],
});
/**************************************************/
module.exports = client;

const { EventEmitter, setMaxListeners } = require("events");
EventEmitter.defaultMaxListeners = 0;
setMaxListeners(0, new EventTarget(), new EventEmitter());

loadEvents(client);

client.login(client.config.Token);