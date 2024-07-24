const { GiveawaysManager } = require('discord-giveaways')
const giveawayModel = require('../Structures/Schemas/GiveawayDB')

module.exports = (client) => {
    const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
        async getAllGiveaways() {
            return await giveawayModel.find().lean().exec()
        }

        async saveGiveaway(messageId, giveawayData) {
            await giveawayModel.create(giveawayData)
            return true
        }

        async editGiveaway(messageId, giveawayData) {
            await giveawayModel
                .updateOne({ messageId }, giveawayData, { omitUndefined: true })
                .exec()
            return true
        }

        async deleteGiveaway(messageId) {
            await giveawayModel.deleteOne({ messageId }).exec()
            return true
        }
    }

    const manager = new GiveawayManagerWithOwnDatabase(client, {
        default: {
            botsCanWin: false,
            embedColor: '#008000',
            embedColorEnd: '#ff0000',
            reaction: '🎉'
        },
        endedGiveawaysLifetime: 30 * 24 * 60 * 60 * 1000
    })

    manager.on('endedGiveawayReactionAdded', (giveaway, member, reaction) => {
        return reaction.users.remove(member.user)
    })

    manager.on('giveawayEnded', (giveaway, winners) => {
        winners.forEach((member) => {
            member.send(
                `<:tada:1265562251981750272> 恭喜${member.user}，你在${giveaway.messageURL}贏得了獎品: \`${giveaway.prize}\``
            )
        })
    })

    manager.on('giveawayReactionAdded', (giveaway, member, reaction) => {
        if (member.user.bot) return

        giveaway.exemptMembers(member).then((role) => {
            if (!role) return
            else reaction.users.remove(member.user)
        })
    })

    client.giveawaysManager = manager
}
