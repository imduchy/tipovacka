/* eslint camelcase: "off" */

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace TeamStatisticsResponse {
  export interface Parameters {
    team: string;
    season: string;
    league: string;
  }

  export interface Paging {
    current: number;
    total: number;
  }

  export interface League {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  }

  export interface Team {
    id: number;
    name: string;
    logo: string;
  }

  export interface Played {
    home: number;
    away: number;
    total: number;
  }

  export interface Wins {
    home: number;
    away: number;
    total: number;
  }

  export interface Draws {
    home: number;
    away: number;
    total: number;
  }

  export interface Loses {
    home: number;
    away: number;
    total: number;
  }

  export interface Fixtures {
    played: Played;
    wins: Wins;
    draws: Draws;
    loses: Loses;
  }

  export interface Total {
    home: number;
    away: number;
    total: number;
  }

  export interface Average {
    home: string;
    away: string;
    total: string;
  }

  export interface For {
    total: Total;
    average: Average;
  }

  export interface Total2 {
    home: number;
    away: number;
    total: number;
  }

  export interface Average2 {
    home: string;
    away: string;
    total: string;
  }

  export interface Against {
    total: Total2;
    average: Average2;
  }

  export interface Goals {
    for: For;
    against: Against;
  }

  export interface Streak {
    wins: number;
    draws: number;
    loses: number;
  }

  export interface Wins2 {
    home: string;
    away: string;
  }

  export interface Loses2 {
    home: string;
    away: string;
  }

  export interface For2 {
    home: number;
    away: number;
  }

  export interface Against2 {
    home: number;
    away: number;
  }

  export interface Goals2 {
    for: For2;
    against: Against2;
  }

  export interface Biggest {
    streak: Streak;
    wins: Wins2;
    loses: Loses2;
    goals: Goals2;
  }

  export interface CleanSheet {
    home: number;
    away: number;
    total: number;
  }

  export interface FailedToScore {
    home: number;
    away: number;
    total: number;
  }

  export interface Response {
    league: League;
    team: Team;
    form: string;
    fixtures: Fixtures;
    goals: Goals;
    biggest: Biggest;
    clean_sheet: CleanSheet;
    failed_to_score: FailedToScore;
  }

  export interface RootObject {
    get: string;
    parameters: Parameters;
    errors: unknown[];
    results: number;
    paging: Paging;
    response: Response;
  }
}
