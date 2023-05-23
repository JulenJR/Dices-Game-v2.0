/* eslint-disable*/
import mongoose, { Model } from 'mongoose';
import { Game, GameRound } from '../domain/Game';
import { GameRepository } from './GameRepository';

const gameRoundSchema = new mongoose.Schema<GameRound>({
  player: { type: String, required: true },
  result: { type: Number, required: true }
});

const gameSchema = new mongoose.Schema<Game>({
  player: { type: String, required: true },
  rounds: [gameRoundSchema]
});

export class GameRepositoryMongoDB implements GameRepository {
  private readonly GameModel: Model<Game>;

  constructor() {
    this.GameModel = mongoose.model<Game>('Game', gameSchema);
  }

  async create(playerId: string, round: GameRound): Promise<void> {
    const game: Game = {
      player: playerId,
      rounds: [round]
    };
    await this.GameModel.create(game);
  }

  async findByPlayer(playerId: string): Promise<GameRound[] | null> {
    const games = await this.GameModel.find({ player: playerId });
  
    if (games) {
      const gameRounds = games.map((game) => {
        const { _id, result } = game;
        return { _id: _id.toString(), player: playerId, result };
      });
      return gameRounds;
    }
  
    return null;
  }

  async addRound(playerId: string, round: GameRound): Promise<void> {
    await this.GameModel.updateOne(
      { player: playerId },
      { $push: { rounds: round } },
      { upsert: true }
    );
  }

  async deleteByPlayerId(playerId: string): Promise<void> {
    await this.GameModel.deleteMany({ player: playerId });
  }
}