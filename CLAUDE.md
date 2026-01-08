# Unit Converter - Claude Instructions

## Project Overview
Next.js 14 App Router application for unit conversions (length, weight, temperature) with SQLite persistence via Prisma.

## Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript (strict mode)
- **Database:** Prisma ORM + SQLite
- **UI:** shadcn/ui + Tailwind CSS
- **Components:** React Server Components (default)

## Essential Commands
```bash
npm run dev                    # Development server
npm run build                  # Production build
npx prisma migrate dev         # Create/apply migrations
npx prisma studio              # Open database GUI
npx prisma generate            # Generate Prisma Client
```

---

## File Structure

```
project-root/
├── app/
│   ├── actions/conversions.ts  # 'use server' - mutations only
│   ├── page.tsx                # Server Component - main page
│   └── globals.css
├── components/                  # ← Project root (NOT in app/)
│   ├── converter-form.tsx      # 'use client' - form
│   ├── conversion-item.tsx     # 'use client' - item buttons
│   ├── history-list.tsx        # Server Component
│   └── favorites-list.tsx      # Server Component
├── lib/                         # ← Project root (NOT in app/)
│   ├── prisma.ts
│   └── conversions.ts
├── types/                       # ← Project root (NOT in app/)
│   └── conversion.ts
└── prisma/
    └── schema.prisma
```

IMPORTANT: `components/`, `lib/`, `types/` are at project root, NOT inside `app/`.

---

## TypeScript Rules

YOU MUST use discriminated union types for type safety:

```typescript
// types/conversion.ts
export type LengthUnit = 'm' | 'km' | 'ft' | 'mi'
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz'
export type TemperatureUnit = 'C' | 'F' | 'K'

export type ConversionInput =
  | { category: 'length'; value: number; fromUnit: LengthUnit; toUnit: LengthUnit }
  | { category: 'weight'; value: number; fromUnit: WeightUnit; toUnit: WeightUnit }
  | { category: 'temperature'; value: number; fromUnit: TemperatureUnit; toUnit: TemperatureUnit }

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }
```

NEVER:
- Use `any` type
- Use `string` for unit types (use union types)
- Ignore TypeScript errors

---

## Input Validation Rules

CRITICAL - Edge Cases:

```typescript
function validateInput(input: ConversionInput): boolean {
  // 1. Check for NaN/Infinity
  if (!Number.isFinite(input.value)) return false

  // 2. Allow negative ONLY for temperature
  if (input.category !== 'temperature' && input.value < 0) return false

  return true
}
```

YOU MUST handle:
- [ ] NaN → reject with error
- [ ] Infinity → reject with error
- [ ] Negative temperature → **ALLOW** (e.g., -40°C is valid!)
- [ ] Negative length/weight → reject with error
- [ ] Zero value → allow (returns 0)
- [ ] Very small numbers (0.0001) → maintain precision
- [ ] Same unit conversion → return original value

**Test case:** `-40°C = -40°F` (this is a real edge case!)

---

## Server Actions Rules

### toggleFavorite - Race Condition Safe

NEVER pass `currentValue` from client:
```typescript
// ❌ BAD - Race condition possible
export async function toggleFavorite(id: string, currentValue: boolean) {
  await prisma.conversion.update({
    where: { id },
    data: { isFavorite: !currentValue }  // Client value may be stale!
  })
}

// ✅ GOOD - Fetch current value from database
export async function toggleFavorite(id: string) {
  const current = await prisma.conversion.findUnique({ where: { id } })
  if (!current) return { success: false, error: 'Not found' }

  const updated = await prisma.conversion.update({
    where: { id },
    data: { isFavorite: !current.isFavorite }
  })
  revalidatePath('/')
  return { success: true, data: updated }
}
```

### All Server Actions MUST:
- Mark file with `'use server'` at top
- Validate inputs before processing
- Wrap database calls in try-catch
- Call `revalidatePath('/')` after mutations
- Return `ActionResponse<T>` type

