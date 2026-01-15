# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds extension logic. Key entry points are `src/background.js` and `src/content.js`.
- `src/helpers/`, `src/svg-core/`, and `src/svg-processor/` contain reusable modules for labeling, gallery handling, and SVG processing.
- `src/styles/` contains layered CSS (`tokens.css`, `base.css`, `components.css`, `layout.css`, etc.). `src/styles.css` pulls them together.
- `public/` contains the extension manifest and static assets (icons, `svg-grabber.html`).
- Build output lands in `dist/` (and `dist.zip` for packaged artifacts when created).

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run dev` starts Vite in dev mode for local iteration.
- `npm run build` produces the production bundle in `dist/`.

## Coding Style & Naming Conventions
- Indentation: 2 spaces, ES modules (`import`/`export`), and modern JS syntax.
- Prefer small, focused modules. Keep helpers in `src/helpers/` and SVG-specific logic in `src/svg-core/` or `src/svg-processor/`.
- CSS uses layered files and design tokens in `src/styles/tokens.css`; extend tokens instead of hardcoding colors/sizes.
- Linting: ESLint is configured in `eslint.config.js`. Run `npx eslint .` when you need a lint pass.

## Testing Guidelines
- No automated test suite is present. Validate changes by building and loading the unpacked extension from `dist/` in Chrome.
- If you add tests, document the framework and add a corresponding npm script.

## Commit & Pull Request Guidelines
- Commit messages are short, imperative, and sentence case (e.g., “Update footer link”, “Improve checkers.js logic”).
- PRs should describe the change, call out user-facing behavior, and include screenshots or screen recordings for UI updates.
- Link related issues when available and note any manual verification performed.

## Configuration Notes
- Extension metadata lives in `public/manifest.json`. Update it alongside feature changes that affect permissions or UI entry points.
