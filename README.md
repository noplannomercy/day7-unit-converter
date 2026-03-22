# Unit Converter

Convert between length, weight, and temperature units with a clean, responsive UI. Built with Next.js 16, Prisma, and shadcn/ui.

## Features

- **Length:** Meter, Kilometer, Feet, Mile
- **Weight:** Kilogram, Gram, Pound, Ounce
- **Temperature:** Celsius, Fahrenheit, Kelvin (supports negative values like -40°C = -40°F)
- Conversion history (last 10) with favorites
- Input validation (rejects NaN, Infinity, negative length/weight)
- Responsive layout (3-column desktop, 1-column mobile)

## Getting Started

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the converter.

## Testing

```bash
npm run test          # Run all tests (29 unit tests)
npm run test:watch    # Watch mode
```

See [TESTING.md](TESTING.md) for conventions and test layers.

## Tech Stack

- **Framework:** Next.js 16.1.1 (App Router, Server Components)
- **Database:** SQLite via Prisma + libSQL
- **UI:** shadcn/ui (New York style) + Tailwind CSS v4
- **Testing:** Vitest + @testing-library/react
- **CI:** GitHub Actions

## Documentation

- [CLAUDE.md](CLAUDE.md) — Full project documentation and conventions
- [TESTING.md](TESTING.md) — Test framework and expectations
- [CHANGELOG.md](CHANGELOG.md) — Release history
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Architecture overview
- [docs/DATABASE.md](docs/DATABASE.md) — Database schema and queries
- [docs/PRD.md](docs/PRD.md) — Product requirements
