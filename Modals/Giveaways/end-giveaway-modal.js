const Giveaway = require('../Structures/Schemas/Giveaway');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    id: 'end-giveaway-modal',
    async execute(interaction, client) {
        const giveawayId = interaction.fields.getTextInputValue('giveawayId');
        
        const giveaway = await Giveaway.findOne({ 
            messageId: giveawayId,
            guildId: interaction.guildId,
            ended: false
        });

        if (!giveaway) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 找不到這個抽獎活動！',
                ephemeral: true
            });
        }

        // 檢查是否為抽獎主持人
        if (giveaway.hostedBy !== interaction.user.id && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 只有抽獎主持人或管理員可以結束抽獎！',
                ephemeral: true
            });
        }

        try {
            // 使用 giveawaysManager 結束抽獎
            await client.giveawaysManager.end(giveawayId);
            
            return interaction.reply({
                content: '<:correct:1265560254708711467> | 抽獎活動已成功結束！',
                ephemeral: true
            });
        } catch (error) {
            console.error('結束抽獎時發生錯誤:', error);
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 結束抽獎時發生錯誤！',
                ephemeral: true
            });
        }
    }
}; 