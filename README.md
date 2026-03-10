# 🎮 Sanctuary

A clean, dark, modern game launcher desktop app that brings all your games into one place — Steam, PS2, GameCube/Wii, Nintendo DS, 3DS, and Game Boy.

Built with Electron and vanilla JavaScript.

## Features

- Automatically detects and displays all your installed Steam games with cover art
- Supports emulator games from PCSX2, Dolphin, DeSmuME, Citra, and VisualBoyAdvance
- Fetches cover art for emulator games using SteamGridDB
- Launch any game directly from the app
- Filter games by platform using the top navigation bar
- Clean dark UI inspired by modern console interfaces

## Built With

- Electron
- JavaScript
- HTML & CSS
- SteamGridDB API

## Setup

1. Clone the repository
```
git clone https://github.com/mousa897/sanctuary.git
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file in the root folder and add your SteamGridDB API key
```
STEAMGRIDDB_API_KEY=your_api_key_here
```

4. Run the app
```
npm start
```

## Notes

- Steam games are detected automatically from your Steam installation folder
- Emulator game paths are currently hardcoded — you will need to update the paths in `renderer.js` to match your own setup
- A SteamGridDB account and API key is required for emulator cover art
