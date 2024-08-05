const { Client, EmbedBuilder } = require('discord.js')
const mongoose = require('mongoose')

const { loadCommands } = require('../../Structures/Handlers/commandHandler.js')
const { loadButtons } = require('../../Structures/Handlers/buttonHandler.js')
const { loadModals } = require('../../Structures/Handlers/modalHandler.js')
const { loadMenus } = require('../../Structures/Handlers/menuHandler.js')
const { updatePresence } = require('../../Systems/updatePresence.js')

module.exports = {
    name: 'ready',
    once: true,
    /**
     * @param {Client} client
     */
    async execute(client) {
        loadCommands(client)
        loadButtons(client)
        loadModals(client)
        loadMenus(client)

        require('../../Page/app.js')
        require(`../../Systems/GiveawaySys`)(client)

        mongoose.set('strictQuery', false)
        await mongoose
            .connect(client.config.Database)
            .then(() => console.log('>>> ✅ 成功連結到 MongoDB!'))

        await client.giveawaysManager
            ._init()
            .then(() => console.log('>>> ✅ 成功連結到 discord-giveaways!'))

        const Embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(
                `<:online_860123643395571713:1202213698467274792> ${client.user} 上線了!`
            )
            .setTimestamp()

        await client
            .fetchWebhook(
                '1265249137327214674',
                'JKxcMDXNaR0Y2Y-LVt-syEGHsGIrab97FdyliUTGFH_dNEGaXf8Ty7RXLeAGEvliT5IN'
            )
            .then((webhook) => webhook.send({ embeds: [Embed] }))

        setInterval(async () => await updatePresence(client), 10 * 1000)
    }
}
