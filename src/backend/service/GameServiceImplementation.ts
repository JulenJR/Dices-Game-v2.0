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
  
    await this.gameRepository.addRound(playerId, round);
  
    if (result === 7) {
      return `${dice1} + ${dice2} = ${result}: You won the game!`;
    } else {
      return `${dice1} + ${dice2} = ${result}: Better luck next time :c`;
    }
  }
  

  async getRoundsByPlayerId(playerId: string): Promise<Game[] | null> {
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
        const games = await this.gameRepository.findByPlayer(player.id);
        const rounds = games?.flatMap((game) => game.rounds ?? []);
        const wins = rounds?.filter((round) => round.result === 7).length ?? 0;
        const totalRounds = rounds?.length ?? 0;
        const winRate = totalRounds > 0 ? (wins / totalRounds) * 100 : 0;
        return { player: player.id, winRate };
      })
    );

    const sortedRanking = ranking.sort((a, b) => b.winRate - a.winRate);
    return sortedRanking;
  }

  async getWinner(): Promise<any[]> {
    const ranking = await this.getRanking();
    const highestWinRate = ranking[0].winRate;
    const winners = ranking.filter((player) => player.winRate === highestWinRate);
    return winners;
  }
  
  async getLoser(): Promise<any[]> {
    const ranking = await this.getRanking();
    const lowestWinRate = ranking[ranking.length - 1].winRate;
    const losers = ranking.filter((player) => player.winRate === lowestWinRate);
    return losers;
  }
  
}