const WebSocket = require('ws');
const { createEvent, generateMatchEvents } = require('./events');

const PORT = 4001;
const MATCH_COUNT = 15; // Simulate 15 live matches
const matches = {};

// Create matches
for (let i = 1; i <= MATCH_COUNT; i++) {
    const matchId = `match_${String(i).padStart(3, '0')}`;
    matches[matchId] = {
        id: matchId,
        events: generateMatchEvents(matchId),
        currentIndex: 0,
        isLive: true,
    };
}

const wss = new WebSocket.Server({ port: PORT });

console.log(`Mock StatsPerform server running on ws://localhost:${PORT}`);
console.log(`Simulating ${MATCH_COUNT} live matches...\n`);

wss.on('connection', (ws) => {
    console.log('Backend connected to Mock StatsPerform');

    // Send events over time for all matches
    const interval = setInterval(() => {
        Object.values(matches).forEach((match) => {
            if (!match.isLive) return;

            if (match.currentIndex < match.events.length) {
                const event = match.events[match.currentIndex];
                match.currentIndex++;

                // Send the event
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(event));
                    console.log(`[${event.matchId}] ${event.type} - min ${event.minute}`);
                }

                // Stop the match after Full Time
                if (event.type === 'FULL_TIME') {
                    match.isLive = false;
                }
            }
        });
    }, 4000); // Emit roughly every 4 seconds

    ws.on('close', () => {
        console.log('Backend disconnected');
        clearInterval(interval);
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err.message);
    });
});

// Keep the process alive
process.on('SIGINT', () => {
    console.log('\nShutting down Mock StatsPerform server...');
    wss.close();
    process.exit(0);
});