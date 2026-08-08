# Koora Break – Real-Time Match Event Pipeline

A technical engineering task for **Koora Break** demonstrating a complete real-time football match event pipeline.

The project simulates how live football data flows from a StatsPerform-like provider through the backend and finally to connected clients:

```text
StatsPerform (Mock)
        │
        │ WebSocket
        ▼
Koora Break Backend
        │
        │ Socket.IO
        ▼
   Connected Clients
```

---

## 📋 Overview

On a typical match night, **10–20 football matches** may run simultaneously.

A live data provider such as StatsPerform continuously streams events including:

* ⚽ Goals
* 🟨 Yellow cards
* 🟥 Red cards
* 🔄 Substitutions
* 🏁 Match events
* 📊 Score updates

The backend must:

1. Receive events in real time.
2. Validate and process incoming data.
3. Maintain the current state of each match.
4. Keep the complete event history.
5. Broadcast events only to clients watching that specific match.
6. Support clients joining a match after it has already started.

This repository implements the complete end-to-end pipeline using dummy data.

---

# 🏗️ Architecture

```text
┌──────────────────────────────┐
│     Mock StatsPerform        │
│                              │
│  15 simulated football       │
│  matches generating events   │
└──────────────┬───────────────┘
               │
               │ WebSocket (ws)
               ▼
┌──────────────────────────────┐
│      Koora Break Backend     │
│          NestJS              │
│                              │
│ ┌──────────────────────────┐ │
│ │ StatsPerform Service     │ │
│ │                          │ │
│ │ - Connect to provider    │ │
│ │ - Parse events           │ │
│ │ - Validate events        │ │
│ └────────────┬─────────────┘ │
│              │               │
│              ▼               │
│ ┌──────────────────────────┐ │
│ │ Match Events Service     │ │
│ │                          │ │
│ │ - Match state            │ │
│ │ - Event history          │ │
│ │ - Score updates          │ │
│ └────────────┬─────────────┘ │
│              │               │
│              ▼               │
│ ┌──────────────────────────┐ │
│ │ Socket.IO Gateway        │ │
│ │                          │ │
│ │ Match-based rooms        │ │
│ └────────────┬─────────────┘ │
└──────────────┼───────────────┘
               │
               │ Socket.IO
               ▼
      ┌───────────────────┐
      │      Clients      │
      │                   │
      │ Client A → Match 1│
      │ Client B → Match 2│
      │ Client C → Match 1│
      └───────────────────┘
```

---

# 🛠️ Tech Stack

| Layer                  | Technology                          | Why?                                                          |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------- |
| Runtime                | **Node.js**                         | Excellent for I/O-heavy real-time workloads                   |
| Backend                | **NestJS + TypeScript**             | Strong structure, dependency injection, and WebSocket support |
| Real-time Protocol     | **Socket.IO**                       | Rooms, reconnection, fallbacks, and excellent browser support |
| Mock StatsPerform      | **Native `ws`**                     | Lightweight and sufficient for a mock provider                |
| Internal Communication | **`@nestjs/event-emitter`**         | Clean internal pub/sub between services                       |
| Frontend               | **Vanilla HTML + Socket.IO Client** | Simple, no build step, and ideal for multiple sessions        |
| Process Management     | **concurrently**                    | Allows mock server and backend to run with one command        |

## Alternatives Considered

### `ws` instead of Socket.IO

A pure WebSocket implementation was considered for the backend.

It was rejected because Socket.IO rooms provide a clean and efficient mechanism for broadcasting events to clients watching a specific match.

### Redis / Message Broker

Redis or another message broker would be useful for a distributed production architecture.

It was intentionally not used here because:

* The task is a single-process simulation.
* In-memory state is sufficient.
* Adding Redis would increase complexity without providing meaningful value for this scope.

### React / Vue

A frontend framework was considered unnecessary.

The goal of the project is to demonstrate the **real-time event pipeline**, rather than build a production frontend.

---

# 📁 Project Structure

```text
koora-break-realtime-pipeline/
│
├── mock-statsperform/
│   ├── server.js
│   └── events.js
│
├── koora-backend/
│   └── src/
│       ├── match-events/
│       └── stats-perform/
│
├── client/
│   └── index.html
│
├── package.json
└── README.md
```

