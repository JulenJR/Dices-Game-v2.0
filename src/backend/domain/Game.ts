export interface Game {
    player: string;
    rounds: GameRound[];
  }
  
export interface GameRound {
  player: string;
  result: number;
}
  