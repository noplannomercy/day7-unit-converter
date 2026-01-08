# Unit Converter - Project Documentation

## Project Overview
Next.js 16 App Router application for unit conversions (length, weight, temperature) with SQLite persistence via Prisma.

**Status:** Phase 2 Complete - Full conversion logic and database integration implemented.

## Tech Stack
- **Framework:** Next.js 16.1.1 (App Router)
- **React:** 19.2.3 (Server Components + Client Components)
- **Language:** TypeScript 5 (strict mode enabled)
- **Database:** Prisma 5.22.0 + SQLite via libSQL adapter
- **UI Library:** shadcn/ui (New York style) + Radix UI primitives
- **Styling:** Tailwind CSS v4 with custom theme
- **Icons:** Lucide React 0.562.0
- **Utilities:** clsx, tailwind-merge, class-variance-authority

## Essential Commands
```bash
# Development
npm run dev                    # Start dev server at http://localhost:3000
npm run build                  # Production build with type checking
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Database
npx prisma migrate dev         # Create and apply migrations
npx prisma studio              # Open Prisma Studio GUI
npx prisma generate            # Regenerate Prisma Client
npx prisma db push             # Push schema changes (dev only)
```

---

## File Structure

```
day7-unit-converter/
├── app/                              # Next.js App Router
│   ├── actions/
│   │   └── conversions.ts            # 'use server' - All server actions
│   ├── page.tsx                      # Main page (Server Component)
│   ├── layout.tsx                    # Root layout with fonts
│   ├── error.tsx                     # Error boundary (Client)
│   ├── loading.tsx                   # Loading skeleton UI
│   ├── globals.css                   # Tailwind + theme variables
│   └── favicon.ico
│
├── components/                        # ← At project root
│   ├── converter-form.tsx            # Client Component - main form
│   ├── conversion-item.tsx           # Client Component - item card
│   ├── history-list.tsx              # Server Component - history
│   ├── favorites-list.tsx            # Server Component - favorites
│   └── ui/                           # shadcn/ui components
│       ├── button.tsx                # Button with variants
│       ├── card.tsx                  # Card container
│       ├── input.tsx                 # Number input
│       └── select.tsx                # Client Component - dropdown
│
├── lib/                               # ← At project root
│   ├── prisma.ts                     # Prisma Client singleton
│   ├── conversions.ts                # Conversion logic + validation
│   └── utils.ts                      # cn() utility
│
├── types/                             # ← At project root
│   └── conversion.ts                 # TypeScript type definitions
│
├── prisma/
│   └── schema.prisma                 # Database schema with indexes
│
└── Configuration Files
    ├── package.json                  # Dependencies and scripts
    ├── tsconfig.json                 # TypeScript config (strict)
    ├── next.config.ts                # Next.js config
    ├── components.json               # shadcn/ui config
    ├── eslint.config.mjs             # ESLint config
    ├── postcss.config.mjs            # PostCSS config
    └── .env                          # DATABASE_URL="file:./dev.db"
```

**IMPORTANT:** `components/`, `lib/`, and `types/` directories are at **project root**, NOT inside `app/`.

---

## TypeScript Type System

### Core Types (types/conversion.ts)

**Discriminated Union for Type Safety:**

```typescript
// Unit type definitions
export type LengthUnit = 'm' | 'km' | 'ft' | 'mi'
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz'
export type TemperatureUnit = 'C' | 'F' | 'K'
export type Category = 'length' | 'weight' | 'temperature'

// Conversion input (discriminated union by category)
export type ConversionInput =
  | { category: 'length'; value: number; fromUnit: LengthUnit; toUnit: LengthUnit }
  | { category: 'weight'; value: number; fromUnit: WeightUnit; toUnit: WeightUnit }
  | { category: 'temperature'; value: number; fromUnit: TemperatureUnit; toUnit: TemperatureUnit }

// Database result type
export interface ConversionResult {
  id: string
  category: Category
  value: number
  fromUnit: string
  toUnit: string
  result: number
  formula: string
  isFavorite: boolean
  createdAt: Date
}

// Server Action response pattern
export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }
```

