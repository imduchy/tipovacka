import { IBetWithID, IUserWithID } from '@tipovacka/models';
import { Types } from 'mongoose';
import { hasPlacedBet } from '../utils';

describe('hasPlacedBet', () => {
  let user: IUserWithID = {} as IUserWithID;
  let game: Types.ObjectId = {} as Types.ObjectId;

  beforeEach(() => {
    user = {
      _id: new Types.ObjectId(),
      groupId: new Types.ObjectId(),
      username: 'user',
      email: 'user@email.com',
      bets: [],
      competitionScore: [{ competitionApiId: 1, score: 0, season: 2020 }],
      scope: ['user'],
      password: '*****',
    };

    game = new Types.ObjectId();
  });

  it("should return false if user hasn't placed any bets yet", () => {
    expect(hasPlacedBet(user, game)).toBe(false);
  });

  it('should return false if user has placed one bet on a different game', () => {
    user.bets = [{ game: new Types.ObjectId() } as IBetWithID];

    expect(hasPlacedBet(user, game)).toBe(false);
  });

  it('should return false if user has placed multiple bets on different games', () => {
    user.bets = [
      { game: new Types.ObjectId() } as IBetWithID,
      { game: new Types.ObjectId() } as IBetWithID,
      { game: new Types.ObjectId() } as IBetWithID,
    ];

    expect(hasPlacedBet(user, game)).toBe(false);
  });

  it('should return false if user has placed multiple bets on different games', () => {
    user.bets = [
      { game: new Types.ObjectId() } as IBetWithID,
      { game: new Types.ObjectId() } as IBetWithID,
      { game: new Types.ObjectId() } as IBetWithID,
    ];

    expect(hasPlacedBet(user, game)).toBe(false);
  });

  it('should return true if user has placed a bet on the game', () => {
    user.bets = [
      { game: game } as IBetWithID,
      { game: new Types.ObjectId() } as IBetWithID,
      { game: new Types.ObjectId() } as IBetWithID,
    ];

    expect(hasPlacedBet(user, game)).toBe(true);
  });

  it('should return true if the game is passed in as a string and user has placed a bet on the game', () => {
    user.bets = [
      { game: game } as IBetWithID,
      { game: new Types.ObjectId() } as IBetWithID,
      { game: new Types.ObjectId() } as IBetWithID,
    ];

    expect(hasPlacedBet(user, game.toString())).toBe(true);
  });
});
