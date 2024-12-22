const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const GiveawayStats = require('../Structures/Schemas/GiveawayStats');

module.exports = {
    id: 'giveaway-modal',
    async execute(interaction, client) {
        const [_, channelId] = interaction.customId.split('/');
        const channel = await client.channels.fetch(channelId);

        if (!channel) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 找不到指定的頻道！',
                ephemeral: true
            });
        }

        const prize = interaction.fields.getTextInputValue('prize');
        const duration = parseInt(interaction.fields.getTextInputValue('duration'));
        const winners = parseInt(interaction.fields.getTextInputValue('winners'));
        const description = interaction.fields.getTextInputValue('description') || '';
        const requirements = interaction.fields.getTextInputValue('requirements') || '';

        // 解析要求
        const requirementOptions = {};
        if (requirements) {
            requirements.split(',').forEach(req => {
                const [key, value] = req.trim().split(':');
                if (key && value) {
                    switch (key.toLowerCase()) {
                        case 'role':
                            requirementOptions.requiredRoles = value.split(' ');
                            break;
                        case 'blacklist':
                            requirementOptions.blacklistedRoles = value.split(' ');
                            break;
                        case 'age':
                            requirementOptions.minAccountAge = parseInt(value);
                            break;
                        case 'server':
                            requirementOptions.minServerTime = parseInt(value);
                            break;
                    }
                }
            });
        }

        if (isNaN(duration) || duration < 1) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 持續時間必須是有效的數字且大於0！',
                ephemeral: true
            });
        }

        if (isNaN(winners) || winners < 1) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 得獎人數必須是有效的數字且大於0！',
                ephemeral: true
            });
        }

        const giveawayEmbed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle('<:tada:1265562251981750272> | 抽獎活動')
            .setDescription(`
                <:gift:1265560472409735181> | 獎品：**${prize}**
                <:people:1265561435220611196> | 參加人數：0
                <:clock:1265560238137016372> | 結束時間：<t:${Math.floor((Date.now() + duration * 60000) / 1000)}:R>
                ${description ? `<:richpresent:1265561713969987676> | 描述：${description}` : '無'}
            `)
            .addFields(
                {
                    name: '<:warning:1265562532857380936> | 參加條件',
                    value: `> <:person:1265561455529562154> 需要身分組：${requirementOptions.requiredRoles?.length ? requirementOptions.requiredRoles.map(r => `<@&${r}>`).join(', ') : '無'}\n` +
                           `> <:person:1265561455529562154> 黑名單身分組：${requirementOptions.blacklistedRoles?.length ? requirementOptions.blacklistedRoles.map(r => `<@&${r}>`).join(', ') : '無'}\n` +
                           `> <:calendar:1265560204414816287> 最小帳號年齡：${requirementOptions.minAccountAge ? `${requirementOptions.minAccountAge} 天` : '無'}\n` +
                           `> <:calendar:1265560204414816287> 最小伺服器時間：${requirementOptions.minServerTime ? `${requirementOptions.minServerTime} 天` : '無'}`
                }
            )
            .setAuthor({ 
                name: `主持人：${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setFooter({ 
                text: `得獎人數：${winners} 位`, 
                iconURL: interaction.guild.iconURL() 
            })
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('giveaway-join')
                    .setLabel('參加抽獎')
                    .setEmoji('<:wave:1320296301862191104>')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`giveaway-reroll/${interaction.user.id}`)
                    .setLabel('重新抽獎')
                    .setEmoji('🎲')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );

        const message = await channel.send({
            embeds: [giveawayEmbed],
            components: [buttons]
        });

        // 創建抽獎資料
        const giveawayData = {
            messageId: message.id,
            channelId: channel.id,
            guildId: channel.guild.id,
            startAt: Date.now(),
            endAt: Date.now() + duration * 60000,
            ended: false,
            winnerCount: winners,
            prize,
            hostedBy: interaction.user.id,
            participants: [],
            description,
            ...requirementOptions
        };

        // 儲存到資料庫
        await client.giveawaysManager.saveGiveaway(message.id, giveawayData);

        // 設定結束計時器
        setTimeout(() => {
            client.giveawaysManager.end(message.id).catch(console.error);
        }, duration * 60000);

        // 更新統計資料
        let stats = await GiveawayStats.findOne({ guildId: interaction.guildId });
        if (!stats) {
            stats = new GiveawayStats({ 
                guildId: interaction.guildId,
                totalGiveaways: 0,
                activeGiveaways: 0,
                totalPrizes: 0,
                totalParticipants: 0,
                totalWinners: 0
            });
        }

        stats.totalGiveaways++;
        stats.activeGiveaways++;
        stats.totalPrizes++;

        // 更新最活躍主持人
        if (!stats.mostActiveHoster || !stats.mostActiveHoster.userId) {
            stats.mostActiveHoster = {
                userId: interaction.user.id,
                count: 1
            };
        } else if (stats.mostActiveHoster.userId === interaction.user.id) {
            stats.mostActiveHoster.count++;
        } else {
            const currentCount = stats.mostActiveHoster.count;
            const userHostCount = await Giveaway.countDocuments({
                guildId: interaction.guildId,
                hostedBy: interaction.user.id
            });
            
            if (userHostCount + 1 > currentCount) {
                stats.mostActiveHoster = {
                    userId: interaction.user.id,
                    count: userHostCount + 1
                };
            }
        }

        await stats.save();

        await interaction.reply({
            content: `<:correct:1265560254708711467> | 抽獎活動已在 ${channel} 創建成功！`,
            ephemeral: true
        });
    }
}; 