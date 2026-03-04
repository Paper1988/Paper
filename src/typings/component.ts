import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import {
    type AnySelectMenuInteraction,
    type ButtonInteraction,
    type ModalSubmitInteraction
} from 'discord.js'

type ButtonExecute = (
    interaction: ButtonInteraction,
    client: PaperClient,
    ...args: any[]
) => Promise<void | unknown>

type MenuExecute = (
    interaction: AnySelectMenuInteraction,
    client: PaperClient,
    ...args: any[]
) => Promise<void | unknown>

type ModalExecute = (
    interaction: ModalSubmitInteraction,
    client: PaperClient,
    ...args: any[]
) => Promise<void | unknown>

export type ButtonType = {
    id: string
    execute: ButtonExecute
    args?: any[]
    developer?: boolean
}

export type MenuType = {
    id: string
    execute: MenuExecute
    args?: any[]
    developer?: boolean
}

export type ModalType = {
    id: string
    execute: ModalExecute
    args?: any[]
    developer?: boolean
}
