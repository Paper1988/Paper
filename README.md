# Paper

**A TypeScript-based Discord application exploring modular architecture, event-driven systems, and service integration.**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=flat&logo=discord&logoColor=white)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

Paper is a personal software project built with TypeScript and Discord.js. It brings together music playback, community utilities, persistent data, background jobs, and an HTTP API within a modular application.

Rather than treating a Discord bot as a collection of commands, this project explores how multiple subsystems can coexist in a single application, with an emphasis on code organization, asynchronous execution, and integration between external services.

## Overview

Paper is developed as a long-running application with several interconnected components:

- A Discord client responsible for events, commands, and interactions.
- A modular command and event system.
- A music subsystem powered by Moonlink.js.
- MongoDB-backed data persistence.
- Redis-based caching.
- An HTTP API built with Fastify.
- Background jobs and scheduled tasks.
- Error monitoring and operational health checks.

These components provide a practical environment for exploring the engineering challenges that arise when a small application grows into a system with multiple responsibilities.

## Engineering Highlights

### Modular Application Architecture

Paper separates major responsibilities into dedicated modules instead of placing application logic in a single entry point.

Commands, events, handlers, shared functions, and subsystem implementations are organized independently. This structure helps keep related logic discoverable and makes individual components easier to inspect and maintain.

### Event-Driven Execution

Discord interactions and gateway events form a central part of the application's execution model.

The event-oriented design separates the occurrence of an event from the logic that handles it, allowing different application features to respond to Discord events without concentrating all behavior in one large module.

### Music Subsystem

The music subsystem integrates Moonlink.js with the Discord client to support music-related functionality.

It introduces additional coordination requirements beyond ordinary command handling, including player state, queue operations, asynchronous events, and interactions with external audio nodes.

### Persistent State and Caching

Paper integrates MongoDB and Redis for different data-management responsibilities.

- **MongoDB:** Persistent application data and document-oriented storage.
- **Redis:** Cache storage for data that benefits from fast access.

Keeping persistence and caching as distinct concerns provides an opportunity to examine data lifecycle, cache consistency, failure handling, and the trade-offs between availability and correctness.

### HTTP API Integration

Fastify provides an HTTP interface for selected application operations and status information.

The API creates a boundary between Discord-specific functionality and HTTP-based access patterns, while introducing additional engineering considerations around request validation, authorization, error handling, and service exposure.

### Background Jobs and Operational Monitoring

Scheduled jobs and health checks support tasks that do not belong directly inside an individual command handler.

The project also integrates Sentry-related monitoring components, providing an entry point for examining error reporting and the operational needs of a long-running Node.js application.

## Technology Stack

| Technology | Role |
|---|---|
| TypeScript | Application language and static typing |
| Node.js | JavaScript runtime |
| Discord.js | Discord API integration |
| Moonlink.js | Music player and node integration |
| Fastify | HTTP API server |
| MongoDB | Persistent data storage |
| Mongoose | MongoDB object modeling |
| Redis / ioredis | Caching and Redis connectivity |
| Sentry | Error monitoring integration |
| pnpm | Package management |
| Mocha / Chai | Test infrastructure |

## Architecture

The application is organized around feature modules, shared infrastructure, and dedicated subsystems.

```text
src/
├── api/                  # HTTP API
├── Commands/             # Discord command modules
├── Events/               # Discord and application events
├── Structures/
│   └── classes/          # Core application classes
├── Functions/            # Shared functions
├── Handlers/             # Module and interaction handlers
├── Schemas/              # Data schemas
├── Systems/              # Application subsystems
├── jobs/                 # Scheduled and background jobs
├── libs/                 # Shared libraries and integrations
├── typings/              # TypeScript type definitions
├── __test__/              # Test files
└── index.ts              # Application entry point
```

*The directory tree represents the intended high-level organization. Individual modules may evolve as the application develops.*

### Design Principles

**Separation of concerns**

Command handling, event processing, API routing, persistence, and background tasks have distinct organizational boundaries.

**Reusable infrastructure**

Shared handlers, utility functions, and application classes reduce the need to duplicate common infrastructure across features.

**Integration-oriented design**

The application coordinates multiple libraries and services, making interface boundaries and failure behavior important parts of the overall design.

**Incremental evolution**

The modular structure provides room to refine individual components without requiring every feature to be reorganized at once.

## Development

Paper uses TypeScript, Node.js, and pnpm.

### Prerequisites

- Node.js
- pnpm
- A Discord application and bot token for runtime execution
- MongoDB and Redis instances for the corresponding integrations
- Any additional service credentials required by the enabled features

### Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/Paper1988/Paper.git
cd Paper
pnpm install
```

Configure the required environment variables for your local environment before starting the application.

### Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run the application in development mode with file watching |
| `pnpm build` | Compile TypeScript and resolve configured path aliases |
| `pnpm start` | Start the compiled application |
| `pnpm build:watch` | Watch and recompile TypeScript sources |
| `pnpm format` | Format project files with Prettier |
| `pnpm format:check` | Check formatting without applying changes |
| `pnpm lint:fix` | Run ESLint with automatic fixes |
| `pnpm test` | Build the project and run the configured Mocha test suite |
| `pnpm test:redis` | Build the project and run the Redis-specific test file |

The test scripts compile the project before executing tests. Tests that depend on external services may also require the corresponding services to be available.

## Engineering Considerations

A project involving asynchronous events, persistent storage, caching, and external services presents several useful areas for continued engineering work.

### Reliability

- Define predictable startup and shutdown behavior.
- Handle connection failures and reconnection scenarios.
- Avoid race conditions during initialization.
- Make background task failures observable.

### Type Safety

- Prefer explicit types for application boundaries.
- Avoid unnecessary escape hatches such as `any`.
- Keep shared interfaces consistent across the Discord client, API, and subsystem implementations.

### API Security

- Apply authentication and authorization where required.
- Validate incoming request parameters and payloads.
- Limit access to state-changing operations.
- Review network exposure and cross-origin policies independently.

### Testing

- Add unit tests for isolated application logic.
- Test failure paths as well as successful execution.
- Cover interactions with persistence and caching.
- Verify API behavior, validation, and authorization.

These areas are part of the ongoing engineering considerations for the project. Their inclusion here should not be interpreted as a claim that every item has already been fully implemented or verified.

## Future Improvements

Potential areas for further development include:

- Strengthening API authentication and authorization.
- Improving startup sequencing and graceful shutdown.
- Expanding test coverage for critical application paths.
- Improving type safety across subsystem boundaries.
- Adding more explicit validation and error-handling conventions.
- Documenting architectural decisions and operational behavior.
- Integrating automated checks into a continuous integration workflow.

The goal is not simply to add more features, but to improve the clarity, reliability, and maintainability of the existing system.

## Project Scope

Paper is a personal development project and an ongoing engineering exercise.

This repository documents the project's architecture, implementation choices, and technical direction. It is not intended to serve as a hosted service or a promise of support for independent deployments.

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE) for details.
