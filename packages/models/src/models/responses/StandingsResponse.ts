// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace StandingsResponse {
  export interface Parameters {
    league: string;
    season: string;
  }

  export interface Paging {
    current: number;
    total: number;
  }

  export interface Team {
    id: number;
    name: string;
    logo: string;
  }

  export interface Goals {
    for: number;
    against: number;
  }

  export interface All {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: Goals;
  }

  export interface Goals2 {
    for: number;
    against: number;
  }

  export interface Home {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: Goals2;
  }

  export interface Goals3 {
    for: number;
    against: number;
  }

  export interface Away {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: Goals3;
  }

  export interface Standing {
    rank: number;
    team: Team;
    points: number;
    goalsDiff: number;
    group: string;
    form: string;
    status: string;
    description: string;
    all: All;
    home: Home;
    away: Away;
    update: Date;
  }

  export interface League {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    standings: Array<Standing[]>;
  }

  export interface Response {
    league: League;
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
