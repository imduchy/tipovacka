import { FixtureEventDetail, FixtureEventType } from '../Enums';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace FixtureEventsResponse {
  export interface Parameters {
    fixture: string;
    team?: string;
    player?: string;
    type?: string;
  }

  export interface Paging {
    current: number;
    total: number;
  }

  export interface Time {
    elapsed: number;
    extra?: number;
  }

  export interface Team {
    id: number;
    name: string;
    logo: string;
  }

  export interface Player {
    id: number;
    name: string;
  }

  export interface Assist {
    id?: number;
    name: string;
  }

  export interface Response {
    time: Time;
    team: Team;
    player: Player;
    assist: Assist;
    type: FixtureEventType;
    detail: FixtureEventDetail;
    comments?: unknown;
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
