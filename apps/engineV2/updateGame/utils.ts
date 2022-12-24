import { FixtureEventsResponse, FixtureResponse, GameStatus, IGameEvent } from '@tipovacka/models';

export function hasBeenCancelled(fixture: FixtureResponse.Fixture): boolean {
  return fixture.status.long === GameStatus.CANC;
}

export function hasBeenPostponed(fixture: FixtureResponse.Fixture): boolean {
  return fixture.status.long === GameStatus.PST;
}

export function hasFinished(fixture: FixtureResponse.Fixture): boolean {
  return fixture.status.long === GameStatus.FT || fixture.status.long === GameStatus.PEN;
}

export function mapFixtureEvents(fixtureEvents: FixtureEventsResponse.Response[]): IGameEvent[] {
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