**TypeScript Rules:**
- ✅ ALWAYS use discriminated unions for category-specific data
- ✅ Use strict literal types for units (never `string`)
- ✅ Enable `strict: true` in tsconfig.json
- ❌ NEVER use `any` type
- ❌ NEVER ignore TypeScript errors

---

## Database Schema (Prisma)

### Schema Definition (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Conversion {
  id          String   @id @default(cuid())
  category    String                           // 'length' | 'weight' | 'temperature'
  value       Float                            // Input value
  fromUnit    String                           // Source unit
  toUnit      String                           // Target unit
  result      Float                            // Conversion result
  formula     String                           // Human-readable formula
  isFavorite  Boolean  @default(false)         // Favorite flag
  createdAt   DateTime @default(now())         // Timestamp

  // Performance indexes
  @@index([isFavorite, createdAt(sort: Desc)])  // For getFavorites()
  @@index([createdAt(sort: Desc)])              // For getHistory()
}
```

**Database Configuration:**
- **Provider:** SQLite via `@prisma/adapter-libsql`
- **Client:** `@libsql/client` for connection
- **Location:** `dev.db` in project root
- **ID Strategy:** CUID (collision-resistant unique identifier)

### Prisma Client Singleton (lib/prisma.ts)

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

**Why Singleton?**
- Prevents multiple Prisma Client instances in development (hot reload)
- Avoids connection pool exhaustion
- Required for Next.js development mode

---

## Conversion Logic (lib/conversions.ts)

### Input Validation

```typescript
export function validateInput(input: ConversionInput): boolean {
  // 1. Reject NaN and Infinity
  if (!Number.isFinite(input.value)) {
    return false
  }

  // 2. Allow negative ONLY for temperature
  if (input.category !== 'temperature' && input.value < 0) {
    return false
  }

  return true
}
```

**Validation Rules:**

| Category | Negative | Zero | NaN/Infinity | Same Unit |
|----------|----------|------|--------------|-----------|
| Length | ❌ Reject | ✅ Allow | ❌ Reject | ✅ Allow |
| Weight | ❌ Reject | ✅ Allow | ❌ Reject | ✅ Allow |
| Temperature | ✅ **ALLOW** | ✅ Allow | ❌ Reject | ✅ Allow |

**Critical Edge Case:** `-40°C = -40°F` (must be allowed!)

### Length Conversions

**Base Unit:** Meter (m)

```typescript
const lengthRates: Record<LengthUnit, number> = {
  m: 1,
  km: 0.001,
  ft: 3.28084,
  mi: 0.000621371,
}
```

**Examples:**
- `100 m → 328.084 ft`
- `1 km → 1000 m`
- `1 mi → 5280 ft`

### Weight Conversions

**Base Unit:** Kilogram (kg)

```typescript
const weightRates: Record<WeightUnit, number> = {
  kg: 1,
  g: 1000,
  lb: 2.20462,
  oz: 35.274,
}
```

**Examples:**
- `1 kg → 2.20462 lb`
- `1000 g → 1 kg`
- `1 lb → 16 oz`

### Temperature Conversions

**Conversion via Celsius (intermediate unit):**

```typescript
// To Celsius
F → C: (°F - 32) × 5/9
K → C: K - 273.15

