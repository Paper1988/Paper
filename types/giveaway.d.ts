import { Document } from 'mongoose'

export interface IGiveaway extends Document {
    messageId: string
    channelId: string
    guildId: string
    startAt: Date
    endAt: Date
    ended: boolean
    winnerCount: number
    prize: string
    hostedBy: string
    participants: string[]
    winners: string[]
    description?: string
    requiredRoles?: string[]
    blacklistedRoles?: string[]
    minAccountAge: number
    minServerTime: number
    reminded: boolean
    createdAt: Date
    updatedAt: Date
}
