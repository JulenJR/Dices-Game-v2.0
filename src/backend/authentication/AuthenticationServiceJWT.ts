import { AuthenticationService } from "../service/AuthenticationService";
import jwt from 'jsonwebtoken';
import { PlayerRepository } from "../repository/PlayerRepository";

export class AuthenticationServiceJWT implements AuthenticationService {
  private secretKey: string;
  private playerRepository: PlayerRepository;

  constructor(secretKey: string, playerRepository: PlayerRepository) {
    this.secretKey = secretKey;
    this.playerRepository = playerRepository;
  }

  async login(id: string, password: string): Promise<string> {
    const player = await this.playerRepository.findByCredentials(id, password);
    if (!player) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: player.id }, this.secretKey);
    return token;
  }
}
