# Request practice with <a href="https://nodejs.org"><img height=48 src="https://raw.githubusercontent.com/caiogondim/javascript-server-side-logos/master/node.js/standard/454x128.png"></a> express

### 🛄 Description

In this project we're runing a Dices Game where you can roll with TWO dices and you win if the result equals 7.

It works with a mongoDB database where you can create a USER with a username and password in the body of POST request to the endpoint /player. 

The database also saves the rounds played for each player/user and calculates a winrate overall the results of the player list.

⚠️ ⚠️ ⚠️ change the MONGO_URI in Server.ts to your mongoDB URI ⚠️ ⚠️ ⚠️

This GitHub Actions workflow automatically builds and tests the application when code changes are pushed to the master branch or a pull request targeting the master branch is opened or synchronized.



### 🎲 Endpoints
   ``` POST /login ```: checks if the user is in the database and returns a JWT token.
   
   ``` POST /player```: adds a new player to the database with an id and a password.
   
   ``` GET /players ```: returns all the players in the database with their winrate.
   
   ``` PUT /player/:id```: change the name of the user where the body has to have a "newId" : "newUserName".
   
   ``` POST /games/:id```: play a round with the user setted in the endpoint :id.
   
   ``` GET /games/:id```: show all the rounds played by the user at the endpoint :id.
   
   ``` DELETE /games/:id```: delete all the rounds from a user :id.
   
   ``` GET /ranking```: display all the players sorted by winrate of the player.
   
   ``` GET /ranking/winner```: shows the player with highest winrate.
   
   ``` GET /ranking/loser```: show the player with the lowest winrate.
   
     



### 📥 Installation

To get started with this template, you first need to clone the repository:

```bash
git clone https://github.com/JulenJR/Dices-Game-v2.0
```

Then, install the project dependencies:

```bash
npm install
```

### 🏁 How To Start

To start the server in development mode, run the following script:
```bash
npm run dev
```
Then, open http://localhost:8000 to access the server.

Try the requests using POSTMAN tho.

⚠️ ⚠️ ⚠️ change the MONGO_URI in Server.ts to your mongoDB URI ⚠️ ⚠️ ⚠️


### 🚀 Production

To run the server in production mode, first build the TypeScript code into JavaScript by running:

```bash
npm run build
```

This will generate the dist directory with the compiled JavaScript files.

Then, start the server by running:

```bash
npm start
```

This will start the server and make it available at http://localhost:8000.


### 🏗️ Scripts
This project comes with several predefined scripts in the package.json file:

```test```: Runs tests using Jest.

```lint```: Runs ESLint to check code quality.

```lint:fix```: Runs ESLint to fix code style issues.

```dev```: Starts the development server with ts-node-dev and allows debugging

```build```: Removes the ./dist folder and compiles the TypeScript code into JavaScript in the ./dist folder.

```start```: Starts the server in production using the compiled files in the dist/ folder.

### 📝 Dependencies

- cors: middleware for handling Cross-Origin Resource Sharing (CORS)

- dotenv: loads environment variables from a .env file

- express: web framework for Node.js

- express-promise-router: promise-based router for Express

- helmet: middleware for adding security headers

- mongodb: driver for MongoDB

- mysql2: MySQL client for Node.js

### 🛠️ Dev Dependencies

- @types/cors: TypeScript definitions for cors

- @types/express: TypeScript definitions for express

- @types/jest: TypeScript definitions for jest

- @types/mysql: TypeScript definitions for mysql

- eslint: linter for TypeScript

- eslint-config-codely: ESLint configuration used by CodelyTV

- mysql: MySQL driver for Node.js

- rimraf: cross-platform tool for removing files and directories

- ts-jest: TypeScript preprocessor for Jest

- ts-node-dev: TypeScript execution and development environment for Node.js

- tsc-watch: TypeScript compiler with file watching

### 🗂️ Folder structure

In this folder structure, the code is organized according to the principles of Hexagonal Architecture. Kind of.

```
src
 ┣ backend
 ┃ ┣ authentication
 ┃ ┃ ┣ AuthenticationService.ts
 ┃ ┃ ┗ AuthenticationServiceJWT.ts
 ┃ ┣ domain
 ┃ ┃ ┣ Game.ts
 ┃ ┃ ┗ Player.ts
 ┃ ┣ repository
 ┃ ┃ ┣ GameRepository.ts
 ┃ ┃ ┣ GameRepositoryMongoDB.ts
 ┃ ┃ ┣ PlayerRepository.ts
 ┃ ┃ ┗ PlayerRepositoryMongoDB.ts
 ┃ ┣ service
 ┃ ┃ ┣ AppService.ts
 ┃ ┃ ┣ AuthenticationService.ts
 ┃ ┃ ┣ GameService.ts
 ┃ ┃ ┣ GameServiceImplementation.ts
 ┃ ┃ ┣ PlayerService.ts
 ┃ ┃ ┗ PlayerServiceImplementation.ts
 ┃ ┣ App.ts
 ┃ ┣ server.start.ts
 ┃ ┗ Server.ts
 ┗ user
   ┣ domain
   ┃ ┗ entities
   ┃ ┃ ┗ User.ts
   ┗ infrastructure
     ┗ UserModule.ts
```
