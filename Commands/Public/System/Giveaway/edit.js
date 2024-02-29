const { EmbedBuilder, ChatInputCommandInteraction, Client } = require("discord.js");
const ms = require("ms");

module.exports = {
    subCommand: "giveaway.edit",
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    execute(interaction, client) {
        const errEmbed = new EmbedBuilder().setColor("Red");

        const successEmbed = new EmbedBuilder().setColor("Green");

        const query = interaction.options.getString("query");

        const giveaway =
            // Search with giveaway prize
            client.giveawaysManager.giveaways.find((g) => g.guildId === interaction.guildId && g.prize === query) ||
            // Search with messageId
            client.giveawaysManager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === query);

        if (!giveaway) {
            errEmbed.setDescription(
                `<:warning_908958943466893323:1201844340276862976> | 無法找到訊息ID: ${query}\n請確認有無輸入錯誤!`
            );
            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }

        const newDuration = interaction.options.getString("new-duration") || 0;
        const newWinners = interaction.options.getInteger("new-winners") || giveaway.winnerCount;
        const newPrizes = interaction.options.getString("new-prizes") || giveaway.prize;

        client.giveawaysManager
            .edit(giveaway, {
                setEndTimestamp: Date.now() + ms(newDuration),
                newWinnerCount: newWinners,
                newPrize: newPrizes,
            })
            .then(() => {
                successEmbed.setDescription("<:correct_859388130411282442:1201843648229294121> | 成功編輯該抽獎活動!");
                interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
                errEmbed.setDescription(`<:warning_908958943466893323:1201844340276862976> | 發生錯誤: \n\`${err}\``);
                interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
    }
}