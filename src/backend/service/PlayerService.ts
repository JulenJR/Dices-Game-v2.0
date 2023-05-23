/* eslint-disable*/
import { Player } from "../domain/Player";

export interface PlayerService {
  createPlayer(id: string, password: string): Promise<Player>;
  updatePlayerName(id: string, newName: string): Promise<Player>;
  getPlayersWithWinRates(): Promise<any[]>;
}