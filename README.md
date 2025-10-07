# poke-ts
Pokemon info project using pokeapi in typescript.

## Prerequisites for installation

Node.js

### Installation
1. Clone the repository
git clone https://github.com/S4nnix/poke-ts.git
cd poke-ts

2. Install the dependencies by running "npm install" and wait for the installation to finish.

3. Run "ts-node poke.ts" to start the project.

// The project will be available at http://localhost:3000
## How to use
/pokes = Contents of pokemons.json with information about all Pokémon.
/pokes/:param (pokemon name or number) =  Displays basic information about the searched Pokémon, if it is not in pokemons.json, it takes information from pokeapi and saves that information in pokemons.json.
