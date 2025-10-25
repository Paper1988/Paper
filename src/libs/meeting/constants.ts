import { type ChecklistItem } from '@/typings/meeting.js'

// Emojis used in meeting functionality
export const MEETING_EMOJIS = {
    // Status indicators
    SCHEDULED: '📅',
    IN_PROGRESS: '🟢',
    ENDED: '🔴',
    ARCHIVED: '📦',

    // Actions
    START: '▶️',
    END: '⏹️',
    PAUSE: '⏸️',
    TIMER: '⏰',
    CHECKLIST: '✅',

    // Content types
    AGENDA: '📋',
    POLL: '🗳️',
    NOTE: '📝',
    ACTION: '⚡',

    // Poll types
    YES: '✅',
    NO: '❌',
    MULTI: '📊',
    RANKED: '🏆',

    // Navigation
    ADD: '➕',
    EDIT: '✏️',
    REMOVE: '🗑️',
    VIEW: '👀',
    EXPORT: '📤',

    // Progress
    COMPLETE: '✅',
    INCOMPLETE: '⬜',
    PROGRESS: '🔄'
} as const

// Colors for embeds
export const MEETING_COLORS = {
    SCHEDULED: 0x3498db, // Blue
    IN_PROGRESS: 0x2ecc71, // Green
    ENDED: 0xe74c3c, // Red
    ARCHIVED: 0x95a5a6, // Gray
    POLL: 0x9b59b6, // Purple
    SUCCESS: 0x2ecc71, // Green
    WARNING: 0xf39c12, // Orange
    ERROR: 0xe74c3c, // Red
    INFO: 0x3498db // Blue
} as const

// Limits and constraints
export const MEETING_LIMITS = {
    TITLE_MAX_LENGTH: 100,
    TOPIC_MAX_LENGTH: 200,
    EXPECTED_OUTCOME_MAX_LENGTH: 200,
    NOTE_MAX_LENGTH: 500,
    ACTION_DESCRIPTION_MAX_LENGTH: 200,
    POLL_OPTION_MAX_LENGTH: 100,

    MAX_AGENDA_ITEMS: 25,
    MAX_POLL_OPTIONS: 25,
    MAX_PARTICIPANTS: 50,
    MAX_CONCURRENT_MEETINGS_PER_GUILD: 5,

    MIN_DURATION_MINUTES: 5,
    MAX_DURATION_MINUTES: 480, // 8 hours

    DEFAULT_POLL_DURATION_MINUTES: 60,
    MAX_POLL_DURATION_MINUTES: 1440 // 24 hours
} as const

// Default checklist items for new meetings
export const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
    {
        text: '會議目標已明確定義',
        done: false,
        required: true
    },
    {
        text: '議程已準備完成',
        done: false,
        required: true
    },
    {
        text: '必要參與者已確認出席',
        done: false,
        required: true
    },
    {
        text: '相關文件或連結已準備',
        done: false,
        required: false
    },
    {
        text: '需要決策的重點已識別',
        done: false,
        required: false
    }
]

// Timer settings
export const TIMER_SETTINGS = {
    WARNING_THRESHOLD_PERCENT: 80, // Show warning at 80% of time
    REMINDER_INTERVAL_MINUTES: 5, // Remind every 5 minutes when overdue
    MAX_OVERDUE_REMINDERS: 3 // Stop reminding after 3 overdue notifications
} as const

// Database TTL settings
export const TTL_SETTINGS = {
    MEETING_ARCHIVE_DAYS: 30, // Archive meetings after 30 days
    POLL_CLEANUP_DAYS: 7 // Clean up ended polls after 7 days
} as const

// Text strings for internationalization (zh-TW)
export const MEETING_STRINGS = {
    // Status labels
    STATUS: {
        SCHEDULED: '已排程',
        IN_PROGRESS: '進行中',
        ENDED: '已結束',
        ARCHIVED: '已歸檔'
    },

    // Button labels
    BUTTONS: {
        START_MEETING: '開始會議',
        END_MEETING: '結束會議',
        VIEW_CHECKLIST: '查看檢查清單',
        START_TIMER: '開始計時',
        STOP_TIMER: '停止計時',
        ADD_AGENDA: '新增議程',
        EDIT_AGENDA: '編輯議程',
        REMOVE_AGENDA: '移除議程',
        CREATE_POLL: '建立投票',
        ADD_NOTE: '新增筆記',
        ADD_ACTION: '新增行動項目',
        VIEW_ACTIONS: '查看行動項目',
        EXPORT_SUMMARY: '匯出摘要'
    },

    // Field labels
    FIELDS: {
        TITLE: '標題',
        PARTICIPANTS: '參與者',
        DURATION: '預計時長',
        AGENDA: '議程',
        CHECKLIST: '檢查清單',
        ACTIONS: '行動項目',
        NOTES: '會議筆記',
        DECISIONS: '決議事項'
    },

    // Messages
    MESSAGES: {
        MEETING_CREATED: '會議已成功建立！',
        MEETING_STARTED: '會議已開始進行',
        MEETING_ENDED: '會議已結束',
        TIMER_WARNING: '議程時間即將結束（剩餘 {minutes} 分鐘）',
        TIMER_EXPIRED: '議程時間已結束！',
        VOTE_CAST: '您的投票已記錄',
        VOTE_UPDATED: '您的投票已更新',
        PERMISSION_DENIED: '您沒有權限執行此操作',
        MEETING_NOT_FOUND: '找不到指定的會議',
        POLL_NOT_FOUND: '找不到指定的投票'
    },

    // Validation errors
    ERRORS: {
        TITLE_TOO_LONG: `會議標題不能超過 ${MEETING_LIMITS.TITLE_MAX_LENGTH} 個字元`,
        INVALID_DURATION: `會議時長必須在 ${MEETING_LIMITS.MIN_DURATION_MINUTES} 到 ${MEETING_LIMITS.MAX_DURATION_MINUTES} 分鐘之間`,
        TOO_MANY_AGENDA_ITEMS: `議程項目不能超過 ${MEETING_LIMITS.MAX_AGENDA_ITEMS} 個`,
        TOO_MANY_PARTICIPANTS: `參與者不能超過 ${MEETING_LIMITS.MAX_PARTICIPANTS} 人`,
        MEETING_ALREADY_STARTED: '會議已經開始，無法修改基本資訊',
        MEETING_ALREADY_ENDED: '會議已結束',
        POLL_ALREADY_CLOSED: '投票已結束'
    }
} as const
