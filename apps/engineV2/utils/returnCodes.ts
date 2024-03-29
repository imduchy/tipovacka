export enum ReturnCodes {
  GAME_NOT_FINISHED = 'GAME_NOT_FINISHED',
  GAME_POSTPONED = 'GAME_POSTPONED',
  GAME_FINISHED = 'GAME_FINISHED',
  NO_UPCOMING_GAME = 'NO_UPCOMING_GAME',
  BETS_EVALUATED = 'BETS_EVALUATED',
  COMPETITION_UPDATED = 'COMPETITION_UPDATED',
  NO_UPCOMING_GAME_FOUND = 'NO_UPCOMING_GAME_FOUND',
  UPCOMING_GAME_UPDATED = 'UPCOMING_GAME_UPDATED',
  UPCOMING_GAME_ALREADY_UPDATED = 'UPCOMING_GAME_ALREADY_UPDATED',
  GROUPS_FETCHED = 'GROUPS_FETCHED',
}

export interface ReturnObject {
  code: ReturnCodes;
  data: any;
}