// From Celsius
C → F: (°C × 9/5) + 32
C → K: °C + 273.15
```

**Examples:**
- `0°C = 32°F`
- `0°C = 273.15K`
- `-40°C = -40°F` ← Critical edge case!
- `100°C = 212°F`

### Formula Generator

Generates human-readable conversion formulas:

```typescript
export function getFormula(category: Category, from: string, to: string): string
```

**Output Examples:**
- Length/Weight: `"1 kg = 2.204620 lb"`
- Temperature: `"(°C × 9/5) + 32 = °F"`
- Same unit: `"No conversion needed"`

---

## Server Actions (app/actions/conversions.ts)

All functions marked with `'use server'` directive.

### 1. createConversion(input: ConversionInput)

**Purpose:** Create new conversion record and save to database.

**Flow:**
1. Validate input with `validateInput()`
2. Calculate result with `convert()`
3. Generate formula with `getFormula()`
4. Save to database with Prisma
5. Call `revalidatePath('/')` to refresh UI
6. Return `ActionResponse<ConversionResult>`

**Error Handling:**
- Invalid input → `{ success: false, error: 'Invalid input...' }`
- Database error → `{ success: false, error: 'Failed to save conversion' }`

### 2. getHistory()

**Purpose:** Fetch last 10 conversions (newest first).

**Query:**
```typescript
await prisma.conversion.findMany({
  orderBy: { createdAt: 'desc' },
  take: 10,
})
```

**Returns:** `ConversionResult[]` (empty array on error)

### 3. getFavorites()

**Purpose:** Fetch all favorite conversions.

**Query:**
```typescript
await prisma.conversion.findMany({
  where: { isFavorite: true },
  orderBy: { createdAt: 'desc' },
})
```

**Returns:** `ConversionResult[]` (empty array on error)

### 4. toggleFavorite(id: string) - Race Condition Safe

**Purpose:** Toggle favorite status safely.

**Critical Implementation:**
```typescript
// ✅ CORRECT - Fetch current value from DB first
const current = await prisma.conversion.findUnique({ where: { id } })
if (!current) return { success: false, error: 'Not found' }

const updated = await prisma.conversion.update({
  where: { id },
  data: { isFavorite: !current.isFavorite }
})
```

**Why this matters:**
- ❌ BAD: `toggleFavorite(id, currentValue)` - client value may be stale
- ✅ GOOD: Fetch from database to avoid race conditions

**Returns:** `ActionResponse<ConversionResult>`

### 5. deleteConversion(id: string)

**Purpose:** Delete a conversion record.

**Flow:**
1. Validate ID
2. Delete with `prisma.conversion.delete()`
3. Call `revalidatePath('/')`
4. Return `ActionResponse<void>`

### 6. cleanupOldHistory() - Optional

**Purpose:** Auto-cleanup non-favorite records older than 7 days.

**Note:** Implemented but not currently called in the app.

---

## Component Architecture

### Server vs Client Components

**Server Components** (default in Next.js App Router):
- `app/page.tsx` - Main page with data fetching
- `components/history-list.tsx` - Renders history
- `components/favorites-list.tsx` - Renders favorites

**Client Components** (require `'use client'` directive):
- `components/converter-form.tsx` - Form with useState
- `components/conversion-item.tsx` - Buttons with onClick/useTransition
- `components/ui/select.tsx` - Radix UI dropdown
- `app/error.tsx` - Error boundary

**Rule:** Interactive features (onClick, useState, useTransition) MUST be in Client Components.

### Main Page (app/page.tsx)

**Data Fetching Pattern - Parallel Queries:**

```typescript
export default async function Home() {
  // ✅ GOOD - Parallel fetching with Promise.all
  const [history, favorites] = await Promise.all([
    getHistory(),
    getFavorites(),
  ])

  return (
    <>
      <ConverterForm />
      <HistoryList history={history} />
      <FavoritesList favorites={favorites} />
    </>
  )
}

