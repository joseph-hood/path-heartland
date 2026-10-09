# path-heartland

Source for [path-heartland.org](https://path-heartland.org).

- `site/` — the static site; everything in it is published as-is.
- `.github/workflows/pages.yml` — deploys `site/` to GitHub Pages on every push to `main`.

Preview locally: `python3 -m http.server -d site 8000` → http://localhost:8000
