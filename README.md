# Persuado: The Curious Case Club

A cosy, mobile-first detective game about ideas, for 10 to 13 year olds. The friendly animals of Maple Hollow keep asking big questions. You collect clues from both sides, chat it through with Hoot the owl, then write a Case Report to crack the case.

Under the hood it still practises real skills: giving reasons, telling facts from feelings, spotting weak reasoning, seeing another point of view, and writing a structured paragraph (PEEL). There are no right or wrong sides.

Next.js (static export), TypeScript, Tailwind, Lucide. Runs entirely in the browser: no server, no accounts, progress saved in LocalStorage on the device.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Publish to GitHub Pages

Every push to `main` builds and deploys via `.github/workflows/deploy.yml` (Settings > Pages > Source must be "GitHub Actions"). Live at `https://<your-username>.github.io/persuado/`. On a phone or tablet, use Share > **Add to Home Screen** so it opens like an app.

## How a case works

1. **Meet the friends**: two witnesses, two different (and equally nice) ideas.
2. **Warm-up games** (tap-only, no timers):
   - *Clue Sort*: whose clue is it?
   - *Fact or Feeling?*: could you check it, or is it how someone feels?
   - *Strong or Wobbly?*: pick the clue that gives a real reason.
3. **Ask Hoot**: pick a hunch, answer three curious questions (offline, rule-based, under 40 words a turn).
4. **Case Report** (boss level): My hunch, My best clue, How it fits, Case closed. Bonus for a kind nod to the other idea.

Points lead to detective ranks; solved cases give stickers; badges for milestones. She chooses which case categories appear on her board.

## Structure

```
app/                    / (Case Board), case/, arena/ (games), spar/ (Hoot), peel/ (Case Report), casebook/
components/
  Dashboard.tsx         Welcome flow + Case Board
  CaseHub.tsx           Case file, witnesses, case trail
  arena/                Clue Sort, Fact or Feeling, Strong or Wobbly
  spar/AskHoot.tsx      Chat with Hoot
  peel/                 Case Report builder + word bank
  Casebook.tsx          Rank, badges, solved cases, settings
lib/
  data.ts               Categories, cases, clues, report steps, word bank   <- add cases here
  cast.ts               The Maple Hollow characters
  hoot.ts               Hoot's question rules
  progress.ts badges.ts settings.ts peel.ts storage.ts sound.ts
```

To add a case, copy one block in `lib/data.ts`: two witnesses from `cast.ts`, a short stance and quote for each, and three clues each tagged `fact(...)` or `feel(...)`.
