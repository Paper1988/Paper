const { EmbedBuilder, GuildMember } = require("discord.js");
const ms = require("ms");
const DB = require("../../Structures/Schemas/AntiAlt"); // Change this to your own DB

module.exports = {
  name: "guildMemberAdd", // This is the name of the Event
  /**
   * @param {GuildMember} member
   */
  async execute(member) {
    const Data = await DB.findOne({
      // Checking for data in the DB
      GuildID: member.guild.id,
    });
    if (!Data) return; // If there is no data, we stop the event from running

    const logChannel = member.guild.channels.cache.get(Data.LogsChannel); // Get the logs channel

    let minAge = ms("7 days"); // Set the minimum age to 7 days
    let createdAt = new Date(member.user.createdAt).getTime(); // Get the user's createdAt date
    let diff = Date.now() - createdAt; // Get the difference between the current date and the user's createdAt date

    if (minAge > diff) {
      // If the difference is less than the minimum age
      member.kick(); // Kick the user

      const logEmbed = new EmbedBuilder()
        .setColor("RED")
        .setTitle("<:icons_warning:908958943466893323> | 發現小號!")
        .setDescription(
          `<:icons_outage:868122243845206087>用戶因成立未滿 7 天而被踢出\n\n**用戶**: ${member.user.tag}\n**ID**: ${member.user.id}`
        )
        .setTimestamp();

      return await createAndDeleteWebhook(logEmbed); // Send the logs to the logs channel
    }

    async function createAndDeleteWebhook(embedName) {
      await logChannel
        .createWebhook(member.guild.name, {
          // Creates a webhook in the logging channel specified before
          avatar: member.guild.iconURL({
            format: "png",
          }),
        })
        .then((webhook) => {
          webhook
            .send({
              // Sends the embed through the webhook
              embeds: [embedName],
            })
            .then(() => webhook.delete().catch(() => {})); // Deletes the webhook and catches the error if any
        });
    }
  },
};
