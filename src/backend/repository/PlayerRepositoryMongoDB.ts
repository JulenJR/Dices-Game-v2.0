/* eslint-disable*/
import mongoose, { Model } from 'mongoose';
import { Player } from '../domain/Player';
import { PlayerRepository } from './PlayerRepository';

const playerSchema = new mongoose.Schema<Player>({
  id: { type: String, required: true },
  password: { type: String, required: true }
});

export class PlayerRepositoryMongoDB implements PlayerRepository {
  private readonly PlayerModel: Model<Player>;

  constructor() {
    this.PlayerModel = mongoose.model<Player>('Player', playerSchema);
  }

  async create(player: Player): Promise<void> {
    await this.PlayerModel.create(player);
  }

  async find(id: string): Promise<Player | null> {
    const player = await this.PlayerModel.findOne({ id });
    return player;
  }

  async findAll(): Promise<Player[]> {
    const players = await this.PlayerModel.find();
    return players;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.PlayerModel.countDocuments({ id });
    return count > 0;
  }

  async update(player: Player): Promise<void> {
    await this.PlayerModel.updateOne({ id: player.id }, player);
  }

  async delete(id: string): Promise<void> {
    await this.PlayerModel.deleteOne({ id });
  }

  async findByCredentials(id: string, password: string): Promise<Player | null> {
    const player = await this.PlayerModel.findOne({ id, password });
    return player;
  }
}


