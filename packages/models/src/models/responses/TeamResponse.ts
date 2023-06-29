// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace TeamResponse {
  export interface Parameters {
    id?: string;
    league?: string;
    season?: string;
  }

  export interface Paging {
    current: number;
    total: number;
  }

  export interface Team {
    id: number;
    name: string;
    country: string;
    founded: number;
    national: boolean;
    logo: string;
  }

  export interface Venue {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  }

  export interface Response {
    team: Team;
    venue: Venue;
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
