import express, { Request, Response } from "express";
import fs from "fs";

const pokemons = "pokemons.json";

type Starter = {
  pkm: string;
  tipo: string;
  ndex: number;
  gen: number;
};

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

function guardarPokes() {
  fs.writeFileSync(pokemons, JSON.stringify(starters, null, 2));
}

function cargarPokes(): Starter[] {
  if (fs.existsSync(pokemons)) {
    const data = fs.readFileSync(pokemons, "utf-8");
    return JSON.parse(data) as Starter[];
  }
  return [];
}

function getGen(ndex: number): number {
  switch (true) {
    case ndex >= 10001:
      return 0;
    case ndex <= 151:
      return 1;
    case ndex <= 251:
      return 2;
    case ndex <= 386:
      return 3;
    case ndex <= 493:
      return 4;
    case ndex <= 649:
      return 5;
    case ndex <= 721:
      return 6;
    case ndex <= 809:
      return 7;
    case ndex <= 905:
      return 8;
    case ndex <= 1025:
      return 9;
    default:
      return 0;
  }
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

app.post("/pokes", (req: Request, res: Response) => {
  const añadirPoke: Starter = req.body;

  if (
    !añadirPoke.pkm ||
    !añadirPoke.tipo ||
    !añadirPoke.ndex ||
    !añadirPoke.gen
  ) {
    return res.status(400).json({ error: "Faltan datos del Pokémon" });
  }

  añadirPoke.pkm = capitalizarNombre(añadirPoke.pkm);

  const duplicado = starters.some(
    (s) =>
      s.ndex === añadirPoke.ndex ||
      s.pkm.toLowerCase() === añadirPoke.pkm.toLowerCase()
  );
  if (duplicado) {
    return res.status(409).json({ error: "El Pokémon ya existe" });
  }

  starters.push(añadirPoke);
  starters.sort((a, b) => a.ndex - b.ndex);
  guardarPokes();
  res.status(201).json(añadirPoke);
});

app.get("/pokes/:param", async (req: Request, res: Response) => {
  const { param } = req.params;
  let starter: Starter | undefined;

  if (isNaN(Number(param))) {
    const nombreNormalizado = capitalizarNombre(param);
    starter = starters.find(
      (s) => s.pkm.toLowerCase() === nombreNormalizado.toLowerCase()
    );
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

app.get("/pokes", (req: Request, res: Response) => {
  res.json(starters);
});

app.get("/", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
