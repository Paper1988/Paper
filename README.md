# Paper 📄

Paper 是一隻以 **TypeScript + discord.js v14** 開發的多功能 Discord 機器人，整合了 **音樂播放、抽獎系統、管理工具、實用功能、娛樂功能**，並額外提供一個可供 Dashboard 或外部服務串接的 API Server。

> 目前專案採用 ESM、TypeScript、pnpm，並使用動態載入的方式管理指令、事件、按鈕、選單與 Modal。

---

## Features

- 🎵 **Music System**
  - 使用 `moonlink.js` 作為播放器核心
  - 支援多節點音樂節點配置
  - 提供佇列、暫停、繼續、跳過、清空佇列等控制 API

- 🎉 **Giveaway System**
  - 抽獎建立、結束、重抽
  - MongoDB 持久化儲存
  - 定時檢查到期抽獎並自動結束
  - 抽獎歷史與統計資料整理

- 🛠️ **Utility / Moderation / Fun**
  - 多用途指令架構
  - 支援 Slash Commands、子指令、Context Menu
  - 可擴充按鈕、下拉選單、Modal 互動

- 🌐 **Built-in API Server**
  - 健康檢查
  - Bot 狀態查詢
  - 可管理伺服器清單查詢
  - Giveaway 與 Music 控制端點
  - 適合串接 Web Dashboard 或後端服務

- 📊 **Observability / Stability**
  - Sentry 錯誤追蹤
  - Webhook 錯誤通知
  - MongoDB 健康檢查與重連機制
  - 排程任務啟動與背景作業管理

---

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Package Manager:** pnpm
- **Discord Library:** discord.js v14
- **Music:** moonlink.js / Lavalink-compatible nodes
- **Database:** MongoDB + Mongoose
- **Cache / Queue:** Redis
- **API Server:** Fastify
- **Monitoring:** Sentry

---

## Project Structure

```bash
src/
├─ api/                  # Fastify API server
├─ Commands/             # Slash commands / context menus / subcommands
├─ Events/               # Discord events
├─ Structures/
│  ├─ classes/           # PaperClient and core classes
│  ├─ Functions/         # File loader and helpers
│  └─ Handlers/          # Command / event / button / menu / modal loaders
├─ Systems/              # Music, giveaway, and other system modules
├─ jobs/                 # Cron jobs / scheduled tasks
├─ libs/                 # Utility functions and shared helpers
└─ index.ts              # Entry point
```

---

## How it works

Paper 啟動時會做這些事：

1. 載入 `.env.local` 或 `.env`
2. 初始化 Sentry
3. 啟動排程任務
4. 建立自訂的 `PaperClient`
5. 載入 Discord Events
6. 在 `ready` 時動態載入：
   - Commands
   - Buttons
   - Menus
   - Modals
7. 初始化 Moonlink 音樂節點
8. 連線 MongoDB
9. 啟動 Fastify API Server

整體設計偏向模組化，新增功能時通常只要把檔案放到對應資料夾即可被載入，不用一直手動改中央註冊表，蠻香。

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Paper1988/Paper.git
cd Paper
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

建立 `.env` 或 `.env.local`

```env
# Discord
DISCORD_TOKEN=
TEST_TOKEN=

# Database
DATABASE_URI=

# Redis
REDIS_URL=

# Sentry
SENTRY_DSN=

# Error / startup webhooks
ANTICRASH_WEBHOOK_URL=
STARTUP_WEBHOOK_ID=
STARTUP_WEBHOOK_TOKEN=

# API
PORT=3001
GO_API_URL=http://localhost:8080

# Music nodes
NODELINK_HOST=
NODELINK_PORT=
NODELINK_PASSWORD=

LAVALINK_1_HOST=
LAVALINK_1_PORT=
LAVALINK_1_PASSWORD=

LAVALINK_2_HOST=
LAVALINK_2_PORT=
LAVALINK_2_PASSWORD=
```

