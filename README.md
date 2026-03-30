# jyuwaaw.github.io

ASIC / Design Verification portfolio built from a customized DeveloperFolio template.

## Local development

```bash
cd /Users/Jyuwaa/jyuwaaw.github.io-pages
npm install
npm start
```

Then open:
- http://localhost:3000

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

This repo is configured for the GitHub Pages user site:
- https://jyuwaaw.github.io/

Recommended workflow:

```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

If you use the gh-pages deploy script instead:

```bash
npm run deploy
```

## Main editable files

- `src/portfolio.js` — site content
- `src/_globalColor.scss` — theme colors
- `src/assets/images/` — logos/images
- `src/containers/greeting/Greeting.js` — hero layout

## Notes

- This version has been tailored for ASIC / DV recruiting.
- Large vector animations were removed from the hero for a cleaner presentation.
- FlexiBit logo assets live in `src/assets/images/`.
