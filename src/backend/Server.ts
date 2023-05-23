/* eslint-disable */

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
import { AuthenticationService } from "./service/AuthenticationService";
import { AuthenticationServiceJWT } from "./authentication/AuthenticationServiceJWT";
import { GameService } from "./service/GameService";
import { PlayerService } from "./service/PlayerService";

export class Server {
    private readonly express: express.Express;
    private readonly port: string;
    private readonly authService: AuthenticationService;
    private readonly gameRepository: GameRepository;
    private readonly playerRepository: PlayerRepository;
    private readonly gameService: GameService;
    private readonly playerService: PlayerService;
  
    constructor(port: string) {
      this.port = port;
      this.express = express();
      this.express.use(helmet());
      this.express.use(cors());
      this.express.use(json());
      this.express.use(urlencoded({ extended: true }));
  
      // Initialize repositories
      this.gameRepository = new GameRepositoryMongoDB();
      this.playerRepository = new PlayerRepositoryMongoDB();
  
      // Initialize services
      this.gameService = new GameServiceImplementation(this.gameRepository, this.playerRepository);
      this.playerService = new PlayerServiceImplementation(this.playerRepository, this.gameRepository);
  
      // Initialize authentication service
      this.authService = new AuthenticationServiceJWT("your_secret_key", this.playerRepository);
  
      this.setupRoutes();
    }
  
    private setupRoutes(): void {
      // Access repositories and services using class properties
      const { gameRepository, playerRepository, gameService, playerService } = this;
  
      // Configure routes
      this.express.get("/", (req, res) => {
        res.send("Welcome to the Game App");
      });

    this.express.post("/player", async (req, res) => {
      const { id, password } = req.body;
      try {
        const player = await playerService.createPlayer(id, password);
        res.status(201).json(player);
      } catch (error) {
        res.status(400).json({ error: "Bad request" });
      }
    });

    this.express.put("/player/:id", async (req, res) => {
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

    this.express.post("/games/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await gameService.playRound(id);
        res.json({ result });
      } catch (error) {
        res.status(404).json({ error: "Not found" });
      }
    });

    this.express.post("/login", async (req, res) => {
      const { id, password } = req.body;
      try {
        const token = await this.authService.login(id, password);
        res.json({ token });
      } catch (error) {
        res.status(401).json({ error: "Invalid credentials" });
      }
    });
    

    this.express.get("/games/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const game = await gameService.getRoundsByPlayerId(id);
        res.json(game);
      } catch (error) {
        res.status(404).json({ error: "Not found" });
      }
    });

    this.express.delete("/games/:id", async (req, res) => {
      const { id } = req.params;
      try {
        await gameService.deleteGamesByPlayerId(id);
        res.sendStatus(204);
      } catch (error) {
        res.status(404).json({ error: "Not found" });
      }
    });

    this.express.get("/ranking", async (req, res) => {
      try {
        const ranking = await gameService.getRanking();
        res.json(ranking);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    });

    this.express.get("/ranking/winner", async (req, res) => {
      try {
        const winner = await gameService.getWinner();
        res.json(winner);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    });

    this.express.get("/ranking/loser", async (req, res) => {
      try {
        const loser = await gameService.getLoser();
        res.json(loser);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
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
