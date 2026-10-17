import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MessageFlags,
    StringSelectMenuBuilder,
    SlashCommandBuilder,
    TextDisplayBuilder,
    type InteractionReplyOptions,
} from 'discord.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import type { CommandType } from '@/typings/command.js'

export const HELP_CATEGORIES = {
    General: { label: '功能', emoji: '🔧', description: '一般工具與機器人資訊' },
    Moderation: { label: '管理', emoji: '🔒', description: '伺服器管理工具' },
    Music: { label: '音樂', emoji: '🎶', description: '音樂播放與播放清單' },
    Giveaway: { label: '抽獎', emoji: '🎁', description: '抽獎活動與通知' },
    Fun: { label: '娛樂', emoji: '🎭', description: '遊戲與互動指令' },
} as const

export type HelpCategory = keyof typeof HELP_CATEGORIES

const COMMANDS_PER_PAGE = 10
const ACCENT = 0xA3A3A3

type HelpCommand = CommandType & { helpCategory?: HelpCategory }

function getCommands(client: PaperClient, category?: HelpCategory): HelpCommand[] {
    return [...client.commands.values()]
        .filter((command): command is HelpCommand =>
            Boolean(command.data && !command.developer && command.helpCategory && command.data.name !== 'help'),
        )
        .filter((command) => !category || command.helpCategory === category)
        .sort((a, b) => a.data!.name.localeCompare(b.data!.name))
}

function getCommandData(command: HelpCommand) {
    return command.data!.toJSON() as ReturnType<SlashCommandBuilder['toJSON']>
}

type LocalizedCommandData = {
    name: string
    description?: string
    name_localizations?: Record<string, string | null>
    description_localizations?: Record<string, string | null>
}

function localizedName(data: LocalizedCommandData, locale: string): string {
    return data.name_localizations?.[locale] || data.name
}

function localizedDescription(data: LocalizedCommandData, locale: string): string {
    return data.description_localizations?.[locale] || data.description || 'No description provided.'
}

function buildCategoryMenu(client: PaperClient, selected?: HelpCategory) {
    const menu = new StringSelectMenuBuilder()
        .setCustomId('helpCategoryMenu')
        .setPlaceholder(selected ? `分類：${HELP_CATEGORIES[selected].label} · 切換分類` : '選擇一個分類')
        .addOptions(
            Object.entries(HELP_CATEGORIES)
                .filter(([key]) => getCommands(client, key as HelpCategory).length > 0)
                .map(([key, category]) => ({
                    label: `${category.emoji} ${category.label}`,
                    description: category.description,
                    value: `category:${key}`,
                    ...(selected === key ? { default: true } : {}),
                })),
        )
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)
}


function buildCommandSelect(client: PaperClient, category: HelpCategory, locale: string, selected?: string) {
    const commands = getCommands(client, category).slice(0, 25)
    const menu = new StringSelectMenuBuilder()
        .setCustomId('helpCommandMenu')
        .setPlaceholder('選擇同分類指令')
        .addOptions(
            commands.map((command) => {
                const data = getCommandData(command)
                return {
                    label: localizedName(data as unknown as LocalizedCommandData, locale).slice(0, 100),
                    description: localizedDescription(data as unknown as LocalizedCommandData, locale).slice(0, 100),
                    value: `command:${data.name}`,
                    ...(selected === data.name ? { default: true } : {}),
                }
            }),
        )
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)
}

function buildHomeButton() {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('helpBack').setLabel('返回主選單').setStyle(ButtonStyle.Secondary),
    )
}

function buildCommandButtons(category: HelpCategory, page: number, commands: HelpCommand[], locale: string) {
    const start = page * COMMANDS_PER_PAGE
    const visible = commands.slice(start, start + COMMANDS_PER_PAGE)
    const rows: ActionRowBuilder<ButtonBuilder>[] = []

    for (let index = 0; index < visible.length; index += 5) {
        const row = new ActionRowBuilder<ButtonBuilder>()
        for (const command of visible.slice(index, index + 5)) {
            const name = command.data!.name
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`helpCommand:${name}`)
                    .setLabel(`/${localizedName(getCommandData(command), locale)}`.slice(0, 80))
                    .setStyle(ButtonStyle.Secondary),
            )
        }
        rows.push(row)
    }

    const pageCount = Math.max(1, Math.ceil(commands.length / COMMANDS_PER_PAGE))
    if (pageCount > 1) {
        const controls = new ActionRowBuilder<ButtonBuilder>()
        controls.addComponents(
            new ButtonBuilder()
                .setCustomId(`helpPage:${category}:${Math.max(0, page - 1)}`)
                .setLabel('上一頁')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page <= 0),
            new ButtonBuilder()
                .setCustomId(`helpPageInfo:${category}:${page}`)
                .setLabel(`第 ${page + 1} / ${pageCount} 頁`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId(`helpPage:${category}:${Math.min(pageCount - 1, page + 1)}`)
                .setLabel('下一頁')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page >= pageCount - 1),
        )
        rows.push(controls)
    }
    return rows
}

