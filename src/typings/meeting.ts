export enum MeetingStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress', 
    ENDED = 'ended',
    ARCHIVED = 'archived'
}

export enum PollType {
    YES_NO = 'yn',
    MULTIPLE_CHOICE = 'multi',
    RANKED = 'ranked'
}

export enum ActionStatus {
    OPEN = 'open',
    DONE = 'done'
}

export interface AgendaItem {
    id: string
    title: string
    topic: string
    expectedOutcome: string
    ownerId: string
    timeboxMinutes?: number
    decisionPoints: string[] // poll IDs related to this agenda item
}

export interface ChecklistItem {
    id: string
    text: string
    done: boolean
    required: boolean
}

export interface ActionItem {
    id: string
    description: string
    assigneeId: string
    dueDate?: Date
    status: ActionStatus
    createdBy: string
    createdAt: Date
    completedAt?: Date
}

export interface MeetingNote {
    id: string
    authorId: string
    content: string
    createdAt: Date
}

export interface MeetingTimer {
    currentAgendaItemId?: string
    startedAt?: Date
    endsAt?: Date
}

export interface MeetingDoc {
    meetingId: string
    guildId: string
    channelId: string
    messageId?: string
    creatorId: string
    
    // Core meeting info
    title: string
    scheduledAt?: Date
    durationMinutes: number
    status: MeetingStatus
    participants: string[] // user IDs
    
    // Content
    agenda: AgendaItem[]
    checklist: ChecklistItem[]
    timers: MeetingTimer
    notes: MeetingNote[]
    actions: ActionItem[]
    
    // Metadata
    closedAt?: Date
    lastUpdatedAt: Date
    locale: string
}

export interface PollOption {
    id: string
    text: string
}

export interface PollVote {
    userId: string
    choice?: boolean // for yes/no polls
    optionIds?: string[] // for multi-choice polls
    ranking?: string[] // for ranked polls - array of option IDs in rank order
}

export interface PollDoc {
    pollId: string
    meetingId?: string
    agendaItemId?: string
    type: PollType
    
    options: PollOption[]
    votes: PollVote[]
    
    isClosed: boolean
    createdAt: Date
    endsAt?: Date
    messageId?: string // for standalone poll messages
}

// Result types for poll aggregation
export interface PollResults {
    totalVotes: number
    yesCount?: number // for yes/no polls
    noCount?: number // for yes/no polls
    optionResults?: Array<{
        option: PollOption
        count: number
        percentage: number
    }> // for multi-choice polls
    rankedResults?: Array<{
        option: PollOption
        score: number
        position: number
    }> // for ranked polls
    winner?: PollOption
}