// ❌ BAD - Sequential fetching (slower)
const history = await getHistory()
const favorites = await getFavorites()
```

**Layout Structure:**
- Grid layout: 3 columns on large screens, 1 column on mobile
- Converter form spans 2 columns
- History/Favorites sidebar in 1 column

### Converter Form (components/converter-form.tsx)

**Client Component Features:**
- `useState` for form state (category, value, units, result, error)
- `useTransition` for async createConversion action
- Real-time unit dropdown updates based on category
- Result display with formula
- Error message display

**State Management:**
```typescript
const [category, setCategory] = useState<Category>('length')
const [value, setValue] = useState<string>('')
const [fromUnit, setFromUnit] = useState<string>('m')
const [toUnit, setToUnit] = useState<string>('km')
const [result, setResult] = useState<string>('')
const [formula, setFormula] = useState<string>('')
const [error, setError] = useState<string>('')
const [isPending, startTransition] = useTransition()
```

### Conversion Item (components/conversion-item.tsx)

**Client Component with Interactive Buttons:**

```typescript
'use client'

interface Props {
  item: ConversionResult
  showDelete?: boolean  // default: true
}

export function ConversionItem({ item, showDelete = true }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(() => toggleFavorite(item.id))
  }

  const handleDelete = () => {
    startTransition(() => deleteConversion(item.id))
  }

  // Renders: conversion display, favorite button, delete button
}
```

**Features:**
- Favorite toggle (☆ / ⭐)
- Delete button (conditional)
- Formatted timestamp
- Conversion result display
- Formula display

### History List & Favorites List

**Server Components - No Interactivity:**

```typescript
// components/history-list.tsx
export default function HistoryList({ history }: { history: ConversionResult[] }) {
  if (history.length === 0) {
    return <p>No conversions yet</p>
  }

  return (
    <div>
      {history.map((item) => (
        <ConversionItem key={item.id} item={item} showDelete={true} />
      ))}
    </div>
  )
}
```

**Pattern:**
- Server Component fetches and passes data
- Delegates interactivity to Client Component (ConversionItem)
- Keeps Server Component simple and fast

---

## shadcn/ui Components

### Configuration (components.json)

```json
{
  "style": "new-york",
  "rsc": true,           // React Server Components enabled
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "zinc"
  },
  "iconLibrary": "lucide"
}
```

### Installed Components (components/ui/)

**1. Button (button.tsx)**
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon (icon-sm, icon-lg)
- Uses `class-variance-authority` for styling

**2. Card (card.tsx)**
- Subcomponents: Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter
- Used for conversion items, form container

**3. Input (input.tsx)**
- Number input with `type="number"`, `step="any"`
- Supports placeholder, aria-label for accessibility

**4. Select (select.tsx) - Client Component**
- Built on Radix UI primitives
- Animated dropdown with scroll buttons
- Subcomponents: Select, SelectTrigger, SelectContent, SelectItem, SelectValue, etc.

### Styling System

**Global CSS (app/globals.css):**
- Tailwind CSS v4 with PostCSS
- Custom CSS variables for theme colors
- Light/dark mode support via `.dark` class
- OKLCH color space for perceptual uniformity

**Theme Variables:**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --secondary: 240 4.8% 95.9%;
  /* ... 20+ more variables */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark mode overrides */
}
```

---

## Performance Optimizations

### 1. Parallel Data Fetching

**Always use Promise.all for independent queries:**
```typescript
// ✅ GOOD - Runs in parallel
const [history, favorites] = await Promise.all([getHistory(), getFavorites()])

// ❌ BAD - Sequential (2x slower)
const history = await getHistory()
const favorites = await getFavorites()
```

### 2. Database Indexes

**Composite indexes for query optimization:**
```prisma
@@index([isFavorite, createdAt(sort: Desc)])  // getFavorites query
@@index([createdAt(sort: Desc)])              // getHistory query
```

### 3. Server Components by Default

**Benefits:**
- No JavaScript shipped to client for non-interactive components
- Faster initial page load
- Direct database access (no API routes needed)

### 4. Loading States

**Loading UI (app/loading.tsx):**
- Skeleton loaders for form, history, and favorites
- Automatic via Next.js file convention
- Renders during Server Component streaming

