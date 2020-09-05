interface User {
  username: String
  email: String
  score: number
  passwordHash: String
  scoreInCompetition: TotalScore[]
}

interface TotalScore {
  competitionId: number
  season: Season
  score: number
}
