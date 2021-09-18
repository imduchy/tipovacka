"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mapFixtureEvents(fixtureEvents) {
    return fixtureEvents.map((event) => ({
        type: event.type,
        detail: event.detail,
        teamId: event.team.id,
        teamName: event.team.name,
        playerId: event.player.id,
        playerName: event.player.name,
        assistPlayerId: event.assist.id,
        assistPlayerName: event.assist.name,
        time: event.time.extra ? event.time.elapsed + event.time.extra : event.time.elapsed,
    }));
}
exports.mapFixtureEvents = mapFixtureEvents;