### `mock-statsperform/`

Simulates the external StatsPerform provider.

It generates events for **15 concurrent matches** and intentionally introduces:

* Out-of-order events
* Malformed events
* Event bursts

### `koora-backend/`

The main NestJS backend.

Responsible for:

* Connecting to the mock StatsPerform server
* Validating incoming events
* Maintaining match state
* Maintaining event history
* Broadcasting events to the appropriate Socket.IO room

### `client/`

A simple browser client used to simulate multiple users watching different matches.

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js **18+**
* npm

You can verify your versions with:

```bash
node --version
npm --version
```

---

## 1. Install Dependencies

From the project root:

```bash
npm run install:all
```

This installs dependencies for both:

* Mock StatsPerform server
* NestJS backend

---

## 2. Start the Pipeline

Run:

```bash
npm start
```

This starts both services:

```text
Mock StatsPerform
ws://localhost:4001

        ↓

NestJS Backend
http://localhost:3000
```

The mock server will continuously generate events for the simulated matches.

---

## 3. Open the Client

Run:

```bash
npm run open
```

Alternatively, open:

```text
client/index.html
```

directly in your browser.

You can open multiple browser tabs to simulate multiple users watching different matches simultaneously.

---

# ⚽ Core Features

### Real-Time Event Streaming

The mock StatsPerform server continuously generates live football events for **15 matches**.

### Match-Based Broadcasting

Each match has its own Socket.IO room:

```text
match_001
match_002
match_003
...
match_015
```

A client watching `match_001` only receives events for `match_001`.

### Match Subscription

Clients can:

* Subscribe to a match
* Unsubscribe from a match
* Switch between matches

### Real-Time Score Updates

Goal events immediately update the corresponding match score and are broadcast to subscribed clients.

### Multiple Concurrent Matches

The system simulates 15 matches running simultaneously, representing a typical multi-match environment.

---

# 🎯 Stretch Goals

All requested stretch goals have been implemented.

| Feature                 | Description                                                                           | Status |
| ----------------------- | ------------------------------------------------------------------------------------- | :----: |
| **Late Joiner**         | A client joining mid-match immediately receives the current score and previous events | ✅ Done |
| **Out-of-order Events** | Events may arrive out of sequence without breaking the pipeline                       | ✅ Done |
| **Malformed Events**    | Invalid/garbage events are safely ignored                                             | ✅ Done |
| **Burst Mode**          | Multiple events can arrive for the same match within a very short period              | ✅ Done |

---

# 🧪 Testing the Stretch Goals

## 1. Late Joiner

Start the application and wait until a match has already produced several events.

Then open a new client or subscribe to an existing match.

The client should immediately receive:

* Current score
* Previous match events
* New events as they arrive

This demonstrates that match state and event history are maintained in memory.

---

## 2. Out-of-Order Events

The mock StatsPerform server occasionally sends events out of sequence.

Check the mock server logs for messages indicating out-of-order events.

The backend should continue processing events without crashing.

---

## 3. Malformed Events

The mock server periodically sends invalid data.

For example:

```text
(malformed event sent)
```

The backend should:

1. Attempt to parse the message.
2. Detect that it is invalid.
3. Log the error.
4. Ignore the event.
5. Continue processing subsequent events.

A malformed event must never bring down the pipeline.

---

## 4. Burst Mode

Occasionally the mock server generates multiple events for the same match in a very short period.

The terminal will indicate burst activity with messages such as:

```text
(BURST)
```

The backend should process all valid events and broadcast them to the correct match room.

---

# 🧠 Architecture Decisions

## 1. Socket.IO Rooms

Each match gets its own Socket.IO room:

```text
match_001
match_002
...
match_015
```

When a client subscribes to a match, it joins the corresponding room.

For example:

```text
Client A
   │
   └── join(match_001)

Client B
   │
   └── join(match_002)

Client C
   │
   └── join(match_001)
```

When an event occurs for `match_001`, only Client A and Client C receive it.

This prevents unnecessary data from being sent to unrelated clients.

---

## 2. In-Memory Match State

The backend maintains the current state of every match in memory.

For each match, the backend stores:

```text
Match State
├── Current Score
├── Match Information
└── Event History
```

This makes the **Late Joiner** feature simple and fast.

