# poke-ts
pequeno projeto de info de pokemon usando pokeapi na typescript

## Pré-requisitos para instalar

Node.js

### Instalação
1. Clone o repositório
git clone https://github.com/S4nnix/poke-ts.git
cd poke-ts

2. Instale as dependências executando "npm install" e espere terminar a instalação

3. Execute "ts-node poke.ts" para iniciar o projeto

// O projeto estará disponível em http://localhost:3000

## Como usar
/pokes = Conteúdo de pokemons.json com informações sobre todos os Pokémon
/pokes/:param (nome ou numero do pokemon) =  Exibe informações básicas sobre o Pokémon pesquisado, se não estiver em pokemons.json, ele pega informações do pokeapi e salva essas informações em pokemons.json
