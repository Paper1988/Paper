import { ActionStatus, type MeetingDoc, MeetingStatus } from '@/typings/meeting.js'
import mongoose from 'mongoose'

const agendaItemSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        title: { type: String, required: true, maxlength: 200 },
        topic: { type: String, required: true, maxlength: 200 },
        expectedOutcome: { type: String, required: true, maxlength: 200 },
        ownerId: { type: String, required: true },
        timeboxMinutes: { type: Number, min: 1, max: 240 },
        decisionPoints: { type: [String], default: [] }
    },
    { _id: false }
)

const checklistItemSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        text: { type: String, required: true, maxlength: 200 },
        done: { type: Boolean, default: false },
        required: { type: Boolean, default: false }
    },
    { _id: false }
)

const actionItemSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        description: { type: String, required: true, maxlength: 200 },
        assigneeId: { type: String, required: true },
        dueDate: { type: Date },
        status: {
            type: String,
            enum: Object.values(ActionStatus),
            default: ActionStatus.OPEN
        },
        createdBy: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        completedAt: { type: Date }
    },
    { _id: false }
)

const meetingNoteSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        authorId: { type: String, required: true },
        content: { type: String, required: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now }
    },
    { _id: false }
)

const meetingTimerSchema = new mongoose.Schema(
    {
        currentAgendaItemId: { type: String },
        startedAt: { type: Date },
        endsAt: { type: Date },
        lastNotifiedAt: { type: Date }
    },
    { _id: false }
)

const meetingSchema = new mongoose.Schema<MeetingDoc>(
    {
        meetingId: { type: String, required: true, unique: true },
        guildId: { type: String, required: true },
        channelId: { type: String, required: true },
        messageId: { type: String },
        creatorId: { type: String, required: true },

        // Core meeting info
        title: { type: String, required: true, maxlength: 100 },
        scheduledAt: { type: Date },
        durationMinutes: {
            type: Number,
            required: true,
            min: 5,
            max: 480
        },
        status: {
            type: String,
            enum: Object.values(MeetingStatus),
            default: MeetingStatus.SCHEDULED
        },
        participants: { type: [String], default: [] },

        // Content
        agenda: { type: [agendaItemSchema], default: [] },
        checklist: { type: [checklistItemSchema], default: [] },
        timers: { type: meetingTimerSchema, default: {} },
        notes: { type: [meetingNoteSchema], default: [] },
        actions: { type: [actionItemSchema], default: [] },

        // Metadata
        closedAt: { type: Date },
        lastUpdatedAt: { type: Date, default: Date.now },
        locale: { type: String, default: 'zh-TW' }
    },
    {
        timestamps: true,
        collection: 'meetings'
    }
)

// Indexes for performance
meetingSchema.index({ guildId: 1, status: 1 })
meetingSchema.index({ creatorId: 1, status: 1 })

// TTL index for auto-archiving ended meetings after 30 days
meetingSchema.index(
    { closedAt: 1 },
    {
        expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days in seconds
        partialFilterExpression: { closedAt: { $exists: true } }
    }
)

// Update lastUpdatedAt on save
meetingSchema.pre('save', function (this: MeetingDoc) {
    this.lastUpdatedAt = new Date()
})

// Update lastUpdatedAt on update operations
meetingSchema.pre(
    ['updateOne', 'findOneAndUpdate'],
    function (this: mongoose.Query<any, MeetingDoc>) {
        this.set({ lastUpdatedAt: new Date() })
    }
)

// Validation
meetingSchema.pre('save', function (this: MeetingDoc) {
    // Ensure agenda doesn't exceed max items
    if (this.agenda.length > 25) {
        throw new Error('議程項目不能超過 25 個')
    }

    // Ensure participants don't exceed max
    if (this.participants.length > 50) {
        throw new Error('參與者不能超過 50 人')
    }
})

export default mongoose.model<MeetingDoc>('Meeting', meetingSchema)
