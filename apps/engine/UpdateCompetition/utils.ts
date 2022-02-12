import {
  ICompetitionStandingRecord,
  IPlayer,
  PlayersResponse,
  StandingsResponse,
} from '@tipovacka/models';

export function mapPlayersResponse(response: PlayersResponse.Response[]): IPlayer[] {
  return response.map((r) => ({
    name: r.player.name,
    apiId: r.player.id,
    firstName: r.player.firstname,
    lastName: r.player.lastname,
    age: r.player.age,
    injured: r.player.injured,
    photo: r.player.photo,
    statistics: {
      games: {
        captain: r.statistics[0].games.captain,
        appearences: r.statistics[0].games.appearences
          ? r.statistics[0].games.appearences
          : undefined,
        lineups: r.statistics[0].games.lineups ? r.statistics[0].games.lineups : undefined,
        minutes: r.statistics[0].games.minutes ? r.statistics[0].games.minutes : undefined,
        number: r.statistics[0].games.number ? r.statistics[0].games.number : undefined,
        position: r.statistics[0].games.position,
        rating: r.statistics[0].games.rating
          ? Number.parseFloat(r.statistics[0].games.rating)
          : undefined,
      },
      goals: {
        assists: r.statistics[0].goals.assists ? r.statistics[0].goals.assists : undefined,
        conceded: r.statistics[0].goals.conceded ? r.statistics[0].goals.conceded : undefined,
        saves: r.statistics[0].goals.saves ? r.statistics[0].goals.saves : undefined,
        total: r.statistics[0].goals.total ? r.statistics[0].goals.total : undefined,
      },
    },
  }));
}

export function mapStandingsResponse(
  response: StandingsResponse.Response[]
): ICompetitionStandingRecord[] {
  // Because we specify both, league and season, parameters when making an API call,
  // we expect the response to have exactly one 'response' object
  const league = response[0].league;
  // Standings object is an array of arrays, but we're only interested in the first
  // object. This is detaily described in one of the tickets in the Github project.
  // https://github.com/Duchynko/tipovacka/projects/3#card-57821724
  const standings = league.standings[0];

  return standings.map((s) => ({
    teamName: s.team.name,
    teamApiId: s.team.id,
    teamLogo: s.team.logo,
    description: s.description ? s.description : undefined,
    rank: s.rank,
    points: s.points,
    form: s.form ? s.form : '-',
    played: s.all.played,
    won: s.all.win,
    draw: s.all.draw,
    lost: s.all.lose,
    goalsFor: s.all.goals.for,
    goalsAgainst: s.all.goals.against,
  }));
}
