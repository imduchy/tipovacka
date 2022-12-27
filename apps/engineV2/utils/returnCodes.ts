export enum ReturnCodes {
  GAME_NOT_FINISHED = 'GAME_NOT_FINISHED',
  GAME_POSTPONED = 'GAME_POSTPONED',
  GAME_FINISHED = 'GAME_FINISHED',
  NO_UPCOMING_GAME = 'NO_UPCOMING_GAME',
  BETS_EVALUATED = 'BETS_EVALUATED',
}

export interface ReturnObject {
  code: ReturnCodes;
  data: any;
}
