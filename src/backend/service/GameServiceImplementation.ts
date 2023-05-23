/* eslint-disable*/
import { Game, GameRound } from "../domain/Game";
import { GameRepository } from "../repository/GameRepository";
import { PlayerRepository } from "../repository/PlayerRepository";
import { GameService } from "./GameService";

export class GameServiceImplementation implements GameService {
  private readonly gameRepository: GameRepository;
  private readonly playerRepository: PlayerRepository;

  constructor(gameRepository: GameRepository, playerRepository: PlayerRepository) {
    this.gameRepository = gameRepository;
    this.playerRepository = playerRepository;
  }

  async playRound(playerId: string): Promise<string> {
    const player = await this.playerRepository.find(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const result = dice1 + dice2;

    const round: GameRound = {
      player: playerId,
      result: result
    };

    await this.gameRepository.create(playerId, round);

    if (result === 7) {
      return `${dice1} + ${dice2} = ${result}: You won the game!`;
    } else {
      return `${dice1} + ${dice2} = ${result}: Better luck next time :c`;
    }
  }

  async getRoundsByPlayerId(playerId: string): Promise<GameRound[] | null> {
    const rounds = await this.gameRepository.findByPlayer(playerId);
    return rounds;
  }

  async deleteGamesByPlayerId(playerId: string): Promise<void> {
    await this.gameRepository.deleteByPlayerId(playerId);
  }

  async getRanking(): Promise<any[]> {
    const players = await this.playerRepository.findAll();
    const ranking = await Promise.all(
      players.map(async (player) => {
        const rounds = await this.gameRepository.findByPlayer(player.id);
        const wins = rounds?.filter((round) => round.result === 7).length;
        const winRate = ((wins ?? 0) / (rounds?.length ?? 1)) * 100;
        return { player: player.id, winRate };
      })
    );
    const sortedRanking = ranking.sort((a, b) => b.winRate - a.winRate);
    return sortedRanking;
  }
  

  async getWinner(): Promise<any> {
    const ranking = await this.getRanking();
    return ranking[0];
  }

  async getLoser(): Promise<any> {
    const ranking = await this.getRanking();
    return ranking[ranking.length - 1];
  }
}