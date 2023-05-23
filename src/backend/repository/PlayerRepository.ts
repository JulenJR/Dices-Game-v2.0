/* eslint-disable*/
import { Player } from "../domain/Player";

export interface PlayerRepository {
  find(id: string): Promise<Player | null>;
  create(player: Player): Promise<void>;
  update(player: Player): Promise<void>;
  exists(id: string): Promise<boolean>;
  findAll() : Promise<Player[]>;
}
