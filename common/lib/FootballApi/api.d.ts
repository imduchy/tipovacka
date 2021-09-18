import { FixtureEventsResponse, FixtureResponse, PlayersResponse, StandingsResponse } from '@duchynko/tipovacka-models';
import { AxiosResponse } from 'axios';
export declare function getFixture(params: unknown): Promise<AxiosResponse<FixtureResponse.RootObject>>;
export declare function getEvents(params: unknown): Promise<AxiosResponse<FixtureEventsResponse.RootObject>>;
export declare function getPlayers(params: PlayersResponse.Parameters): Promise<AxiosResponse<PlayersResponse.RootObject>>;
export declare function getStandings(params: unknown): Promise<AxiosResponse<StandingsResponse.RootObject>>;