### 5. Error Boundaries

**Error Handling (app/error.tsx):**
- Client Component with error boundary
- Retry functionality
- User-friendly error messages

---

## Testing Checklist

### Edge Cases

**Required Test Cases:**
- [x] `100 m → 328.084 ft` (length)
- [x] `1 kg → 2.20462 lb` (weight)
- [x] `0°C → 32°F` (temperature freezing point)
- [x] `0°C → 273.15K` (temperature absolute scale)
- [x] **`-40°C → -40°F`** (critical edge case!)
- [x] `NaN input` → shows error message
- [x] `Infinity input` → shows error message
- [x] `Same unit (m → m)` → returns original value
- [x] `0.0001 km → 0.1 m` (precision test)
- [x] `Negative length (-10 m)` → shows error
- [x] `Negative weight (-5 kg)` → shows error
- [x] `Negative temperature (-40°C)` → **ALLOWED**

### Database Tests

**Functionality Checklist:**
- [ ] History displays max 10 items (newest first)
- [ ] Favorites toggle works correctly
- [ ] Delete removes item from database
- [ ] Data persists after page refresh
- [ ] Race condition test: rapid favorite toggling
- [ ] Multiple users: simultaneous conversions

### UI/UX Tests

**User Experience:**
- [ ] Category change updates unit dropdowns
- [ ] Loading state displays during conversion
- [ ] Error messages are user-friendly
- [ ] Formula displays correctly for all types
- [ ] Mobile responsive layout
- [ ] Keyboard navigation works
- [ ] Empty states show helpful messages

---

## Common Mistakes & Best Practices

### ❌ MISTAKES TO AVOID

| Mistake | Why It's Wrong | Correct Approach |
|---------|----------------|------------------|
| `toggleFavorite(id, currentValue)` | Client value may be stale (race condition) | `toggleFavorite(id)` - fetch from DB |
| `await getHistory(); await getFavorites()` | Sequential fetching (slower) | `Promise.all([getHistory(), getFavorites()])` |
| `onClick` in Server Component | Not allowed in Server Components | Extract to Client Component |
| Reject `-40°C` as invalid | Negative temperatures are valid | Allow negative for temperature category |
| `fromUnit: string` in types | Loses type safety | Use `LengthUnit \| WeightUnit \| TemperatureUnit` |
| `components/` inside `app/` | Wrong file structure | `components/` at project root |
| Multiple Prisma Client instances | Connection pool exhaustion | Use singleton pattern |
| Forget `revalidatePath('/')` | UI doesn't update after mutation | Always call after DB writes |

### ✅ BEST PRACTICES

**1. TypeScript Type Safety**
```typescript
// ✅ GOOD - Discriminated union
type Input = { category: 'length'; fromUnit: LengthUnit }

// ❌ BAD - Stringly typed
type Input = { category: string; fromUnit: string }
```

**2. Server Action Error Handling**
```typescript
// ✅ GOOD - Try-catch with ActionResponse
try {
  const result = await prisma.conversion.create({ data })
  revalidatePath('/')
  return { success: true, data: result }
} catch (error) {
  console.error('Error:', error)
  return { success: false, error: 'User-friendly message' }
}
```

**3. Input Validation**
```typescript
// ✅ GOOD - Validate before processing
if (!validateInput(input)) {
  return { success: false, error: 'Invalid input' }
}
```

**4. Client Component Optimization**
```typescript
// ✅ GOOD - useTransition for async actions
const [isPending, startTransition] = useTransition()

const handleClick = () => {
  startTransition(() => serverAction())
}
```

---

## Development Workflow

### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up database
npx prisma generate
npx prisma migrate dev --name init

