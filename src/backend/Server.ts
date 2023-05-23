/* eslint-disable*/
import { json, urlencoded } from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { GameServiceImplementation } from "./service/GameServiceImplementation";
import { PlayerServiceImplementation } from "./service/PlayerServiceImplementation";
import { GameRepository } from "./repository/GameRepository";
import { PlayerRepository } from "./repository/PlayerRepository";
import { GameRepositoryMongoDB } from "./repository/GameRepositoryMongoDB";
import { PlayerRepositoryMongoDB } from "./repository/PlayerRepositoryMongoDB";

export class Server {
  private readonly express: express.Express;
  private readonly port: string;

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

    // Initialize repositories
    const gameRepository: GameRepository = new GameRepositoryMongoDB();
    const playerRepository: PlayerRepository = new PlayerRepositoryMongoDB();
    // Initialize services
    const gameService = new GameServiceImplementation(gameRepository, playerRepository);
    const playerService = new PlayerServiceImplementation(playerRepository, gameRepository);

    // Configure routes
    this.express.get("/", (req, res) => {
      res.send("Welcome to the Game App");
    });

    this.express.post("/players", async (req, res) => {
      const { id, password } = req.body;
      try {
        const player = await playerService.createPlayer(id, password);
        res.status(201).json(player);
      } catch (error) {
        res.status(400).json({ error: "Bad request" });
      }
    });

    this.express.put("/players/:id", async (req, res) => {
      const { id } = req.params;
      const { newName } = req.body;
      try {
        const player = await playerService.updatePlayerName(id, newName);
        res.json(player);
      } catch (error) {
        res.status(404).json({ error: "Not found" });
      }
    });

    this.express.get("/players", async (req, res) => {
      try {
        const players = await playerService.getPlayersWithWinRates();
        res.json(players);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    });

    this.express.post("/games/:playerId", async (req, res) => {
      const { playerId } = req.params;
      try {
        const result = await gameService.playRound(playerId);
        res.json({ result });
      } catch (error) {
        res.status(404).json({ error: "Not found" });
      }
    });
  }

  async listen(): Promise<void> {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://dbuser:dbuserpp@atlascluster.ccvayit.mongodb.net/", {})
      .then(() => {
        console.log("✅ Connected to MongoDB");
      })
      .catch((error) => {
        console.error("❌ Failed to connect to MongoDB", error);
      });
  
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
