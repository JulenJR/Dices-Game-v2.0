/* eslint-disable*/
import { Game, GameRound } from "../domain/Game";

export interface GameService {
  playRound(playerId: string): Promise<string>;
  getRoundsByPlayerId(playerId: string): Promise<GameRound[] | null>;
  deleteGamesByPlayerId(playerId: string): Promise<void>;
  getRanking(): Promise<any[]>;
  getWinner(): Promise<any>;
  getLoser(): Promise<any>;
}