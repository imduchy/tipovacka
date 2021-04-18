import {
  ITeamStatistics,
  StandingsResponse,
  TeamStatisticsResponse,
} from '@duchynko/tipovacka-models';
import {
  ICompetitionStandingRecord,
  IFollowedTeam,
  ISeason,
} from '@duchynko/tipovacka-models/lib/models/Team';

export function getLatestSeason(followedTeam: IFollowedTeam): ISeason {
  const sortedSeasons = [...followedTeam.seasons].sort((a, b) => b.season - a.season);
  return sortedSeasons[0];
}

export function mapTeamStatistics(
  response: TeamStatisticsResponse.Response
): ITeamStatistics {
  return {
    form: response.form,
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

export function mapStandings(
  response: StandingsResponse.Response
): ICompetitionStandingRecord[] {
  console.log(response.league.standings);
  return response.league.standings[0].map((s) => ({
    teamApiId: s.team.id,
    teamName: s.team.name,
    teamLogo: s.team.logo,
    description: s.description != null ? s.description : '',
    form: s.form,
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