# 3. Start dev server
npm run dev
```

### Adding New Features

**1. Update Types (types/conversion.ts)**
- Add new unit types or categories
- Extend discriminated unions

**2. Update Conversion Logic (lib/conversions.ts)**
- Add conversion rates
- Implement conversion functions
- Update formula generator

**3. Update Database Schema (prisma/schema.prisma)**
```bash
npx prisma migrate dev --name add_new_field
```

**4. Update Server Actions (app/actions/conversions.ts)**
- Add new server actions if needed
- Always include error handling and revalidatePath

**5. Update UI Components**
- Keep Server/Client split in mind
- Use shadcn/ui components when possible

### Debugging

**Database Issues:**
```bash
npx prisma studio  # Visual database browser
npx prisma db push # Quick schema sync (dev only)
```

**Type Issues:**
```bash
npx tsc --noEmit  # Type check without building
```

**Build Issues:**
```bash
rm -rf .next       # Clear build cache
npm run build      # Full production build
```

---

## Quick Reference

### Component Types Summary

| Component | Type | Reason |
|-----------|------|--------|
| `page.tsx` | Server | Parallel data fetching with Promise.all |
| `layout.tsx` | Server | Static layout, no interactivity |
| `loading.tsx` | Server | Skeleton UI during Suspense |
| `error.tsx` | Client | Error boundary requires useEffect |
| `converter-form.tsx` | Client | useState, form handling, useTransition |
| `conversion-item.tsx` | Client | onClick, useTransition for actions |
| `history-list.tsx` | Server | Pure rendering, no interactivity |
| `favorites-list.tsx` | Server | Pure rendering, no interactivity |
| `ui/select.tsx` | Client | Radix UI requires client hooks |

### File Naming Conventions

- **kebab-case:** Component files (`converter-form.tsx`)
- **kebab-case:** Directories (`app/actions/`)
- **camelCase:** Function names (`getHistory`, `toggleFavorite`)
- **PascalCase:** Component names (`ConverterForm`, `ConversionItem`)
- **PascalCase:** Type names (`ConversionInput`, `ActionResponse`)

### Import Aliases

```typescript
import { prisma } from '@/lib/prisma'        // lib/
import { ConversionItem } from '@/components/conversion-item'  // components/
import type { ConversionInput } from '@/types/conversion'  // types/
```

**Configured in tsconfig.json:** `"@/*": ["./*"]`

---

## Environment Variables

### Required (.env)

```bash
DATABASE_URL="file:./dev.db"
```

### Optional

```bash
NODE_ENV="development"  # Auto-set by Next.js
```

---

## Git Workflow

### Current Status

**Branch:** `master` (no main branch configured)

**Recent Commits:**
1. `8a434f5` - Phase 2: Conversion logic complete
2. `3d7a31a` - Phase 1: Database setup complete
3. `e609ee7` - Initial project setup with plan
4. `3cb3014` - Initial Next.js scaffold

### Commit Message Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation update
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

---

## Additional Resources

### Documentation Links

- **Next.js 16:** https://nextjs.org/docs
- **React 19:** https://react.dev
- **Prisma:** https://www.prisma.io/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com
- **Radix UI:** https://www.radix-ui.com

### Project-Specific Patterns

**When to use Server Components:**
- Data fetching from database
- Static content rendering
- SEO-critical content

**When to use Client Components:**
- User interactions (click, input)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect, useTransition)
- Third-party libraries that require browser APIs

---

## Troubleshooting

### Common Issues

**1. "Prisma Client not generated"**
```bash
npx prisma generate
```

**2. "Database locked" error**
```bash
# Close Prisma Studio and restart dev server
```

**3. TypeScript errors after schema change**
```bash
npx prisma generate  # Regenerate Prisma types
```

**4. Components not updating after server action**
```typescript
// Ensure revalidatePath is called in server action
revalidatePath('/')
```

**5. "use client" error in Server Component**
```typescript
// Move interactive code to separate Client Component
```

---

This documentation reflects the actual implemented codebase as of Phase 2 completion. All code examples are from real files in the project.
