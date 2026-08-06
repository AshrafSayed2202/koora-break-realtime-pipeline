const { v4: uuidv4 } = require('uuid');

const EVENT_TYPES = [
    'GOAL',
    'YELLOW_CARD',
    'RED_CARD',
    'SUBSTITUTION',
    'KICK_OFF',
    'FULL_TIME',
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
        team,
        minute: overrides.minute ?? Math.floor(Math.random() * 90) + 1,
        player: overrides.player || getRandomPlayer(team),
        timestamp: overrides.timestamp || new Date().toISOString(),
        ...overrides,
    };
}

// Generate a realistic sequence of events for a match
function generateMatchEvents(matchId, count = 12) {
    const events = [];

    // Always start with Kick Off
    events.push(
        createEvent(matchId, {
            type: 'KICK_OFF',
            minute: 1,
            team: 'home',
            player: null,
        })
    );

    for (let i = 0; i < count - 2; i++) {
        events.push(createEvent(matchId));
    }

    // Always end with Full Time
    events.push(
        createEvent(matchId, {
            type: 'FULL_TIME',
            minute: 90,
            team: null,
            player: null,
        })
    );

    return events;
}

module.exports = {
    createEvent,
    generateMatchEvents,
    EVENT_TYPES,
};