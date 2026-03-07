const fs = require("fs");
const path = require("path");

const games = getSteamGames();

// render games
function renderGames(gameList) {
  const container = document.getElementById("game-list");
  container.innerHTML = "";

  gameList.forEach((game) => {
    const row = document.createElement("div");
    row.classList.add("game-row");

    row.innerHTML = `
      <img class="game-cover" src="${game.cover}" alt="${game.name}">
      <div class="game-info">
        <span class="game-name">${game.name}</span>
        <span class="game-platform">${game.platform}</span>
      </div>
      <button class="launch-btn">Launch</button>
    `;

    container.appendChild(row);
  });
}

renderGames(games);

// tabs
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

// get steam games
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
