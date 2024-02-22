module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (!interaction.isStringSelectMenu()) return;
        if (!interaction.customId === "filters") return;

        const { member } = interaction;
        const VoiceChannel = member.voice.channel;

        const queue = await client.distube.getQueue(VoiceChannel);
        const msg = `<:warning_908958943466893323:1201844340276862976>**注意**: 可能需要等待**3**至**5**秒後才會載入過濾器!`;

        const selection = interaction.values[0];

        switch (selection) {
            case "8d":
                if (queue.filters.has(`8d`)) {
                await queue.filters.remove(`8d`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`8d\` 過濾器\n${msg}`, ephemeral: true, });
                } else {
                await queue.filters.add(`8d`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`8d\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "karaoke":
                if (queue.filters.has(`karaoke`)) {
                await queue.filters.remove(`karaoke`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`karaoke\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`karaoke`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`karaoke\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "vaporwave":
                if (queue.filters.has(`vaporwave`)) {
                await queue.filters.remove(`vaporwave`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`vaporwave\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`vaporwave`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`vaporwave\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "flanger":
                if (queue.filters.has(`flanger`)) {
                await queue.filters.remove(`flanger`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`flanger\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`flanger`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`flanger\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "gate":
                if (queue.filters.has(`gate`)) {
                await queue.filters.remove(`gate`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`gate\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`gate`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`gate\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "haas":
                if (queue.filters.has(`haas`)) {
                await queue.filters.remove(`haas`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`haas\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`haas`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`haas\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "reverse":
                if (queue.filters.has(`reverse`)) {
                await queue.filters.remove(`reverse`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`reverse\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`reverse`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`reverse\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "mcompand":
                if (queue.filters.has(`mcompand`)) {
                await queue.filters.remove(`mcompand`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`mcompand\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`mcompand`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`mcompand\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "phaser":
                if (queue.filters.has(`phaser`)) {
                await queue.filters.remove(`phaser`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`phaser\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`phaser`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`phaser\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "tremolo":
                if (queue.filters.has(`tremolo`)) {
                await queue.filters.remove(`tremolo`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`tremolo\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`tremolo`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`tremolo\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "earwax":
                if (queue.filters.has(`earwax`)) {
                await queue.filters.remove(`earwax`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`earwax\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`earwax`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`earwax\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "bassboost":
                if (queue.filters.has(`bassboost`)) {
                await queue.filters.remove(`bassboost`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`bassboost\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`bassboost`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`bassboost\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "echo":
                if (queue.filters.has(`echo`)) {
                await queue.filters.remove(`echo`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`echo\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`echo`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`echo\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "nightcore":
                if (queue.filters.has(`nightcore`)) {
                await queue.filters.remove(`nightcore`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`nightcore\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`nightcore`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`nightcore\` 過濾器\n${msg}`, ephemeral: true });
                }

            case "surround":
                if (queue.filters.has(`surround`)) {
                await queue.filters.remove(`surround`);
                return interaction.reply({ content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`surround\` 過濾器\n${msg}`, ephemeral: true });
                } else {
                await queue.filters.add(`surround`);
                return interaction.reply({ content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`surround\` 過濾器\n${msg}`, ephemeral: true });
                }
        }
    }
}