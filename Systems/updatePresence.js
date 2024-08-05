const { Client, ActivityType } = require('discord.js')

/**
 * @param {Client} client
 */
async function updatePresence(client) {
    let memberCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
    let serverCount = client.guilds.cache.size

    const activities = [`${serverCount} 個伺服器`, `${memberCount} 位用戶`, `/help`]
    const status = activities[Math.floor(Math.random() * activities.length)]

    try {
        client.user.setPresence({
            activities: [{ name: status, type: ActivityType.Watching }]
        })
    } catch (error) {
        console.error('Error updating presence:', error)
    }
}

module.exports = { updatePresence }
