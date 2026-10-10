# PATH website — notes for Claude

Source for https://path-heartland.org, the Psychedelic Alliance of the Heartland (OK, MO, KS, AR).
The people maintaining this site are not developers. Explain what you're doing in plain language,
avoid jargon, and confirm before anything hard to undo.

## How the site works

- Plain HTML/CSS/JS in `site/` — no build step, no framework, no npm for the site itself.
- Pushing to `main` deploys automatically via `.github/workflows/pages.yml` (GitHub Pages, ~1–2 min).
- **Almost every content change is a JSON edit** in `site/data/`:
  - `orgs.json` — member organizations (map markers, cards, info panel, footer links)
  - `announcements.json` — Events & announcements section
  - `speakers.json` — Speakers bureau
  The README documents every field. Keep JSON valid (`python3 -m json.tool <file>`).
- Contact form posts to a Google Form; config at the top of `site/js/contact.js`.
- Brand: "Prairie Sunset" palette as CSS variables at the top of `site/css/style.css`
  (tomato `#C8361F`, orange `#E8641C`, marigold `#F4A51C`, cream `#FBF0DC`, cocoa `#35201B`,
  teal `#1E7A73`). Fonts: Poppins (headings), DM Sans (body).

## Common tasks

- **New member org**: add an entry to `orgs.json` (look up lat/lng for each location), add the logo.
- **Logos**: put in `site/assets/logos/` as ~256px WebP. They display as circles; a square logo on a
  solid background should be cropped to a circle first (ImageMagick command in the README). Dark or
  coloured backgrounds read better on the cream page than white ones.
- **Event**: add to `announcements.json` (`YYYY-MM-DD` dates). Past events grey out automatically.
- **Speaker**: add to `speakers.json`; photos go in `site/assets/speakers/` (square, ~300px).

## Checking changes

Preview: `python3 -m http.server -d site 8000`, then open http://localhost:8000. Check the page
at phone width too. Look for console errors.

**Live preview for the maintainer.** When a session changes anything under `site/`, publish a
preview of the site as an Artifact so the maintainer can see it in the side panel, and do it
before opening the PR:

1. `python3 tools/build-preview.py <scratchpad>/preview` (it prints the supporting files).
2. Publish `<scratchpad>/preview/index.html` with the Artifact tool, `root` set to
   `<scratchpad>/preview` and every printed path in `files`.
3. After each further change in the same session, rebuild and publish the same file path again so
   the link stays the same. Put the preview link in your reply.

The preview is private to whoever's session made it. The contact form can't send from inside it,
which is expected. If the session has no Artifact tool, send screenshots of the page at desktop
and phone width instead.

## Workflow

- Never push directly to `main`. Make a branch, commit, push, and open a pull request with a short
  plain-language summary of what changed. Merging the PR publishes the site.
- Keep changes small and focused; one PR per request.
- Don't commit secrets, personal phone numbers, or private emails beyond what orgs publish publicly.

## Content guidelines

PATH and its members focus on education, harm reduction, community, and policy reform. Site copy
must not offer, sell, or facilitate access to controlled substances. Facts about member orgs
(descriptions, links, dates) should come from the org itself or its official site.
