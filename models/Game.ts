interface Game {
  date: Date
  homeTeamScore: number
  awayTeamScore: number
  status: GameStatus
  competition: String
  season: Season
  venue: String
}

enum Season {
  S2020 = '2020',
  S2021 = '2021',
}

/**
 * List of available fixture statuses from the api-footbal API.
 * https://www.api-football.com/documentation-beta#operation/get-fixtures
 */
enum GameStatus {
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
