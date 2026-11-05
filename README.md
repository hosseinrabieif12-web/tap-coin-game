# 🪙 TAP COIN - Modern Gold Mining Web Game

An addictive, mobile-first clicker web game built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**. Features tactile coin animations, 3D perspective tilts, an energy recharge system, an upgrade shop, autonomous offline coin mining, 7-day daily login streaks, daily missions, and career stats backed by persistent LocalStorage.

Zero backend or external API keys required. 100% client-side and optimized for **Cloudflare Pages** deployment via GitHub.

---

## 🌟 Key Features

- **Tap System**:
  - Touch-friendly 3D tilting golden medallion coin with multi-touch support for rapid multi-finger tapping.
  - Floating `+X` numbers with critical hit bonuses (10% chance for +50% golden crit).
  - Synthesized Web Audio API sound effects (no external audio assets to fail) with pitch variance so tapping sounds musical and satisfying.
  - Real-time HTML5 canvas spark particles and celebration bursts.
  - Haptic feedback on supported mobile devices (`navigator.vibrate`).
  - 15-second **2X Turbo Boost** with active countdown and cooldown timer.

- **Energy System**:
  - Maximum energy capacity with visual animated gradient bar and recharge rate indicator (`+X / sec`).
  - Automatic energy regeneration even while on other tabs or idle.
  - Smart empty-state indicators and auditory feedback.

- **Upgrade Shop**:
  - **Multitap Strike**: Increases coins mined per tap.
  - **Battery Expansion**: Expands maximum energy capacity (+500 per level).
  - **Turbo Recharge**: Boosts energy regeneration rate per second.
  - **Autonomous Bot (Auto Miner)**: Continuously mines coins around the clock, even when the player is offline.
  - Dynamic exponential price curves with live affordability state.

- **Daily Rewards & Streaks**:
  - 7-Day progressive login calendar with exponential coin rewards and Day 7 Mega Jackpot.
  - Streak tracking with UTC midnight countdown and prevention of duplicate claims on the same day.

- **Daily Missions**:
  - Daily quests including tap milestones, upgrade purchases, daily reward claims, and passive income goals.
  - Dynamic progress bars with instant reward claiming and celebratory confetti.

- **Player Profile & Ranks**:
  - 8 Tiered ranks from Novice Miner to Galactic Coin Sovereign.
  - Comprehensive career telemetry: Total Taps, Lifetime Coins, Total Upgrades, Passive Income (per sec & per hour), and login streak.
  - Editable player nickname.
  - Sound Effects and Haptic toggles with persistent user preferences.
  - Game progress reset with safety confirmation dialog.

- **Persistent Data & Offline Progress**:
  - Safe LocalStorage synchronization with automated fallback against corrupted or missing data.
  - **Offline Idle Calculation**: Computes coins collected by the Auto Miner and energy recharged during player absence and greets returning players with a welcome-back dialog.

---

## 🚀 Cloudflare Pages Deployment (via GitHub)

TAP COIN is tailored specifically for instant deployment on **Cloudflare Pages**.

### Step 1: Push Repository to GitHub

```bash
git init
git add .
git commit -m "Initial commit: TAP COIN game"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, navigate to **Compute (Workers) &gt; Workers & Pages**.
3. Click **Create application** &gt; choose the **Pages** tab &gt; click **Connect to Git**.
4. Authorize Cloudflare to access your GitHub account and select your TAP COIN repository.

### Step 3: Configure Build Settings

Use the following exact build settings:

| Setting | Value |
|---|---|
| **Framework preset** | `Vite` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (leave empty or default) |
| **Environment variables** | None required (No API keys or secrets needed) |

5. Click **Save and Deploy**.
6. Cloudflare will automatically build and distribute the game across its global edge network with custom SSL and fast CDN caching.

---

## 💻 Local Development

To run the game locally on your machine:

```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build locally
npm run preview
```

The dev server will launch at `http://localhost:3000`.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Sound**: Native Browser Web Audio API Synthesizer (zero external audio files)
- **Haptics**: HTML5 Vibration API (`navigator.vibrate`)
- **Persistence**: Browser LocalStorage with automatic schema recovery
- **Routing**: Fixed thumb-zone bottom navigation bar with 4 tabs (Home, Upgrade, Missions, Profile)

---

## 📄 License

Apache-2.0
