
      const typeColors = {
        planta: "#78C850",
        fuego: "#F08030",
        agua: "#6890F0",
        veneno: "#A040A0",
        volador: "#A890F0",
        eléctrico: "#F8D030",
        bicho: "#A8B820",
        normal: "#A8A878",
        tierra: "#E0C068",
        hada: "#EE99AC",
        lucha: "#C03028",
        psíquico: "#F85888",
        roca: "#B8A038",
        fantasma: "#705898",
        hielo: "#98D8D8",
        dragón: "#7038F8",
        siniestro: "#705848",
        acero: "#B8B8D0",
      };

      let pokes = [];

      async function cargarPokes() {
        const res = await fetch("http://localhost:3000/pokes");
        pokes = await res.json();
        mostrarPokes();
      }
      function normalizarNombre(nombre) {
        return nombre
          .toLowerCase()
          .replace(/♀/g, "f")
          .replace(/♂/g, "m")
          .replace(/[.:'’]/g, "")
          .replace(/\s+/g, "-");
      }

      function mostrarPokes() {
        const container = document.getElementById("pokedex");
        const search = document.getElementById("search").value.toLowerCase();
        const sort = document.getElementById("sort").value;

        let filtrados = pokes.filter((p) =>
          p.pkm.toLowerCase().includes(search)
        );
        if (sort === "az") filtrados.sort((a, b) => a.pkm.localeCompare(b.pkm));
        if (sort === "za") filtrados.sort((a, b) => b.pkm.localeCompare(a.pkm));
        if (sort === "asc") filtrados.sort((a, b) => a.ndex - b.ndex);
        if (sort === "desc") filtrados.sort((a, b) => b.ndex - a.ndex);

        if (sort.startsWith("gen")) {
          const numero = parseInt(sort.replace("gen", ""), 10);
          filtrados = filtrados.filter((p) => p.gen === numero);
        }

        if (sort === "otros") {
          filtrados = filtrados.filter((p) => p.ndex >= 1026);
        }
        container.innerHTML = "";
        filtrados.forEach((p) => {
          const card = document.createElement("div");
          card.className = "card";

          const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.ndex}.png`;

          const tipos = p.tipo
            .split("/")
            .map((t) => {
              const color = typeColors[t] || "#666";
              return `<span class="type" style="background:${color}">${t}</span>`;
            })
            .join("");

          card.innerHTML = `
    <img src="${imgUrl}" alt="${p.pkm}">
    <h3>#${String(p.ndex).padStart(3, "0")} ${p.pkm}</h3>
    <div class="types">${tipos}</div>
  `;
          if (p.ndex <= 1025) {
            card.style.cursor = "pointer";
            card.addEventListener("click", () => {
              const url = `https://www.pokemon.com/es/pokedex/${normalizarNombre(
                p.pkm
              )}`;
              window.open(url, "_blank");
            });
          }

          container.appendChild(card);
        });
      }

      document.getElementById("search").addEventListener("input", mostrarPokes);
      document.getElementById("sort").addEventListener("change", mostrarPokes);

      cargarPokes();