function buildDetailContainer(client: PaperClient, commandName: string, locale: string) {
    const command = getCommands(client).find((item) => item.data!.name === commandName)
    const container = new ContainerBuilder().setAccentColor(ACCENT)

    if (!command) {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '# 找不到這個指令\n目前無法找到這項指令，請返回主選單重新選擇。',
            ),
        )
        container.addActionRowComponents(buildHomeButton())
        return container
    }

    const data = getCommandData(command)
    type HelpOption = {
        name: string
        description?: string
        required?: boolean
        type?: number
        options?: HelpOption[]
    }
    const options = 'options' in data && Array.isArray(data.options) ? data.options as HelpOption[] : []
    const renderOptions = (items: HelpOption[], parent = ''): string[] =>
        items.flatMap((option) => {
            const optionData = option as HelpOption & LocalizedCommandData
            const optionName = localizedName(optionData, locale)
            const optionDescription = localizedDescription(optionData, locale)
            const path = parent ? `${parent} ${optionName}` : optionName
            if (option.type === 1 || option.type === 2) {
                const line = `• \`/${localizedName(data as unknown as LocalizedCommandData, locale)} ${path}\` · ${optionDescription}`
                return [line, ...(option.options?.length ? renderOptions(option.options, path).map((child) => `  ${child}`) : [])]
            }
            const required = option.required ? (locale === 'ja' ? '必須' : locale === 'zh-TW' ? '必填' : 'Required') : (locale === 'ja' ? '任意' : locale === 'zh-TW' ? '選填' : 'Optional')
            return [`• \`${optionName}\` · ${optionDescription}（${required}）`]
        })
    const optionLines = renderOptions(options)
    const category = command.helpCategory!
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `# /${localizedName(data as unknown as LocalizedCommandData, locale)}\n${localizedDescription(data as unknown as LocalizedCommandData, locale)}\n\n` +
            (optionLines.length ? `## 可用參數\n${optionLines.join('\n')}\n\n` : '') +
            `-# ${HELP_CATEGORIES[category].emoji} ${HELP_CATEGORIES[category].label} · ${getCommands(client, category).length} 個指令`,
        ),
    )
    container.addActionRowComponents(buildCommandSelect(client, category, locale, commandName))
    container.addActionRowComponents(buildCategoryMenu(client, category))
    container.addActionRowComponents(buildHomeButton())
    return container
}

export function buildHelpHome(client: PaperClient, locale = 'en-US'): InteractionReplyOptions {
    const commands = getCommands(client)
    const categoryMenu = buildCategoryMenu(client)
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${client.user!.id}&permissions=1644971945463&scope=bot%20applications.commands`
    const links = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setLabel('邀請 Paper').setStyle(ButtonStyle.Link).setURL(inviteUrl),
        new ButtonBuilder().setLabel('支援伺服器').setStyle(ButtonStyle.Link).setURL('https://discord.gg/6qCTEer4pT'),
        new ButtonBuilder().setLabel('Ko-fi').setStyle(ButtonStyle.Link).setURL('https://ko-fi.com/paper1988'),
    )
    const container = new ContainerBuilder()
        .setAccentColor(ACCENT)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '# Paper / 指令導覽\nMusic · Utilities · Community\n\n' +
                '選擇功能分類，或點選分類中的指令按鈕查看用途與參數。\n' +
                `-# ${commands.length} 個可用指令 · 自動同步已註冊指令`,
            ),
        )
        .addActionRowComponents(categoryMenu)
        .addActionRowComponents(links)

    return { components: [container], flags: MessageFlags.IsComponentsV2 }
}

export function buildHelpCategory(client: PaperClient, category: HelpCategory, page = 0, locale = 'en-US'): InteractionReplyOptions {
    const meta = HELP_CATEGORIES[category]
    const commands = getCommands(client, category)
    const pageCount = Math.max(1, Math.ceil(commands.length / COMMANDS_PER_PAGE))
    const currentPage = Math.min(Math.max(0, page), pageCount - 1)
    const container = new ContainerBuilder()
        .setAccentColor(ACCENT)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `# ${meta.emoji} ${meta.label}\n${meta.description}\n\n` +
                (commands.length
                    ? `點選指令按鈕查看詳細說明。\n-# ${commands.length} 個指令 · 第 ${currentPage + 1} / ${pageCount} 頁`
                    : '目前這個分類沒有可顯示的指令。'),
            ),
        )
        .addActionRowComponents(buildCategoryMenu(client, category))

    for (const row of buildCommandButtons(category, currentPage, commands, locale)) {
        container.addActionRowComponents(row)
    }
    container.addActionRowComponents(buildHomeButton())
    return { components: [container], flags: MessageFlags.IsComponentsV2 }
}

export function buildHelpCommand(client: PaperClient, commandName: string, locale = 'en-US'): InteractionReplyOptions {
    return { components: [buildDetailContainer(client, commandName, locale)], flags: MessageFlags.IsComponentsV2 }
}

export function buildHelpPage(client: PaperClient, categoryName: string, pageText: string, locale = 'en-US'): InteractionReplyOptions {
    const category = categoryName as HelpCategory
    if (!(category in HELP_CATEGORIES)) return buildHelpHome(client)
    const page = Number.parseInt(pageText, 10)
    return buildHelpCategory(client, category, Number.isFinite(page) ? page : 0, locale)
}

export function buildHelpSelection(client: PaperClient, value: string, locale = 'en-US'): InteractionReplyOptions {
    if (value.startsWith('category:')) {
        return buildHelpCategory(client, value.slice('category:'.length) as HelpCategory, 0, locale)
    }
    if (value.startsWith('command:')) {
        return buildHelpCommand(client, value.slice('command:'.length), locale)
    }
    return buildHelpHome(client)
}
