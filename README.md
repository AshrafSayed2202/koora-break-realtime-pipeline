# Koora Break – Real-Time Match Event Pipeline

A real-time football event pipeline simulating:

```text
StatsPerform (Mock) → Koora Break Backend → Clients
```

The system simulates **15 concurrent matches**, processes live events, maintains match state, and broadcasts updates only to clients watching the relevant match.

## Tech Stack

| Layer              | Technology               |
| ------------------ | ------------------------ |
| Runtime            | Node.js                  |
| Backend            | NestJS + TypeScript      |
| Real-time          | Socket.IO                |
| Mock StatsPerform  | `ws`                     |
| Internal Events    | `@nestjs/event-emitter`  |
| Frontend           | Vanilla HTML + Socket.IO |
| Process Management | `concurrently`           |

## Architecture

```text
Mock StatsPerform
       │ WebSocket
       ▼
NestJS Backend
       │
       ├── StatsPerform Service
       ├── Match Events Service
       └── Socket.IO Gateway
              │
              ▼
          Clients
```

Each match has its own Socket.IO room:

```text
match_001
match_002
...
match_015
```

Clients only receive events for matches they are subscribed to.

## Project Structure

```text
koora-break-realtime-pipeline/
├── mock-statsperform/
│   ├── server.js
│   └── events.js
├── koora-backend/
│   └── src/
│       ├── match-events/
│       └── stats-perform/
├── client/
│   └── index.html
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

* Node.js 18+
* npm

### Install

```bash
npm run install:all
```

### Start

```bash
npm start
```

Starts:

* Mock StatsPerform: `ws://localhost:4001`
* NestJS Backend: `http://localhost:3000`

### Open Client

```bash
npm run open
```

Or open `client/index.html` directly in a browser.

Multiple browser tabs can be used to simulate multiple users.

## Features

* Real-time events for 15 matches
* Match-specific Socket.IO rooms
* Subscribe / unsubscribe from matches
* Real-time score updates
* In-memory match state and event history
* Late joiner support
* Defensive event parsing

## Stretch Goals

| Feature             | Status |
| ------------------- | :----: |
| Late Joiner         |    ✅   |
| Out-of-order Events |    ✅   |
| Malformed Events    |    ✅   |
| Burst Mode          |    ✅   |

### Late Joiner

A client joining an active match immediately receives its current score and previous events.

### Out-of-order Events

The mock provider occasionally sends events out of sequence. The backend continues processing normally.

### Malformed Events

Invalid events are logged and discarded without crashing the pipeline.

### Burst Mode

Multiple events can be generated for the same match within a very short period.

## Architecture Decisions

**Socket.IO Rooms**
Provide efficient match-specific broadcasting.

**In-Memory State**
Keeps the implementation simple and makes late-joiner support fast.

**Event-Driven Communication**
`StatsPerformService` emits events internally, while `MatchEventsService` handles state updates and broadcasting.

**Defensive Parsing**
External events are validated before processing to prevent malformed data from affecting the backend.

## Trade-offs

For simplicity, this implementation does not use:

* Database / Redis
* Authentication
* Horizontal scaling

These would be appropriate additions for a production environment.

## Available Scripts

| Command               | Description                 |
| --------------------- | --------------------------- |
| `npm run install:all` | Install all dependencies    |
| `npm start`           | Start mock server + backend |
| `npm run open`        | Open the client             |
