const { Message, MessageEmbed } = require("discord.js");
const config = require("../../Structures/config.json");
const DB = require("../../Structures/Schemas/AntiScamDB");

module.exports = {
  name: "messageCreate",
  /**
   *
   * @param {Message} message
   */
  async execute(message) {
    DB.findOne({ Guild: message.guild.id }, async (err, data) => {
      if (!data) return;
      if (err) throw err;
      const array = require(`../../Structures/Validation/Blacklist.json`);
      if (array.some((word) => message.content.toLowerCase().includes(word))) {
        message.delete();
        const Ex = new MessageEmbed()
          .setTitle("檢測到詐騙連結")
          .setColor(config.Warna)
          .setThumbnail(`${message.author.displayAvatarURL({ dynamic: true })}`)
          .setDescription(`請不要發送任何詐騙訊息。謝謝你`)
          .addField(
            "用戶: ",
            `\`\`\`${message.author.tag} (${message.author.id})\`\`\``
          )
          .addField("訊息內容: ", `\`\`\`${message.content}\`\`\``)
          .setTimestamp();

        await message.guild.channels.cache
          .get(data.Channel)
          .send({ embeds: [Ex] });
      }
    });
  },
};
