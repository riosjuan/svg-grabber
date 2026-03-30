# AGENTS Guide for svg-grabber
This file is for agentic coding assistants working in this repository.
Follow these conventions unless the user explicitly asks otherwise.

## Project Snapshot
- Project type: Chrome Extension (Manifest V3) built with Vite.
- Language: JavaScript (ES modules), CSS, and HTML in `public/`.
- Package manager: npm (`package-lock.json` is present).
- Main source folders: `src/svg-core/`, `src/svg-processor/`, `src/helpers/`, `src/styles/`.
- Build output: `dist/`.

## Repository Layout
- `src/background.js`: extension service worker entry.
- `src/content.js`: injected content script entry.
- `src/svg-core/manager.js`: extension UI manager entry.
- `src/svg-core/gallery-handler.js`: gallery rendering and copy/download behavior.
- `src/svg-processor/`: SVG extraction and transformation logic.
- `src/helpers/`: shared utilities (filenames, theme, labels, tooltips).
- `src/styles.css`: CSS layer aggregator.
- `src/styles/`: layered CSS (`reset`, `tokens`, `base`, `components`, `layout`, `utilities`, `animations`).
- `public/manifest.json`: extension manifest and permissions.
- `public/svg-grabber.html`: extension UI page.
- `vite.config.js`: build entries and static copy setup.

## Build, Lint, Format, and Test Commands
Run commands from the repository root.

### Setup
- `npm install` - Install dependencies.

### Development
- `npm run dev` - Start Vite dev server.

### Production Build
- `npm run build` - Build extension bundle into `dist/`.

### Lint
- `npx eslint .` - Lint the full repository.
- `npx eslint src/**/*.js` - Lint only source JavaScript.

### Format
- `npx prettier --check .` - Check formatting.
- `npx prettier --write .` - Apply formatting fixes.

### Tests
- No automated test runner is currently configured in `package.json`.
- No test files currently exist in the repository.
- Single-test command is not available yet.

### If You Add Tests Later
- Add scripts such as `test` and `test:watch` to `package.json`.
- Document an exact single-test command (example pattern: `npm run test -- path/to/test-file`).
- Update this AGENTS file with exact commands once a framework is installed.

## Manual Verification (Current)
- Run `npm run build`.
- Load unpacked extension from `dist/` in Chrome.
- Click the extension on pages with inline and external SVGs.
- Verify gallery rendering, copy behavior, and ZIP download.
- Confirm no console errors in page context and extension UI.

## Code Style and Formatting
- Indentation: 2 spaces.
- Semicolons: required.
- Quotes: single quotes in JavaScript.
- Trailing commas: ES5 style.
- Module system: ESM only (`import` / `export`).
- Keep file contents ASCII unless Unicode is required by existing content.
- Source of truth for formatting: `.prettierrc.json`.

## ESLint Rules (Current)
Configured in `eslint.config.js` with `@eslint/js` recommended plus `eslint-config-prettier`.

- `no-unused-vars`: `warn`.
- `no-undef`: `warn`.
- `arrow-body-style`: `as-needed`.
- `no-console`: allowed.
- Keep logs actionable; do not remove useful diagnostics blindly.

## Imports and Exports
- Prefer relative imports inside `src/`.
- Keep extensionless local imports (for example `./helpers`).
- Order imports by origin: external packages first, then internal modules.
- Keep imports minimal; remove dead imports when editing a file.
- Use existing barrel files (`index.js`) when a folder already follows that pattern.

## Naming Conventions
- Filenames: kebab-case (example: `gallery-handler.js`).
- Variables and functions: camelCase.
- Constants and error string constants: UPPER_SNAKE_CASE.
- Booleans: prefer `is*`, `has*`, `should*` prefixes.
- Event setup/handlers: action-oriented names (`setupCopyButtons`, `copySvg`).

## Types and Data Contracts
- Codebase is plain JavaScript, not TypeScript.
- Use runtime guards at boundaries (DOM nodes, runtime messages, fetch results).
- Validate assumptions early (array inputs, node types, response status).
- Return safe fallback values (`[]`, `null`, empty string) where appropriate.
- Preserve message contracts between content script, background script, and manager.

## Error Handling
- Wrap async and parsing operations in `try/catch` when failure is expected.
- Emit clear, contextual error messages.
- Fail soft in UI paths; avoid uncaught exceptions that break rendering.
- Use `console.error` for operational failures and `console.warn` for recoverable states.
- Avoid silently swallowing errors unless there is a deliberate fallback.

## Chrome Extension Practices
- Mirror extension behavior/permission changes in `public/manifest.json`.
- Keep permission scope minimal.
- Keep runtime message types explicit and stable.
- For async message handlers, return `true` when a delayed response is used.
- Treat page-derived SVG as untrusted input and sanitize before rendering previews.

## CSS and UI Conventions
- Update `src/styles/tokens.css` before introducing raw reusable values.
- Respect existing cascade layers defined in `src/styles.css`.
- Keep component styles in `src/styles/components/`.
- Preserve class naming style (`block__element` and modifier classes such as `btn--icon`).
- Maintain accessibility basics: labels, focus states, and semantic controls.

## Agent Workflow Expectations
- Make minimal, focused changes scoped to the request.
- Avoid broad refactors unless explicitly requested.
- Do not rewrite unrelated files.
- Apply new patterns consistently only in touched files.
- Prefer small helpers over deep nesting where practical.
- Keep behavior backward-compatible unless the task requires change.

## Commit and PR Guidance
- Commit messages: short, imperative, sentence case.
- Example messages: `Improve SVG sanitization`, `Update filename fallback behavior`.
- PR descriptions should include: what changed, why, user-visible impact, and manual verification.
- Include screenshots or recordings for UI changes.

## Cursor/Copilot Rule Files Check
The following rule sources were checked and are currently absent:

- `.cursorrules`
- `.cursor/rules/`
- `.github/copilot-instructions.md`

If any of these files are added later, merge their guidance into this document and treat them as higher-priority repository-specific rules.
