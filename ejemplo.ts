import express, { Request, Response } from "express";
import fs from "fs";

const FILE_PATH = "pokemons.json";

interface Starter {
  pkm: string;
  tipo: string;
  ndex: number;
  gen: number;
}

const typeTranslations: Record<string, string> = {
  normal: "normal",
  fire: "fuego",
  water: "agua",
  grass: "planta",
  electric: "eléctrico",
  ice: "hielo",
  fighting: "lucha",
  poison: "veneno",
  ground: "tierra",
  flying: "volador",
  psychic: "psíquico",
  bug: "bicho",
  rock: "roca",
  ghost: "fantasma",
  dragon: "dragón",
  dark: "siniestro",
  steel: "acero",
  fairy: "hada",
};

function capitalizarNombre(nombre: string): string {
  return nombre
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

const defaultStarters: Starter[] = [
  { pkm: "Bulbasaur", tipo: "planta/veneno", ndex: 1, gen: 1 },
  { pkm: "Charmander", tipo: "fuego", ndex: 4, gen: 1 },
  { pkm: "Squirtle", tipo: "agua", ndex: 7, gen: 1 },
  { pkm: "Chikorita", tipo: "planta", ndex: 152, gen: 2 },
  { pkm: "Cyndaquil", tipo: "fuego", ndex: 155, gen: 2 },
  { pkm: "Totodile", tipo: "agua", ndex: 158, gen: 2 },
  { pkm: "Treecko", tipo: "planta", ndex: 252, gen: 3 },
  { pkm: "Torchic", tipo: "fuego", ndex: 255, gen: 3 },
  { pkm: "Mudkip", tipo: "agua", ndex: 258, gen: 3 },
  { pkm: "Turtwig", tipo: "planta", ndex: 387, gen: 4 },
  { pkm: "Chimchar", tipo: "fuego", ndex: 390, gen: 4 },
  { pkm: "Piplup", tipo: "agua", ndex: 393, gen: 4 },
  { pkm: "Snivy", tipo: "planta", ndex: 495, gen: 5 },
  { pkm: "Tepig", tipo: "fuego", ndex: 498, gen: 5 },
  { pkm: "Oshawott", tipo: "agua", ndex: 501, gen: 5 },
  { pkm: "Chespin", tipo: "planta", ndex: 650, gen: 6 },
  { pkm: "Fennekin", tipo: "fuego", ndex: 653, gen: 6 },
  { pkm: "Froakie", tipo: "agua", ndex: 656, gen: 6 },
  { pkm: "Rowlet", tipo: "planta/volador", ndex: 722, gen: 7 },
  { pkm: "Litten", tipo: "fuego", ndex: 725, gen: 7 },
  { pkm: "Popplio", tipo: "agua", ndex: 728, gen: 7 },
  { pkm: "Grookey", tipo: "planta", ndex: 810, gen: 8 },
  { pkm: "Scorbunny", tipo: "fuego", ndex: 813, gen: 8 },
  { pkm: "Sobble", tipo: "agua", ndex: 816, gen: 8 },
  { pkm: "Sprigatito", tipo: "planta", ndex: 906, gen: 9 },
  { pkm: "Fuecoco", tipo: "fuego", ndex: 909, gen: 9 },
  { pkm: "Quaxly", tipo: "agua", ndex: 912, gen: 9 },
];

function guardarPokes() {
  fs.writeFileSync(FILE_PATH, JSON.stringify(starters, null, 2));
}

function cargarPokes(): Starter[] {
  if (fs.existsSync(FILE_PATH)) {
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data) as Starter[];
  }
  fs.writeFileSync(FILE_PATH, JSON.stringify(defaultStarters, null, 2));
  return [...defaultStarters];
}

function getGen(ndex: number): number {
  if (ndex >= 10001) return 0;
  if (ndex <= 151) return 1;
  if (ndex <= 251) return 2;
  if (ndex <= 386) return 3;
  if (ndex <= 493) return 4;
  if (ndex <= 649) return 5;
  if (ndex <= 721) return 6;
  if (ndex <= 809) return 7;
  if (ndex <= 905) return 8;
  if (ndex <= 1025) return 9;
  return 0;
}

async function fetchStarter(name: string): Promise<Starter | null> {
  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
    );
    if (!res.ok) return null;
    const data = await res.json();

    const starter: Starter = {
      pkm: capitalizarNombre(data.name),
      ndex: data.id,
      tipo: data.types
        .map((t: any) => typeTranslations[t.type.name] || t.type.name)
        .join("/"),
      gen: getGen(data.id),
    };

    return starter;
  } catch (error) {
    console.error("Error en la petición:", error);
    return null;
  }
}

const app = express();
const port = 3000;

app.use(express.json());

let starters: Starter[] = cargarPokes();

app.get("/pokes", (req: Request, res: Response) => {
  res.json(starters);
});

app.get("/pokedex", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/pokes/:param", async (req: Request, res: Response) => {
  const { param } = req.params;
  let starter: Starter | undefined;

  if (isNaN(Number(param))) {
    const nombreNormalizado = capitalizarNombre(param);
    starter = starters.find((s) => s.pkm.toLowerCase() === nombreNormalizado.toLowerCase());
  } else {
    const ndex = parseInt(param, 10);
    starter = starters.find((s) => s.ndex === ndex);
  }

  if (!starter) {
    const fetched = await fetchStarter(param);
    if (!fetched) {
      return res
        .status(404)
        .json({ error: "Pokémon no encontrado ni en PokéAPI" });
    }

    if (!starters.some((s) => s.ndex === fetched.ndex)) {
      starters.push(fetched);
      starters.sort((a, b) => a.ndex - b.ndex);
      guardarPokes();
    }

    starter = fetched;
  }

  res.json(starter);
});

app.post("/pokes", (req: Request, res: Response) => {
  const añadirPoke: Starter = req.body;

  if (!añadirPoke.pkm || !añadirPoke.tipo || !añadirPoke.ndex || !añadirPoke.gen) {
    return res.status(400).json({ error: "Faltan datos del Pokémon" });
  }

  añadirPoke.pkm = capitalizarNombre(añadirPoke.pkm);

  const duplicado = starters.some(
    (s) => s.ndex === añadirPoke.ndex || s.pkm.toLowerCase() === añadirPoke.pkm.toLowerCase()
  );
  if (duplicado) {
    return res.status(409).json({ error: "El Pokémon ya existe" });
  }

  starters.push(añadirPoke);
  starters.sort((a, b) => a.ndex - b.ndex);
  guardarPokes();
  res.status(201).json(añadirPoke);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Pagina ");
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
