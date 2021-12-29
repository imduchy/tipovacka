/**
 * List of available fixture statuses from the api-footbal API.
 * https://www.api-football.com/documentation-beta#operation/get-fixtures
 */
export enum GameStatus {
  TBD = 'Time To Be Defined',
  NS = 'Not Started',
  '1H' = 'First Half, Kick Off',
  HT = 'Halftime',
  '2H' = 'Second Half, 2nd Half Started',
  ET = 'Extra Time',
  P = 'Penalty In Progress',
  FT = 'Match Finished',
  AET = 'Match Finished After Extra Time',
  PEN = 'Match Finished After Penalty',
  BT = 'Break Time (in Extra Time)',
  SUSP = 'Match Suspended',
  INT = 'Match Interrupted',
  PST = 'Match Postponed',
  CANC = 'Match Cancelled',
  ABD = 'Match Abandoned',
  AWD = 'Technical Loss',
  WO = 'WalkOver',
}

export enum FixtureEventType {
  GOAL = 'Goal',
  CARD = 'Card',
  SUBSTITUTION = 'subst',
}

export enum FixtureEventDetail {
  NORMAL_GOAL = 'Normal Goal',
  OWN_GOAL = 'Own Goal',
  PENALTY = 'Penalty',
  MISSED_PENALTY = 'Missed Penalty',
  YELLOW_CARD = 'Yellow Card',
  SECOND_YELLOW_CARD = 'Second Yellow card',
  RED_CARD = 'Red card',
  SUBSTITUTION_1 = 'Substitution 1',
  SUBSTITUTION_2 = 'Substitution 2',
  SUBSTITUTION_3 = 'Substitution 3',
  SUBSTITUTION_4 = 'Substitution 4',
  SUBSTITUTION_5 = 'Substitution 5',
  SUBSTITUTION_6 = 'Substitution 6',
  SUBSTITUTION_7 = 'Substitution 7',
  SUBSTITUTION_8 = 'Substitution 8',
  SUBSTITUTION_9 = 'Substitution 9',
  SUBSTITUTION_10 = 'Substitution 10',
}
