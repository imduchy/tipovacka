import { GameStatus } from '../Enums';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace FixtureResponse {
  export interface Parameters {
    team?: string;
    next?: number;
    season?: string;
    league?: string;
  }

  export interface Paging {
    current: number;
    total: number;
  }

  export interface Periods {
    first?: number;
    second?: number;
  }

  export interface Venue {
    id: number;
    name: string;
    city: string;
  }

  export interface Status {
    long: string;
    short: keyof typeof GameStatus;
    elapsed?: number;
  }

  export interface Fixture {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    periods: Periods;
    venue: Venue;
    status: Status;
  }

  export interface League {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  }

  export interface Home {
    id: number;
    name: string;
    logo: string;
    winner?: boolean;
  }

  export interface Away {
    id: number;
    name: string;
    logo: string;
    winner?: boolean;
  }

  export interface Teams {
    home: Home;
    away: Away;
  }

  export interface Goals {
    home?: number;
    away?: number;
  }

  export interface Halftime {
    home?: number;
    away?: number;
  }

  export interface Fulltime {
    home?: number;
    away?: number;
  }

  export interface Extratime {
    home?: number;
    away?: number;
  }

  export interface Penalty {
    home?: number;
    away?: number;
  }

  export interface Score {
    halftime: Halftime;
    fulltime: Fulltime;
    extratime: Extratime;
    penalty: Penalty;
  }

  export interface Response {
    fixture: Fixture;
    league: League;
    teams: Teams;
    goals: Goals;
    score: Score;
  }

  export interface RootObject {
    get: string;
    parameters: Parameters;
    errors: unknown[];
    results: number;
    paging: Paging;
    response: Response[];
  }
}
