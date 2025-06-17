import type { PaperClient } from '@/classes/PaperClient.js'
import {
    type AnySelectMenuInteraction,
    type ButtonInteraction,
    type ModalSubmitInteraction
} from 'discord.js'

type ButtonExecute = (
    interaction: ButtonInteraction,
    client: PaperClient,
    args?: string[]
) => Promise<void | unknown>

type MenuExecute = (
    interaction: AnySelectMenuInteraction,
    client: PaperClient,
    args?: string[]
) => Promise<void | unknown>

type ModalExecute = (
    interaction: ModalSubmitInteraction,
    client: PaperClient,
    args?: string[]
) => Promise<void | unknown>

export type ButtonType = {
    id: string
    execute: ButtonExecute
    args?: string[]
}

export type MenuType = {
    id: string
    execute: MenuExecute
    args?: string[]
}

export type ModalType = {
    id: string
    execute: ModalExecute
    args?: string[]
}
