/* eslint-disable*/
import { json, urlencoded } from "body-parser";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import mongoose, { ConnectOptions } from "mongoose";
import jwt from "jsonwebtoken";

interface Player {
  id: string;
  password: string;
}

interface Game {
  player: string;
  rounds: GameRound[];
}

interface GameRound {
  player: string;
  result: number;
}

const playerSchema = new mongoose.Schema<Player>({
  id: { type: String, required: true },
  password: { type: String, required: true },
});

const PlayerModel = mongoose.model<Player>("Player", playerSchema);

const gameRoundSchema = new mongoose.Schema<GameRound>({
  player: { type: String, required: true },
  result: { type: Number, required: true },
});

const gameSchema = new mongoose.Schema<Game>({
  player: { type: String, required: true },
  rounds: [gameRoundSchema],
});

const GameModel = mongoose.model<Game>("Game", gameSchema);

export class Server {
  private readonly express: Express;
  private readonly port: string;
  private readonly secretKey: string = "my_secret_key";

  constructor(port: string) {
    this.port = port;
    this.express = express();
    this.express.use(helmet());
    this.express.use(cors());
    this.express.use(json());
    this.express.use(urlencoded({ extended: true }));
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // POST /login: Authenticate user credentials
    this.express.post("/login", async (req: Request, res: Response) => {
      const { id, password } = req.body;

      const user = await PlayerModel.findOne({ id });
      if (!user || password !== user.password) {
        return res.status(401).json({ error: "The username or password are incorrect" });
      }

      const token = jwt.sign({ id: user.id }, this.secretKey);

      res.json({ token });
    });

    // POST /player: Create a new player
    this.express.post("/player", async (req: Request, res: Response) => {
      let { id, password } = req.body;

      if (!id) {
        id = "anonymous";
      }

      if (await PlayerModel.exists({ id }) && id != "anonymous") {
        return res.status(400).json({ error: "Player name already exists" });
      }

      const player: Player = { id, password };
      await PlayerModel.create(player);

      const jwtoken = jwt.sign({ id }, this.secretKey);
      res.json({ player, jwtoken });
    });

    // GET /players: Get all players with their win rates
    this.express.get("/players", async (req: Request, res: Response) => {
      try {
        const players = await PlayerModel.find();

        const winRates = await Promise.all(
          players.map(async (player) => {
            const games = await GameModel.find({ player: player.id });

            let wins = 0;
            let totalRounds = 0;

            games.forEach((game) => {
              game.rounds.forEach((round) => {
                totalRounds++;
                if (round.result === 7) {
                  wins++;
                }
              });
            });

            const winRate = (wins / totalRounds) * 100;

            return { player: player.id, winRate };
          })
        );

        res.json(winRates);
      } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Failed to retrieve players" });
      }
    });

    // PUT /player/:id: Change the name of a player
    this.express.put("/player/:id", async (req: Request, res: Response) => {
      const playerId = req.params.id;
      const { newId } = req.body;

      const player = await PlayerModel.findOne({ id: playerId });
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      if (await PlayerModel.exists({ id: newId })) {
        return res.status(400).json({ error: "This name already exists" });
      }

      player.id = newId;
      await player.save();

      const jwtoken = jwt.sign({ id: playerId, newId }, this.secretKey);
      res.json({ player, jwtoken });
    });

    // POST /games/:id: Play a round of dice for the given player ID
    this.express.post("/games/:id", async (req: Request, res: Response) => {
      const playerId = req.params.id;

      const user = await PlayerModel.findOne({ id: playerId });
      if (!user) {
        return res.status(404).json({ error: "Player not found" });
      }

      const dice1 = Math.floor(Math.random() * 6);
      const dice2 = Math.floor(Math.random() * 6);

      const result = dice1 + dice2;
      const round: GameRound = { player: playerId, result };
      await GameModel.updateOne({ player: playerId }, { $push: { rounds: round } }, { upsert: true });

      if (result === 7) {
        res.json({ message: `${dice1} + ${dice2} = ${result}: You won the game!` });
      } else {
        res.json({ message: `${dice1} + ${dice2} = ${result}: Better luck next time :c` });
      }
    });

    // GET /games/:id: Get all rounds played by the given player ID
    this.express.get("/games/:id", async (req: Request, res: Response) => {
      const playerId = req.params.id;

      const rounds = await GameModel.findOne({ player: playerId }).select("rounds");
      if (!rounds) {
        return res.status(404).json({ error: "Player not found" });
      }

      res.json({ rounds });
    });

    // DELETE /games/:id: Delete all games of the given player ID
    this.express.delete("/games/:id", async (req: Request, res: Response) => {
      const player = req.params.id;

      const user = await PlayerModel.findOne({ id: player });
      if (!user) {
        return res.status(404).json({ error: "Player not found" });
      }

      await GameModel.deleteMany({ player: player });

      res.json({ message: "Games deleted successfully" });
    });

    // GET /ranking: Get the ranking of players based on win rates
    this.express.get("/ranking", async (req: Request, res: Response) => {
      try {
        const players = await PlayerModel.find();

        const winRates = await Promise.all(
          players.map(async (player) => {
            const games = await GameModel.find({ player: player.id });

            let wins = 0;
            let totalRounds = 0;

            games.forEach((game) => {
              game.rounds.forEach((round) => {
                totalRounds++;
                if (round.result === 7) {
                  wins++;
                }
              });
            });

            const winRate = (wins / totalRounds) * 100;

            return { player: player.id, winRate };
          })
        );

        const rankedPlayers = winRates.sort((a, b) => b.winRate - a.winRate);

        res.json(rankedPlayers);
      } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Failed to retrieve ranking" });
      }
    });

    // Middleware for verifying JWT token
    this.express.use((req: Request, res: Response, next: any) => {
      const token = req.headers["authorization"]?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
      }

      jwt.verify(token, this.secretKey, (err: any, decoded: any) => {
        if (err) {
          return res.status(403).json({ error: "Invalid token" });
        }

        req.body.userId = decoded.id;
        next();
      });
    });

    // Example protected route
    this.express.get("/protected", (req: Request, res: Response) => {
      res.json({ message: "This is a protected route" });
    });
  }

  public start(): void {
    const options: ConnectOptions = {
    };

    mongoose
      .connect("mongodb+srv://dbuser:dbuserpp@atlascluster.ccvayit.mongodb.net/", options)
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
      });
  }


	async listen(): Promise<void> {

    this.start();

		await new Promise<void>((resolve) => {
			this.express.listen(this.port, () => {
				console.log(
					`✅ Backend App is running at http://localhost:${this.port} in ${this.express.get(
						"env"
					)} mode`
				);
				console.log("✋ Press CTRL-C to stop\n");

				resolve();
			});
		});
	}
}