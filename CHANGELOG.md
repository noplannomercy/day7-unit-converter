# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0.0] - 2026-03-22

### Added

- Unit converter supporting length (m, km, ft, mi), weight (kg, g, lb, oz), and temperature (°C, °F, K)
- SQLite database persistence via Prisma with conversion history and favorites
- Server-side conversion logic with input validation (rejects NaN, Infinity, negative length/weight)
- Atomic favorite toggling using raw SQL to prevent race conditions
- Converter form with category-aware unit dropdowns (Radix UI Select)
- History list (last 10 conversions) and favorites list with toggle/delete actions
- Loading skeleton UI and error boundary components
- Responsive grid layout (3-column desktop, 1-column mobile)
- Vitest + Testing Library test suite (29 unit tests)
- GitHub Actions CI pipeline

### Fixed

- Radix Select not syncing values on category change (empty fromUnit/toUnit saved to DB)
- Excessive decimal display (toFixed(6) → parseFloat(toFixed(6)))
