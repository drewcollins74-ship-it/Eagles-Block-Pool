# Eagles Block Pool

Fundraising website for the Philadelphia Eagles block pool supporting Team Mac Attack.

## Project structure

- `assets/` — production images and static assets used by the site.
- `design/mockups/` — reference mock-ups for layout and visual direction.
- `data/` — weekly block-pool data files used to render the pool grid.
- `src/` — website source code.

## Asset guidance

The landing-page mock-up should be used as a visual reference only. The final site should recreate the layout with HTML/CSS/components, not by placing the full mock-up as a single page image.

## Weekly pool preview

The current build contains only the weekly pool page. From the repository root, run:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173/weekly-pool`.

### Weekly data

- `data/pools/` contains a saved 100-square board for every game week.
- `data/weeks/index.json` lists the 2026 season and drives weekly navigation.
- `data/weeks/week-2026-01.json` contains the matchup, saved digit order, pool path, and score lookup ID for the 2026 opener.
- `data/nfl-scores-test.json` is the replaceable local score source.
- `data/teams.json` is the 32-team lookup keyed by NFL abbreviation.
- `assets/teams/` contains lowercase abbreviation SVGs referenced by the team catalog.

Each weekly game stores `opponent_abbreviation`. The page uses that key to load the opponent's name, short name, primary color, and logo from `data/teams.json`; those presentation details are not hard-coded into the page.

To generate and save a fresh independent digit order for both axes, run:

```sh
python3 scripts/generate_week.py 2026-02
```

Pass the archive ID for the week you want to update. The page will keep using that saved order on every refresh.

To add another week:

1. Save that week's 100-square CSV under `data/pools/` with a unique name.
2. Copy the week JSON, update its matchup, digit arrays, pool path, and score ID.
3. Add the new week JSON to `data/weeks/index.json`.

The archive sorts entries by `game_date`. `/weekly-pool` always opens the newest entry automatically, while `?week=2026-01` and the on-page controls open a specific saved week. The 2026 schedule includes all 17 games; Week 10 is omitted because it is the Eagles' bye week. Week 18 uses a temporary sort date and displays “Date and time TBD” until the NFL announces the kickoff.

### Replacing the test score source

The UI calls only `getGameById(scoreSourceId)` on the adapter in `src/score-adapter.js`. A future live NFL adapter can fetch an API, normalize its response to the current game shape (`eagles_score`, `opponent_score`, and `status`), and replace the `LocalScoreAdapter` import in `src/app.js`. The grid and winner logic do not need to change.
