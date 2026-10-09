# path-heartland

Source for [path-heartland.org](https://path-heartland.org), the Psychedelic Alliance of the Heartland.

Plain HTML, CSS, and JS — no build step. Everything in `site/` is published as-is by
`.github/workflows/pages.yml` on every push to `main`.

Preview locally (the page loads its data with `fetch`, so it needs a server, not `file://`):

```sh
python3 -m http.server -d site 8000   # → http://localhost:8000
```

## Editing content

All content lives in JSON under `site/data/`. Edit, commit, push to `main` — it's live in a minute or two.

### Member organizations — `site/data/orgs.json`

```jsonc
{
  "id": "pskc",                     // unique, lowercase
  "short": "PSKC",                  // shown on the map marker when there's no logo
  "name": "Psychedelic Society of Kansas City",
  "type": "Psychedelic society",    // small label: society, collective, church, therapy collective…
  "area": "Statewide · 4 chapters", // optional; replaces the list of location names on the card
  "color": "#C8361F",               // marker colour when there's no logo
  "logo": "assets/logos/pskc.svg",  // optional; null → monogram
  "description": "One or two sentences.",
  "website": "https://psychedelickc.org",
  "links": [{ "label": "Instagram", "url": "https://…" }],
  "locations": [{ "name": "Kansas City, MO", "lat": 39.0997, "lng": -94.5786 }]
}
```

Put logos in `site/assets/logos/`. Square-ish SVG or PNG (≥256px) with a transparent or white
background works best; they're shown inside a circle. Nearby or shared locations are spread apart
automatically on the map.

### Speakers — `site/data/speakers.json`

```jsonc
{
  "name": "Jane Doe",
  "photo": "assets/speakers/jane-doe.jpg", // optional; square, ≥300px
  "role": "Clinical psychologist",
  "org": "PSKC",
  "location": "Kansas City, MO",
  "formats": "In person or virtual · travels within the region",
  "bio": "Short bio, 2–4 sentences.",
  "topics": ["Harm reduction", "Clinical research"],
  "links": [{ "label": "Email", "url": "mailto:jane@example.org" }]
}
```

### Announcements — `site/data/announcements.json`

```jsonc
{
  "date": "2027-05-03",        // YYYY-MM-DD
  "endDate": "2027-05-07",     // optional
  "tag": "Conference",         // Conference, News, Symposium…
  "title": "…",
  "summary": "…",
  "url": "https://…"           // optional
}
```

Upcoming items sort first; past ones are greyed out and labelled "Past".

## Map

The state outlines in `site/js/map-geometry.js` are generated from US Census data (`us-atlas`).
To regenerate (e.g. to change which states are shown): `cd tools && npm install && npm run build-map`.
