const WebSocket = require('ws');
const { createEvent, generateMatchEvents } = require('./events');

const PORT = 4001;
const MATCH_COUNT = 15;
const matches = {};

// Create matches
for (let i = 1; i <= MATCH_COUNT; i++) {
    const matchId = `match_${String(i).padStart(3, '0')}`;
    matches[matchId] = {
        id: matchId,
        events: generateMatchEvents(matchId, 12),
        currentIndex: 0,
        isLive: true,
    };
}

const wss = new WebSocket.Server({ port: PORT });

console.log(`Mock StatsPerform server running on ws://localhost:${PORT}`);
console.log(`Simulating ${MATCH_COUNT} live matches...\n`);

wss.on('connection', (ws) => {
    console.log('Backend connected to Mock StatsPerform');

    const interval = setInterval(() => {
        Object.values(matches).forEach((match) => {
            if (!match.isLive) return;

            // === BURST MODE (occasional derby moment) ===
            const isBurst = Math.random() < 0.08; // ~8% chance
            const eventsToSend = isBurst ? 4 + Math.floor(Math.random() * 4) : 1;

            for (let i = 0; i < eventsToSend; i++) {
                if (match.currentIndex >= match.events.length) {
                    match.isLive = false;
                    break;
                }

                let event = match.events[match.currentIndex];
                match.currentIndex++;

                // === OUT-OF-ORDER EVENTS (occasionally) ===
                if (Math.random() < 0.12 && match.currentIndex < match.events.length) {
                    // Swap with next event
                    const nextEvent = match.events[match.currentIndex];
                    match.events[match.currentIndex] = event;
                    event = nextEvent;
                    match.currentIndex++;
                    console.log(`[${match.id}] (out-of-order) ${event.type}`);
                }

                // === MALFORMED EVENTS (occasionally) ===
                if (Math.random() < 0.07) {
                    const malformed = {
                        // Missing fields / wrong types on purpose
                        eventId: null,
                        matchId: match.id,
                        type: 'UNKNOWN_EVENT_TYPE',
                        garbage: '###invalid###',
                        minute: 'not-a-number',
                    };
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify(malformed));
                        console.log(`[${match.id}] (malformed event sent)`);
                    }
                    continue;
                }

                // Normal event
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(event));
                    console.log(`[${match.id}] ${event.type} - min ${event.minute}${isBurst ? ' (BURST)' : ''}`);
                }

                if (event.type === 'FULL_TIME') {
                    match.isLive = false;
                }
            }
        });
    }, 3500);

    ws.on('close', () => {
        console.log('Backend disconnected');
        clearInterval(interval);
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err.message);
    });
});

process.on('SIGINT', () => {
    console.log('\nShutting down Mock StatsPerform server...');
    wss.close();
    process.exit(0);
});