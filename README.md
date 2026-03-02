# Nepal Map Playground

This is a standalone React app for testing `nepal-map-component` against real data.

## Setup

```bash
cd nepal-map-playground
npm install
```

The playground expects this file in `public/`:

- `public/nepal-map.topojson`

Source file in workspace:

- `../data/processed/nepal-map.topojson`

## Run

```bash
npm run dev
```

## What to test

- Drill-down mode (`country -> province -> district -> local_unit -> ward`)
- Select mode color toggling
- Hover/click callback status in UI
- Background click zoom-out behavior
