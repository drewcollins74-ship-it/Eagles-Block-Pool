# Codex Build Brief

Build a responsive website for the Eagles Block Pool fundraiser.

## Current priority

Create the initial landing page and weekly pool page structure.

## Pages / sections

1. Landing page / About the Pool
2. Weekly Pool page
3. How It Works section
4. Support the Cause section

## Asset handling

- Use `design/mockups/landing-page-reference.png` as the visual reference once it is added.
- Do not implement the site by placing the full mock-up image on the page.
- Use production assets from `assets/` when available.
- Treat `assets/asset-manifest.json` as the current list of needed assets.

## Data handling

- Render the block pool grid from `data/current-pool.csv` or a future JSON data file.
- Do not hard-code participant names into the markup.
- The grid should support repeated participant names because one person may buy multiple squares.

## Design notes

- The site should work well on desktop and mobile.
- Keep the nav items: About the Pool, How It Works, View Weekly Pool, Support the Cause, Donate.
- The weekly pool link should be prominent in the top navigation.
- Buttons should be real links/buttons, not baked into screenshots.

## Legal / brand caution

The repo is public. Avoid relying on protected third-party marks in production unless the organizer has permission to use them.
