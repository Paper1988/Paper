const { ChatInputCommandInteraction } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        content: `⚠️ | 這項指令過期或不存在了!`,
        ephemeral: true,
      });
    if (command.developer && interaction.user.id !== "538639229220028416")
      return interaction.reply({
        content: `⚠️ | 這項指令僅限於開發人員使用!`,
        ephemeral: true,
      });

    if (GuildData)
      return interaction.reply({
        embeds: [
          Embed.setTitle(`該伺服器為黑名單伺服器!`).setDescription(
            `⛔ | 您的伺服器已被列入黑名單，自從<t:${parseInt(
              GuildData.Time / 1000
            )}:R>, 原因為: **${GuildData.Reason}**`
          ),
        ],
      });
    
    if (UserData)
      return interaction.reply({
        embeds: [
          Embed.setTitle(`該用戶為黑名單用戶!`).setDescription(
            `⛔ | 您已被列入黑名單，自從<t:${parseInt(
              UserData.Time / 1000
            )}:R>, 原因為: **${UserData.Reason}**`
          ),
        ],
      });

    const subCommand = interaction.options.getSubcommand(false);
    if (subCommand) {
      const subCommandFile = client.subCommands.get(
        `${interaction.commandName}.${subCommand}`
      );
      if (!subCommandFile)
        return interaction.reply({
          content: "⚠️ | 這項指令過期或不存在了!",
          ephemeral: true,
        });
      subCommandFile.execute(interaction, client);
    } else command.execute(interaction, client);
  },
};
