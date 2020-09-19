/**
 * List of available fixture statuses from the api-footbal API.
 * https://www.api-football.com/documentation-beta#operation/get-fixtures
 */
export enum GameStatus {
  TBD = 'Time To Be Defined',
  NS = 'Not Started',
  FirstHalf = 'First Half, Kick Off',
  HT = 'Halftime',
  SecondHalf = 'Second Half, 2nd Half Started',
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
