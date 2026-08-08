const { v4: uuidv4 } = require('uuid');

const EVENT_TYPES = [
    'GOAL',
    'YELLOW_CARD',
    'RED_CARD',
    'SUBSTITUTION',
];

const PLAYERS = {
    home: [
        'Mohammed Al-Dawsari',
        'Salem Al-Dawsari',
        'Abdullah Al-Hamdan',
        'Nawaf Al-Abed',
        'Ali Al-Bulaihi',
    ],
    away: [
        'Cristiano Ronaldo',
        'Karim Benzema',
        'Sadio Mane',
        'NGolo Kante',
        'Kalidou Koulibaly',
    ],
};

function getRandomPlayer(team) {
    const list = PLAYERS[team] || PLAYERS.home;
    return list[Math.floor(Math.random() * list.length)];
}

function createEvent(matchId, overrides = {}) {
    const type = overrides.type || EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const team = overrides.team || (Math.random() > 0.5 ? 'home' : 'away');

    return {
        eventId: uuidv4(),
        matchId,
        type,
        team: type === 'FULL_TIME' || type === 'KICK_OFF' ? null : team,
        minute: overrides.minute ?? 1,
        player: type === 'FULL_TIME' || type === 'KICK_OFF' ? null : (overrides.player || getRandomPlayer(team)),
        timestamp: overrides.timestamp || new Date().toISOString(),
    };
}

/**
 * Generate a realistic chronological sequence of events for a match
 */
function generateMatchEvents(matchId, eventCount = 10) {
    const events = [];

    // 1. Kick Off
    events.push(
        createEvent(matchId, {
            type: 'KICK_OFF',
            minute: 1,
        })
    );

    // 2. Generate events with increasing minutes
    let currentMinute = 2;

    for (let i = 0; i < eventCount; i++) {
        // Jump forward a few minutes each time
        currentMinute += Math.floor(Math.random() * 8) + 2; // +2 to +9 minutes

        if (currentMinute >= 90) break;

        events.push(
            createEvent(matchId, {
                minute: currentMinute,
            })
        );
    }

    // 3. Full Time at 90
    events.push(
        createEvent(matchId, {
            type: 'FULL_TIME',
            minute: 90,
        })
    );

    return events;
}

module.exports = {
    createEvent,
    generateMatchEvents,
    EVENT_TYPES,
};