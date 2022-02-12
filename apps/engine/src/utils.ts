import { ICompetition, IFollowedTeam, ISeason } from '@tipovacka/models';

export function getCompetition(
  followedTeam: IFollowedTeam,
  season: number,
  competitionId: number
): ICompetition | undefined {
  const seasonObj = followedTeam.seasons.find((s) => s.season === season);

  if (seasonObj) {
    return seasonObj.competitions.find((c) => c.apiId === competitionId);
  } else {
    return undefined;
  }
}

export function getLatestSeason(followedTeam: IFollowedTeam): ISeason {
  return followedTeam.seasons
    .sort((a, b) => a.season - b.season)
    .slice(-1)
    .pop();
}
