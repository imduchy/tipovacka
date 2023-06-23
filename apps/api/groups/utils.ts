import {
  ICompetitionStandingRecord,
  IFollowedTeam,
  IPlayer,
  ISeason,
  ITeamStatistics,
  PlayersResponse,
  StandingsResponse,
  TeamStatisticsResponse,
} from '@tipovacka/models';

export function getLatestSeason(followedTeam: IFollowedTeam): ISeason | undefined {
  const sortedSeasons = [...followedTeam.seasons].sort((a, b) => b.season - a.season);
  return sortedSeasons[0];
}

export function mapTeamStatistics(response: TeamStatisticsResponse.Response): ITeamStatistics {
  return {
    form: response.form != null ? response.form : '',
    cleanSheet: response.clean_sheet,
    draws: response.fixtures.draws,
    played: response.fixtures.played,
    wins: response.fixtures.wins,
    loses: response.fixtures.loses,
    failedToScore: response.failed_to_score,
    goals: {
      against: {
        total: {
          away: response.goals.against.total.away,
          home: response.goals.against.total.home,
          total: response.goals.against.total.total,
        },
        average: {
          away: parseInt(response.goals.against.average.away),
          home: parseInt(response.goals.against.average.home),
          total: parseInt(response.goals.against.average.total),
        },
      },
      for: {
        total: {
          away: response.goals.for.total.away,
          home: response.goals.for.total.home,
          total: response.goals.for.total.total,
        },
        average: {
          away: parseInt(response.goals.for.average.away),
          home: parseInt(response.goals.for.average.home),
          total: parseInt(response.goals.for.average.total),
        },
      },
    },
  };
}

export function mapStandings(response: StandingsResponse.Response): ICompetitionStandingRecord[] {
  return response.league.standings[0].map((s) => ({
    teamApiId: s.team.id,
    teamName: s.team.name,
    teamLogo: s.team.logo,
    description: s.description != null ? s.description : '',
    form: s.form != null ? s.form : '',
    played: s.all.played,
    won: s.all.win,
    lost: s.all.lose,
    draw: s.all.draw,
    points: s.points,
    rank: s.rank,
    goalsAgainst: s.all.goals.against,
    goalsFor: s.all.goals.for,
  }));
}

export function mapPlayers(response: PlayersResponse.Response[]): IPlayer[] {
  return response.map((r) => ({
    apiId: r.player.id,
    name: r.player.name,
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
