module.exports = {
    name: 'interactionCreate',
    async execute (interaction, client) {
      if (!interaction.isButton()) return;
      const buttonCustomId = interaction.customId.split('_');
      const Button = client.buttons.get(buttonCustomId[0]);
      if (!Button) return interaction.reply({ content: "<:warning_908958943466893323:1201844340276862976> | 這個按鈕不存在!", ephemeral: true });

      Button.execute(interaction, client, buttonCustomId.slice(1));
    }
}