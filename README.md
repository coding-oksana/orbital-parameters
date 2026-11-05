# Orbital Parameters

An interactive visualiser for the six Keplerian orbital elements. Move a slider and watch the orbit change around Earth in 3D, or switch to the 2D ground track to see where the satellite passes over the surface.

## Features

- **Six element sliders**, grouped into shape & size (`a`, `e`), orientation (`i`, `Ω`, `ω`) and position (`ν`). Each slider has a tooltip explaining what the element does.
- **Physical limits.** The slider ranges adapt to each other. For example, eccentricity is capped so the periapsis stays above Earth's surface. Elements that are undefined for the current orbit are disabled, such as RAAN for an equatorial orbit or ω for a circular one.
- **Presets** for real orbits: ISS, Hubble, GPS III, Molniya, GEO and a sun-synchronous orbit.
- **3D view** (three.js), showing:
  - the orbit path and the ascending/descending nodes
  - periapsis and apoapsis markers
  - labelled arcs for Ω, i, ω and ν
  - camera presets: free, from the vernal equinox, from the north pole, and face-on to the orbital plane
- **Ground track view**: a 2D map with three consecutive orbits and the satellite's current latitude and longitude.

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS, `@react-three/fiber` / `drei` (three.js), and [`orbital-convert`](https://www.npmjs.com/package/orbital-convert) for the Keplerian → Cartesian conversion.

## Getting started

Requires Node.js 20.19+ or 22.12+ (needed by Vite 8).

```bash
npm install
npm run dev
```

Then open the URL that Vite prints (usually http://localhost:5173).

## Scripts

| Command            | What it does                                     |
| ------------------ | ------------------------------------------------ |
| `npm run dev`      | Start the dev server with hot reload             |
| `npm run build`    | Type-check (`tsc -b`) and build into `dist/`     |
| `npm run preview`  | Serve the production build locally               |
| `npm run lint`     | Run ESLint                                       |
| `npm run fix`      | Run ESLint with auto-fix                         |
| `npm run prettier` | Format everything with Prettier                  |

## Project structure

```
src/
├── components/   UI and three.js scene components (OrbitScene, GroundTrackView, sliders, …)
├── constants/    Earth constants, orbit presets, scene colours
├── pages/        Top-level pages
├── types/        Shared TypeScript types
└── utils/        Orbital maths, ground-track propagation, slider limits, tooltips
```

Path aliases (`@components`, `@constants`, `@typeProps`, `@utils`, `@pages`) are defined in both `vite.config.ts` and `tsconfig.app.json`.

## Simplifications

This is an educational tool, not a precise propagator:

- Orbits are pure two-body Keplerian. There is no J2, drag or other perturbation, so RAAN does not drift and the sun-synchronous preset will not actually stay sun-synchronous.
- The ground track assumes Earth's rotation angle is 0 at t = 0, so longitudes are relative, not tied to a real date and time.
- Eccentricity is limited to closed orbits (`e ≤ 0.99`).

## License

[MIT](LICENSE) © 2026 Oksana Popovichenko
