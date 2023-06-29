import { IFollowedTeam, ISeason } from '@tipovacka/models';

export function getLatestSeason(followedTeam: IFollowedTeam): ISeason | undefined {
  const sortedSeasons = [...followedTeam.seasons].sort((a, b) => b.season - a.season);
  return sortedSeasons[0];
}