> 如果音樂節點相關環境變數沒有設好，音樂功能會被停用，但機器人本體仍可繼續運作。

---

## Development

### Start in development mode

```bash
pnpm dev
```

### Build project

```bash
pnpm build
```

### Start built project

```bash
pnpm start
```

### Format code

```bash
pnpm format
```

### Check formatting

```bash
pnpm format:check
```

### Fix lint issues

```bash
pnpm lint:fix
```

### Run tests

```bash
pnpm test
```

---

## API Endpoints

內建 API Server 預設會啟動在 `0.0.0.0:${PORT}`。

### Health check

```http
GET /health
```

### Bot status

```http
GET /api/bot-status
```

### Get guilds manageable by a user

```http
GET /api/guilds?userId=<discord_user_id>
```

也可以從 request header 傳入：

```http
x-discord-id: <discord_user_id>
```

### Get a guild detail

```http
GET /api/guilds/:guildId
```

### Force end a giveaway

```http
POST /api/guilds/:guildId/giveaways/:messageId/end
```

### Reroll a giveaway

```http
POST /api/guilds/:guildId/giveaways/:messageId/reroll
```

### Get current music queue

```http
GET /api/guilds/:guildId/music/queue
```

### Skip current track

```http
POST /api/guilds/:guildId/music/skip
```

### Pause music

```http
POST /api/guilds/:guildId/music/pause
```

### Resume music

```http
POST /api/guilds/:guildId/music/resume
```

### Clear queue / destroy player

```http
DELETE /api/guilds/:guildId/music/queue
```

---

## Command System

Paper 的指令系統支援：

- Slash Commands
- Subcommands
- Subcommand Groups
- Context Menus

所有指令都會在啟動時自動掃描 `Commands` 資料夾並載入。  
如果是一般指令，會放進 `client.commands`。  
如果是子指令，則會依結構放進 `client.subCommands`。  
Context Menu 則會另外註冊。

這種結構的好處是：

- 擴充新指令很方便
- 不容易把主檔案搞成義大利麵 🍝
- 指令與互動元件能各自分工

---

## Music System

音樂系統使用 `moonlink.js`，並支援多個節點：

- Main Node
- Free Node 1
- Free Node 2

節點策略包含：

- `leastLoad`
- `autoMovePlayers`
- `avoidUnhealthyNodes`
- retry 機制
- 預設自動離開與預設音量

如果你有自己的 Lavalink / NodeLink 節點，可以直接透過環境變數接進來。

---

## Giveaway System

抽獎系統具備：

- 抽獎持久化儲存
- 自動到期結束
- 重抽功能
- 得獎者公告
- Giveaway 統計資料
- 歷史記錄保存

系統也會定期檢查 MongoDB 健康狀況，避免抽獎跑到一半直接失憶，這種事情很地獄。

---

## Error Handling

Paper 內建多層錯誤處理：

- `unhandledRejection`
- `uncaughtException`
- Discord client `error`
- Sentry
- Webhook error reporting

當機器人發生未捕捉錯誤時，會嘗試把 stack trace 傳到指定 webhook，方便除錯。

---

## Scripts

```json
{
  "dev": "tsx watch src/index.ts",
  "build": "tsc --project tsconfig.json && tsc-alias -p tsconfig.json",
  "start": "node dist/index.js",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "lint:fix": "eslint ./src --ext .ts --fix",
  "test": "mocha dist/**/*.test.js --timeout 10000"
}
```

---

## Roadmap

- [ ] 更完整的 Dashboard 整合
- [ ] 更完整的權限與 guild config 管理
- [ ] 更完整的模組文件化
- [ ] Docker / deployment setup 文件
- [ ] 指令分類與使用範例補齊

---

## License

MIT License

---

## Author

**Paper1988**

如果你喜歡這個專案，歡迎幫我點個 Star ⭐  
也歡迎拿去參考架構，但拜託不要把 bug 也一起複製走，bug 不是附贈貼紙。
