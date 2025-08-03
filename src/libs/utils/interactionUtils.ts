import { MessageFlags, type Interaction, type PermissionResolvable } from 'discord.js'

// 配置常量
export const CONFIG = {
    DEVELOPER_ID: '538639229220028416',
    MESSAGES: {
        COMMAND_NOT_FOUND: '<:warning:1265562532857380936> | 這項指令過期或不存在了!',
        DEVELOPER_ONLY: '<:warning:1265562532857380936> | 這項指令僅限於開發人員使用!',
        NO_PERMISSION: '<:warning:1265562532857380936> | 你沒有權限使用!',
        BUTTON_NOT_FOUND: '<:warning:1265562532857380936> | 這個按鈕不存在或過期了!',
        MODAL_NOT_FOUND: '<:outage:1265561329528471613> | 找不到該Modal',
        MENU_NOT_FOUND: '<:outage:1265561329528471613> | 找不到該下拉選單',
        CONTEXT_MENU_NOT_FOUND: '<:outage:1265561329528471613> | 找不到該右鍵選單',
        UNKNOWN_ERROR: '<:outage:1265561329528471613> | 發生未知錯誤，請協助回報!',
        INTERACTION_EXPIRED: '<:outage:1265561329528471613> | 訊息被流量怪獸吃掉了，請稍後再試'
    },
    BUTTON_PREFIXES: ['mcstats', 'report', 'rps_', 'approve_', 'unban', 'TicTacToe_']
} as const

// 工具函數
export const interactionUtils = {
    /**
     * 解析 customId，支援 '/' 和 ':' 分隔符
     */
    parseCustomId(customId: string): string[] {
        return customId.includes('/') ? customId.split('/') : customId.split(':')
    },

    /**
     * 檢查用戶是否為開發者
     */
    isDeveloper(userId: string): boolean {
        return userId === CONFIG.DEVELOPER_ID
    },

    /**
     * 檢查權限
     */
    hasPermission(interaction: Interaction, permission?: PermissionResolvable): boolean {
        if (!permission || !interaction.memberPermissions) return true
        return interaction.memberPermissions.has(permission)
    },

    /**
     * 發送錯誤回應
     */
    async sendErrorResponse(interaction: Interaction, message: string, ephemeral = true) {
        const options: any = {
            content: message
        }

        if (ephemeral) {
            options.flags = MessageFlags.Ephemeral
        }

        // 使用更安全的類型檢查
        if (
            'replied' in interaction &&
            'deferred' in interaction &&
            (interaction.replied || interaction.deferred)
        ) {
            if ('followUp' in interaction) {
                await interaction.followUp(options)
            }
        } else if ('reply' in interaction) {
            await interaction.reply(options)
        }
    },

    /**
     * 發送權限錯誤
     */
    async sendPermissionError(interaction: Interaction) {
        await this.sendErrorResponse(interaction, CONFIG.MESSAGES.NO_PERMISSION)
    },

    /**
     * 發送開發者權限錯誤
     */
    async sendDeveloperError(interaction: Interaction) {
        await this.sendErrorResponse(interaction, CONFIG.MESSAGES.DEVELOPER_ONLY)
    }
}
