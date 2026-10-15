# Persuado

Mobile-first essay and debate coach for 10 to 13 year olds. Next.js (static export), TypeScript, Tailwind, Lucide. Runs entirely in the browser: no server, no accounts, progress saved in LocalStorage on the device.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Publish to GitHub Pages

1. Create a new repo on GitHub called `persuado` (private or public; the site itself is public either way).
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "Persuado v1"
   git branch -M main
   git remote add origin https://github.com/<your-username>/persuado.git
   git push -u origin main
   ```
3. On GitHub: **Settings > Pages > Build and deployment > Source: GitHub Actions**.
4. Open the **Actions** tab and wait for "Deploy to GitHub Pages" to go green (about 2 minutes). If it ran before step 3, click it and choose **Re-run all jobs**.
5. Visit `https://<your-username>.github.io/persuado/`. On her phone or tablet, use Share > **Add to Home Screen** so it opens like an app.

Every push to `main` redeploys automatically.

Note: GitHub Pages on a free account requires the repo to be public. Private-repo Pages needs GitHub Pro. Nothing personal is in the code either way.

## Structure

```
app/                    Dashboard + one route per module (arena, peel, spar)
components/
  AppShell.tsx          Header (level, streak, sound) + bottom nav
  ConfettiLayer.tsx     Canvas confetti, triggered by celebrate()
  arena/                Switch Sides state machine
  peel/                 4-step builder, live preview, word bank drawer
  spar/                 3-round chat with the offline coach
lib/
  data.ts               Topics, openings, counterpoints, stems, connectors  <- edit topics here
  sparring.ts           Coach rules: <40 words, one assumption per turn
  synthesis.ts peel.ts readability.ts progress.ts storage.ts sound.ts
hooks/useCountdown.ts   Round timer (ROUND_SECONDS lives in arena/SwitchSidesArena.tsx)
```
