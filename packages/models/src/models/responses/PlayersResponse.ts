// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace PlayersResponse {
  export interface Parameters {
    id?: string;
    season?: string;
    league?: string;
    team?: string;
    search?: string;
    page?: number;
  }

  export interface Paging {
    current: number;
    total: number;
  }

  export interface Birth {
    date: string;
    place: string;
    country: string;
  }

  export interface Player {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    birth: Birth;
    nationality: string;
    height: string;
    weight: string;
    injured: boolean;
    photo: string;
  }

  export interface Team {
    id: number;
    name: string;
    logo: string;
  }

  export interface League {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  }

  export interface Games {
    appearences: number;
    lineups: number;
    minutes: number;
    number?: number;
    position: string;
    rating: string;
    captain: boolean;
  }

  export interface Substitutes {
    in: number;
    out: number;
    bench: number;
  }

  export interface Shots {
    total: number;
    on: number;
  }

  export interface Goals {
    total: number;
    conceded?: number;
    assists: number;
    saves: number;
  }

  export interface Passes {
    total: number;
    key: number;
    accuracy: number;
  }

  export interface Tackles {
    total: number;
    blocks: number;
    interceptions: number;
  }

  export interface Duels {
    total?: number;
    won?: number;
  }

  export interface Dribbles {
    attempts: number;
    success: number;
    past?: number;
  }

  export interface Fouls {
    drawn: number;
    committed: number;
  }

  export interface Cards {
    yellow: number;
    yellowred: number;
    red: number;
  }

  export interface Penalty {
    won: number;
    commited?: number;
    scored: number;
    missed: number;
    saved?: number;
  }

  export interface Statistic {
    team: Team;
    league: League;
    games: Games;
    substitutes: Substitutes;
    shots: Shots;
    goals: Goals;
    passes: Passes;
    tackles: Tackles;
    duels: Duels;
    dribbles: Dribbles;
    fouls: Fouls;
    cards: Cards;
    penalty: Penalty;
  }

  export interface Response {
    player: Player;
    statistics: Statistic[];
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
