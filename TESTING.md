# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

- **Test Runner:** Vitest 4.x
- **Component Testing:** @testing-library/react 16.x
- **DOM:** jsdom
- **Assertions:** vitest built-in + @testing-library/jest-dom

## Running Tests

```bash
npm run test          # Run all tests once
npm run test:watch    # Watch mode (re-run on file changes)
```

## Test Structure

```
test/
├── setup.ts              # Global setup (@testing-library/jest-dom)
├── conversions.test.ts   # Unit tests for conversion logic
└── *.test.ts             # Future test files
```

## Conventions

- **File naming:** `test/{module}.test.ts` or `test/{module}.test.tsx`
- **Describe blocks:** Group by function/component name
- **Assertions:** Use `toBeCloseTo` for floating point, `toBe` for exact values
- **Imports:** Use `@/` path alias (matches app imports)

## Test Layers

| Layer | What | Where | When |
|-------|------|-------|------|
| Unit | Pure functions (conversions, validation) | `test/*.test.ts` | Every function |
| Integration | Server actions + DB | `test/*.test.ts` | API boundaries |
| Component | React components | `test/*.test.tsx` | Interactive components |
| E2E | Full user flows | `/qa` via gstack browse | Before ship |

## Expectations

- When writing new functions, write a corresponding test
- When fixing a bug, write a regression test
- When adding error handling, write a test that triggers the error
- When adding a conditional (if/else, switch), write tests for BOTH paths
- Never commit code that makes existing tests fail
