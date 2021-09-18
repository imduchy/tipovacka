"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const exceptions_1 = require("../exceptions");
const logger_1 = require("../logger");
const logger = logger_1.getLogger();
function getFixture(params) {
    try {
        return axios_1.default.get(process.env.API_FOOTBALL_URL + '/fixtures', {
            params,
            headers: {
                'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
                'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
            },
        });
    }
    catch (error) {
        logger.error(`Error while fetching fixtures from the API. Error: ${error}`);
        throw error;
    }
}
exports.getFixture = getFixture;
function getEvents(params) {
    try {
        return axios_1.default.get(process.env.API_FOOTBALL_URL + '/fixtures/events', {
            params,
            headers: {
                'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
                'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
            },
        });
    }
    catch (error) {
        logger.error(`Error while fetching fixture events from the API. Error: ${error}`);
        throw error;
    }
}
exports.getEvents = getEvents;
function getPlayers(params) {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * Wrapper around the HTTP request to the /players endpoint
         * @param params request parameters
         * @returns StandingResponse object
         */
        function request(params) {
            return __awaiter(this, void 0, void 0, function* () {
                const response = yield axios_1.default.get(process.env.API_FOOTBALL_URL + '/players', {
                    params,
                    headers: {
                        'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
                        'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
                    },
                });
                if (response.status != 200) {
                    throw new exceptions_1.FootballApiResponseError("Response of the '/players' call returned with status " +
                        `${response.status}. The response error object is ` +
                        `${response.data.errors}.`);
                }
                return response;
            });
        }
        // Set the default value for the page parameter, if no value was provided.
        if (!params.page)
            params.page = 1;
        try {
            const response = yield request(params);
            const pages = response.data.paging.total;
            logger.info(`The response contains ${pages} pages of results.`);
            if (pages > 1) {
                logger.info('Looping through all remaining pages to get results.');
                for (let i = 2; i <= pages; i++) {
                    params.page = i;
                    const nextResponse = yield request(params);
                    logger.info(`The page number ${i} contains ${nextResponse.data.results} results.`);
                    response.data.response.push(...nextResponse.data.response);
                }
            }
            return response;
        }
        catch (error) {
            logger.error(`Error while fetching players information from the API. Error: ${error}`);
            throw error;
        }
    });
}
exports.getPlayers = getPlayers;
function getStandings(params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(process.env.API_FOOTBALL_URL + '/standings', {
                params,
                headers: {
                    'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
                    'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
                },
            });
            if (response.status != 200) {
                throw new exceptions_1.FootballApiResponseError("Response of the '/standings' call returned with status " +
                    `${response.status}. The response error object is ` +
                    `${response.data.errors}.`);
            }
            return response;
        }
        catch (error) {
            logger.error(`Error while fetching standings from the API. Error: ${error}`);
            throw error;
        }
    });
}
exports.getStandings = getStandings;