A newly connected client can receive the current state and previously processed events immediately.

---

## 3. Event-Driven Internal Communication

The backend uses `@nestjs/event-emitter` to keep the StatsPerform integration separate from match processing.

The flow is:

```text
StatsPerform Service
        │
        │ valid event
        ▼
match.event
        │
        ▼
Match Events Service
        │
        ├── Update match state
        ├── Store event
        └── Broadcast event
```

This keeps the system loosely coupled and makes individual components easier to test and maintain.

---

## 4. Defensive Parsing

All incoming messages from the mock StatsPerform server are treated as untrusted input.

Messages are parsed inside error handling logic.

```text
Incoming Message
       │
       ▼
    Parse
       │
   ┌───┴───┐
   │       │
 Valid   Invalid
   │       │
   ▼       ▼
Process   Ignore
   │
   ▼
Broadcast
```

Malformed events are logged and discarded without interrupting the pipeline.

---

# ⚖️ Trade-offs

## No Database / Redis

Match state and event history are stored in memory.

### Advantages

* Simple
* Fast
* Easy to implement
* No external dependencies

### Disadvantages

* State is lost when the backend restarts.
* Not suitable for horizontal scaling.
* Multiple backend instances would not share state.

This is acceptable for the scope of this technical task.

---

## No Authentication

Any connected client can subscribe to any match.

This is intentional because authentication and authorization are outside the scope of the simulation.

A production system would typically introduce authentication and potentially authorization rules.

---

## Simple Frontend

The client uses plain HTML and JavaScript instead of React, Vue, or React Native.

This keeps the demonstration lightweight and focused on the real-time backend pipeline.

---

## Fixed Number of Matches

The mock server currently simulates **15 matches**.

The architecture does not fundamentally depend on this number and can be extended to support more matches.

---

# 📜 Available Scripts

| Command               | Description                                 |
| --------------------- | ------------------------------------------- |
| `npm run install:all` | Install dependencies for all projects       |
| `npm start`           | Start Mock StatsPerform + NestJS Backend    |
| `npm run open`        | Open the client page in the default browser |

---

# 🔄 Complete Data Flow

A typical goal event follows this path:

```text
1. Mock StatsPerform
        │
        │ Goal event
        ▼
2. WebSocket
        │
        ▼
3. StatsPerformService
        │
        │ Validate / Parse
        ▼
4. Event Emitter
        │
        │ match.event
        ▼
5. MatchEventsService
        │
        ├── Update score
        ├── Store event
        └── Update history
        │
        ▼
6. Socket.IO Gateway
        │
        │ Emit to match_001
        ▼
7. Connected Clients
```

Only clients subscribed to the affected match receive the event.

---

# 📈 Production Considerations

If this simulation were extended into a production system, several components could be added:

* Redis for shared match state
* Redis Pub/Sub or a message broker for multi-instance broadcasting
* PostgreSQL or another database for persistent match history
* Authentication and authorization
* Event deduplication
* Event sequence numbers
* Provider reconnection handling
* Retry mechanisms
* Distributed tracing
* Metrics and monitoring
* Rate limiting
* Horizontal scaling
* Health checks
* Structured logging

The current architecture intentionally avoids these additions to keep the technical task focused on the core real-time pipeline.

---

# ✅ Summary

This project demonstrates a complete real-time football event pipeline:

```text
┌────────────────────┐
│ Mock StatsPerform  │
└─────────┬──────────┘
          │ WebSocket
          ▼
┌────────────────────┐
│   NestJS Backend   │
│                    │
│ • Event validation │
│ • Match state      │
│ • Event history    │
│ • Event processing │
└─────────┬──────────┘
          │ Socket.IO
          ▼
┌────────────────────┐
│      Clients       │
│                    │
│ Match-specific     │
│ real-time updates  │
└────────────────────┘
```

The implementation covers the core requirements as well as the requested stretch goals:

* ✅ Real-time event processing
* ✅ Match-specific broadcasting
* ✅ Multiple concurrent matches
* ✅ Client subscription/unsubscription
* ✅ Real-time score updates
* ✅ Late joiners
* ✅ Out-of-order events
* ✅ Malformed events
* ✅ Burst events
* ✅ Defensive error handling
* ✅ Clean event-driven architecture
