require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { shell } = require("electron");
const { exec } = require("child_process");

const apiKey = process.env.STEAMGRIDDB_API_KEY;

// ─── Steam Games ───────────────────────────────────────────
function getSteamGames() {
  const steamPath = "C:\\Program Files (x86)\\Steam\\steamapps";
  const games = [];

  try {
    const files = fs.readdirSync(steamPath);

    files.forEach((file) => {
      if (file.startsWith("appmanifest_") && file.endsWith(".acf")) {
        const filePath = path.join(steamPath, file);
        const content = fs.readFileSync(filePath, "utf8");

        const nameMatch = content.match(/"name"\s+"(.+)"/);
        const appIdMatch = content.match(/"appid"\s+"(\d+)"/);

        if (nameMatch && appIdMatch) {
          const name = nameMatch[1];
          const appId = appIdMatch[1];

          games.push({
            id: appId,
            name: name,
            platform: "Steam",
            cover: `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`,
          });
        }
      }
    });
  } catch (err) {
    console.error("Could not read Steam folder:", err);
  }

  return games;
}

// ─── Emulator Games ────────────────────────────────────────
function getEmulatorGames() {
  const emulators = [
    {
      name: "PCSX2",
      path: "C:\\Users\\USER\\Desktop\\Emulator stuff\\ps2\\Ps2Games",
      extensions: [".iso", ".bin", ".img"],
    },
    {
      name: "Dolphin",
      path: "C:\\Users\\USER\\Desktop\\Emulator stuff\\wii\\wii games",
      extensions: [".iso", ".gcm", ".wbfs", ".rvz"],
    },
    {
      name: "DeSmuME",
      path: "C:\\Users\\USER\\Desktop\\Emulator stuff\\nintendo",
      extensions: [".nds"],
    },
    {
      name: "Citra",
      path: "C:\\Users\\USER\\Desktop\\Emulator stuff\\nintendo",
      extensions: [".3ds", ".cia"],
    },
    {
      name: "Game Boy",
      path: "C:\\Users\\USER\\Desktop\\Emulator stuff\\Game Boy",
      extensions: [".gba", ".gb", ".gbc"],
    },
  ];

  const games = [];

  emulators.forEach((emulator) => {
    try {
      const files = fs.readdirSync(emulator.path);

      files.forEach((file) => {
        const ext = path.extname(file).toLowerCase();

        if (emulator.extensions.includes(ext)) {
          const name = path.basename(file, ext);

          games.push({
            id: `${emulator.name}-${name}`,
            name: name,
            platform: "Emulators",
            emulator: emulator.name,
            filePath: path.join(emulator.path, file),
            cover: null,
          });
        }
      });
    } catch (err) {
      console.error(`Could not read ${emulator.name} folder:`, err);
    }
  });

  return games;
}

// ─── Fetch Cover Art ───────────────────────────────────────
async function fetchCover(gameName) {
  try {
    const searchRes = await fetch(
      `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(gameName)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    const searchData = await searchRes.json();

    if (!searchData.data || searchData.data.length === 0) return null;

    const gameId = searchData.data[0].id;

    const coverRes = await fetch(
      `https://www.steamgriddb.com/api/v2/grids/game/${gameId}?dimensions=460x215`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    const coverData = await coverRes.json();

    if (!coverData.data || coverData.data.length === 0) return null;

    return coverData.data[0].url;
  } catch (err) {
    console.error(`Could not fetch cover for ${gameName}:`, err);
    return null;
  }
}

// ─── Emulator Paths ────────────────────────────────────────
const emulatorPaths = {
  PCSX2:
    "C:\\Users\\USER\\Desktop\\Emulator stuff\\ps2\\pcsx2-v2.7.30-windows-x64-Qt\\pcsx2-qt.exe",
  Dolphin:
    "C:\\Users\\USER\\Desktop\\Emulator stuff\\wii\\dolphin-2512-x64\\Dolphin-x64\\Dolphin.exe",
  DeSmuME:
    "C:\\Users\\USER\\Desktop\\Emulator stuff\\desmume-0_9.13-win64\\DeSmuME_0.9.13_x64.exe",
  Citra:
    "C:\\Users\\USER\\Desktop\\Emulator stuff\\citra-windows-msvc-20240303-0ff3440_nightly\\citra-windows-msvc-20240303-0ff3440\\citra-qt.exe",
  "Game Boy":
    "C:\\Users\\USER\\Desktop\\Emulator stuff\\visualboyadvance-m-Win-x86_64\\visualboyadvance-m.exe",
};

// ─── Data ──────────────────────────────────────────────────
const games = [...getSteamGames(), ...getEmulatorGames()];

// ─── Render ────────────────────────────────────────────────
function renderGames(gameList) {
  const container = document.getElementById("game-list");
  container.innerHTML = "";

  gameList.forEach((game) => {
    const row = document.createElement("div");
    row.classList.add("game-row");

    row.innerHTML = `
      <img class="game-cover" src="${game.cover || ""}" alt="${game.name}">
      <div class="game-info">
        <span class="game-name">${game.name}</span>
        <span class="game-platform">${game.emulator || game.platform}</span>
      </div>
      <button class="launch-btn">Launch</button>
    `;

    if (!game.cover) {
      fetchCover(game.name).then((url) => {
        if (url) {
          const img = row.querySelector(".game-cover");
          img.src = url;
        }
      });
    }

    const launchBtn = row.querySelector(".launch-btn");

    launchBtn.addEventListener("click", () => {
      if (game.platform === "Steam") {
        shell.openExternal(`steam://rungameid/${game.id}`);
      } else {
        const emulatorExe = emulatorPaths[game.emulator];
        exec(`"${emulatorExe}" "${game.filePath}"`, (err) => {
          if (err) console.error("Failed to launch game:", err);
        });
      }
    });

    container.appendChild(row);
  });
}

// ─── Tabs ──────────────────────────────────────────────────
function initTabs() {
  const tabs = document.querySelectorAll(".tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const platform = tab.textContent.trim();

      if (platform === "All") {
        renderGames(games);
      } else {
        const filtered = games.filter(
          (game) => game.platform.toUpperCase() === platform.toUpperCase(),
        );
        renderGames(filtered);
      }
    });
  });
}

// ─── Init ──────────────────────────────────────────────────
renderGames(games);
initTabs();
