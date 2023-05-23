/* eslint-disable*/
import { PlayerService } from "../service/PlayerService";
import { PlayerRepository } from "../repository/PlayerRepository";
import { GameRepository } from "../repository/GameRepository";
import { Player } from "../domain/Player";

export class PlayerServiceImplementation implements PlayerService {
  private playerRepository: PlayerRepository;
  private gameRepository: GameRepository;

  constructor(playerRepository: PlayerRepository, gameRepository: GameRepository) {
    this.playerRepository = playerRepository;
    this.gameRepository = gameRepository;
  }

  async createPlayer(id: string, password: string): Promise<Player> {
    const playerExists = await this.playerRepository.exists(id);
    if (playerExists) {
      throw new Error("Player already exists");
    }

    const player: Player = {
      id,
      password,
    };

    await this.playerRepository.create(player);

    return player;
  }

  async updatePlayerName(id: string, newName: string): Promise<Player> {
    const player = await this.playerRepository.find(id);
    if (!player) {
      throw new Error("Player not found");
    }

    player.id = newName;
    await this.playerRepository.update(player);

    return player;
  }

  async getPlayersWithWinRates(): Promise<any[]> {
    const players = await this.playerRepository.findAll();
    const winRatesPromises = players.map(async (player) => {
      const rounds = await this.gameRepository.findByPlayer(player.id);
      const wins = rounds?.filter((round) => round.result === 7).length;
      const winRate = ((wins ?? 0) / (rounds?.length ?? 1)) * 100;
      return { player: player.id, winRate };
    });

    const winRates = await Promise.all(winRatesPromises);
    return winRates;
  }
}