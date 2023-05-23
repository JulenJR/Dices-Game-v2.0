/* eslint-disable*/
import { Player } from "../domain/Player";

export interface PlayerRepository {
  create(player: Player): Promise<void>;
  find(id: string): Promise<Player | null>;
  findAll(): Promise<Player[]>;
  exists(id: string): Promise<boolean>;
  update(player: Player): Promise<void>;
  delete(id: string): Promise<void>;
  findByCredentials(id: string, password: string): Promise<Player | null>;
}