---

## Component Architecture

### Server/Client Split Pattern

Interactive buttons MUST be in Client Components:

```typescript
// components/history-list.tsx (Server Component)
export default function HistoryList({ history }: { history: ConversionResult[] }) {
  return (
    <div>
      {history.map(item => (
        <ConversionItem key={item.id} item={item} />  // ← Client Component
      ))}
    </div>
  )
}

// components/conversion-item.tsx (Client Component)
'use client'
export function ConversionItem({ item }: { item: ConversionResult }) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(() => toggleFavorite(item.id))
  }

  return (
    <div>
      {/* Display item */}
      <button onClick={handleToggle}>⭐</button>
    </div>
  )
}
```

NEVER put `onClick`, `useState`, or `useTransition` in Server Components.

---

## Performance Rules

### Parallel Data Fetching

ALWAYS use `Promise.all` for independent queries:

```typescript
// app/page.tsx
export default async function Home() {
  // ✅ GOOD - Parallel fetching
  const [history, favorites] = await Promise.all([
    getHistory(),
    getFavorites()
  ])

  return (
    <ConverterForm />
    <HistoryList history={history} />
    <FavoritesList favorites={favorites} />
  )
}
```

```typescript
// ❌ BAD - Sequential fetching (slower)
const history = await getHistory()
const favorites = await getFavorites()
```

---

## Prisma Rules

### Composite Index for Performance

```prisma
model Conversion {
  // ... fields

  @@index([isFavorite, createdAt(sort: Desc)])  // For getFavorites
  @@index([createdAt(sort: Desc)])              // For getHistory
}
```

### Singleton Pattern

```typescript
// lib/prisma.ts
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

NEVER:
- Query Prisma in Client Components
- Create multiple Prisma instances
- Forget to run migrations after schema changes

---

## Testing Requirements

### Must Test These Edge Cases:
- [ ] `100m = 328.08ft`
- [ ] `1kg = 2.20462lb`
- [ ] `0°C = 32°F`
- [ ] `0°C = 273.15K`
- [ ] **`-40°C = -40°F`** (critical edge case!)
- [ ] NaN input → shows error
- [ ] Infinity input → shows error
- [ ] Same unit (m → m) → returns original value
- [ ] Very small: `0.0001 km → 0.1 m`

### Database Tests:
- [ ] History saves and displays max 10 items
- [ ] Favorites toggle works (check for race conditions)
- [ ] Data persists after page refresh

---

## Common Mistakes to Avoid

| Mistake | Correct Approach |
|---------|------------------|
| ❌ `toggleFavorite(id, currentValue)` | ✅ `toggleFavorite(id)` - fetch from DB |
| ❌ Sequential `await getHistory(); await getFavorites()` | ✅ `Promise.all([getHistory(), getFavorites()])` |
| ❌ `onClick` in Server Component | ✅ Extract to Client Component |
| ❌ Reject `-40°C` as invalid | ✅ Allow negative temperature |
| ❌ `fromUnit: string` | ✅ `fromUnit: LengthUnit \| WeightUnit \| TemperatureUnit` |
| ❌ `components/` inside `app/` | ✅ `components/` at project root |

---

## Quick Reference

### Component Types
| Component | Type | Why |
|-----------|------|-----|
| `page.tsx` | Server | Data fetching with Promise.all |
| `ConverterForm` | Client | useState, form handling |
| `ConversionItem` | Client | onClick, useTransition |
| `HistoryList` | Server | Just renders, no interaction |
| `FavoritesList` | Server | Just renders, no interaction |

### Validation by Category
| Category | Negative | Zero | NaN/Infinity |
|----------|----------|------|--------------|
| Length | ❌ Reject | ✅ Allow | ❌ Reject |
| Weight | ❌ Reject | ✅ Allow | ❌ Reject |
| Temperature | ✅ **Allow** | ✅ Allow | ❌ Reject |
