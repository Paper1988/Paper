const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, Client } = require("discord.js");

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
    .setName("server-list")
    .setDescription("列出所有伺服器"),
    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        async function sendMessage(message, key) {
            const embed = new EmbedBuilder()
                .setColor("Blurple")
                .setDescription(message);

            if (key) {
                const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("list")
                    .setLabel("🔗 Server List")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://sourceb.in/${key}`)
                );

                await interaction.editReply({ embeds: [embed], components: [button] });
            } else {
                await interaction.editReply({ embeds: [embed] });
            }
        }
        
        var content = `${client.user.username}伺服器列表:\n\n`;

        var guilds = await client.guilds.fetch();
        await guilds.forEach(async (guild) => {
            content += `名稱:${guild.name} - ID:(${guild.id})\n`;
        });

        content += `如果伺服器超過200個的話，你將只會看到200個左右伺服器`;

        var listBin = await fetch("https://sourceb.in/api/bins", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                files: [{
                    content: content
                }],
            }),
        });

        if (listBin.ok) {
            var { key } = await listBin.json();
            await sendMessage(`<:globe_859424401971609600:1201843661785284659> | **我的伺服器列表**:\n\n我目前在\`${client.guilds.cache.size}\`個伺服器中`, key);
        } else {
            await sendMessage("<:warning_908958943466893323:1201844340276862976> | 無法載入伺服器列表!");
        }
    }
}