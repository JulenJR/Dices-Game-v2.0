/* eslint-disable*/
import { Game, GameRound } from "../domain/Game";

export interface GameRepository {
  findByPlayer(playerId: string): Promise<GameRound[] | null>;
  create(playerId: string, round: GameRound): Promise<void>;
  deleteByPlayerId(playerId: string): Promise<void>;
}
