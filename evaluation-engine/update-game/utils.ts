import { FixtureResponse, GameStatus } from '@duchynko/tipovacka-models';

export function hasBeenCancelled(fixture: FixtureResponse.Fixture): boolean {
  return fixture.status.long === GameStatus.CANC;
}

export function hasBeenPostponed(fixture: FixtureResponse.Fixture): boolean {
  return fixture.status.long === GameStatus.PST;
}

export function hasFinished(fixture: FixtureResponse.Fixture): boolean {
  return fixture.status.long === GameStatus.FT || fixture.status.long === GameStatus.PEN;
}
