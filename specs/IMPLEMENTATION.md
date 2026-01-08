# Unit Converter - Implementation Plan

**Total Time:** 30-45 minutes
**Difficulty:** ⭐☆☆☆☆ (Level 1)

---

## Phase 1: Database Setup (5 min)

### 1.1 Create Directory Structure
- [ ] Create `prisma/` directory in project root
- [ ] Create `lib/` directory in project root (NOT in app/)
- [ ] Create `types/` directory in project root (NOT in app/)
- [ ] Create `components/` directory in project root (NOT in app/)

### 1.2 Define Prisma Schema
- [ ] Create `prisma/schema.prisma` file
- [ ] Add generator configuration: `generator client { provider = "prisma-client-js" }`
- [ ] Add datasource configuration: `datasource db { provider = "sqlite", url = env("DATABASE_URL") }`
- [ ] Define Conversion model with fields:
  - `id String @id @default(cuid())`
  - `category String` (length/weight/temperature)
  - `value Float`
  - `fromUnit String`
  - `toUnit String`
  - `result Float`
  - `formula String`
  - `isFavorite Boolean @default(false)`
  - `createdAt DateTime @default(now())`
- [ ] Add composite index for optimized queries:
  ```prisma
  @@index([isFavorite, createdAt(sort: Desc)])
  @@index([createdAt(sort: Desc)])
  ```

### 1.3 Configure Environment
- [ ] Create `.env` file in project root
- [ ] Add `DATABASE_URL="file:./dev.db"` to `.env`
- [ ] Verify `.env` is in `.gitignore`

### 1.4 Run Initial Migration
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Verify migration created in `prisma/migrations/` directory
- [ ] Confirm Prisma Client generated successfully
- [ ] Check `prisma/dev.db` file created

### 1.5 Create Prisma Client Singleton
- [ ] Create `lib/prisma.ts` file
- [ ] Import `PrismaClient` from `@prisma/client`
- [ ] Implement singleton pattern:
  ```typescript
  const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }
  export const prisma = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```

### Phase 1 Tests
- [ ] Test: Run `npx prisma studio` and verify database opens
- [ ] Test: Check Conversion table exists with correct schema
- [ ] Test: Verify no TypeScript errors in `lib/prisma.ts`

---

## Phase 2: Conversion Logic (8 min)

### 2.1 Define TypeScript Types (Discriminated Union)
- [ ] Create `types/conversion.ts` file
- [ ] Define unit types per category:
  ```typescript
  export type LengthUnit = 'm' | 'km' | 'ft' | 'mi'
  export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz'
  export type TemperatureUnit = 'C' | 'F' | 'K'
  export type Category = 'length' | 'weight' | 'temperature'
  ```
- [ ] Define discriminated union `ConversionInput`:
  ```typescript
  export type ConversionInput =
    | { category: 'length'; value: number; fromUnit: LengthUnit; toUnit: LengthUnit }
    | { category: 'weight'; value: number; fromUnit: WeightUnit; toUnit: WeightUnit }
    | { category: 'temperature'; value: number; fromUnit: TemperatureUnit; toUnit: TemperatureUnit }
  ```
- [ ] Define `ConversionResult` interface:
  ```typescript
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
  ```
- [ ] Define `ActionResponse<T>` type:
  ```typescript
  export type ActionResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string }
  ```
- [ ] Export all types

### 2.2 Create Conversion Functions
- [ ] Create `lib/conversions.ts` file
- [ ] Import types from `@/types/conversion`

### 2.3 Implement Input Validation
- [ ] Create `validateInput(input: ConversionInput): boolean` function
- [ ] Check `Number.isFinite(input.value)` for NaN/Infinity
- [ ] Allow negative values ONLY for temperature category
- [ ] Validate unit belongs to category
- [ ] Create `normalizeUnit(unit: string): string` to handle case-insensitivity

### 2.4 Implement Length Conversions
- [ ] Define `lengthRates` constant (base unit: meter):
  - `m: 1`
  - `km: 0.001`
  - `ft: 3.28084`
  - `mi: 0.000621371`
- [ ] Create `convertLength(value: number, from: LengthUnit, to: LengthUnit): number`
- [ ] Handle same unit conversion (return value unchanged)
- [ ] Convert: value → meters → target unit
- [ ] Return precise result (no rounding)

### 2.5 Implement Weight Conversions
- [ ] Define `weightRates` constant (base unit: kilogram):
  - `kg: 1`
  - `g: 1000`
  - `lb: 2.20462`
  - `oz: 35.274`
- [ ] Create `convertWeight(value: number, from: WeightUnit, to: WeightUnit): number`
- [ ] Handle same unit conversion
- [ ] Convert: value → kilograms → target unit
- [ ] Return precise result

### 2.6 Implement Temperature Conversions
- [ ] Create `convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number`
- [ ] Handle same unit conversion (return value unchanged)
- [ ] Implement all 6 conversion paths:
  - C → F: `(C × 9/5) + 32`
  - F → C: `(F - 32) × 5/9`
  - C → K: `C + 273.15`
  - K → C: `K - 273.15`
  - F → K: F → C → K
  - K → F: K → C → F
- [ ] **IMPORTANT:** Allow negative values (-40°C is valid!)

### 2.7 Create Main Conversion Function
- [ ] Create `convert(input: ConversionInput): number`
- [ ] Use switch on `input.category` (TypeScript narrows types automatically)
- [ ] Call appropriate conversion function
- [ ] Handle edge cases:
  - [ ] Zero value → returns zero
  - [ ] Very small numbers (0.0001) → maintain precision
  - [ ] Very large numbers (1,000,000+) → no overflow

### 2.8 Create Formula Generator
- [ ] Create `getFormula(category: Category, from: string, to: string): string`
- [ ] For same unit: Return "No conversion needed"
- [ ] For length/weight: Return rate-based formula (e.g., "1 m = 3.28084 ft")
- [ ] For temperature: Return equation formula (e.g., "(°C × 9/5) + 32 = °F")

### Phase 2 Tests
- [ ] Test: `convertLength(100, 'm', 'ft')` returns `328.084`
- [ ] Test: `convertWeight(1, 'kg', 'lb')` returns `2.20462`
- [ ] Test: `convertTemperature(0, 'C', 'F')` returns `32`
- [ ] Test: `convertTemperature(0, 'C', 'K')` returns `273.15`
- [ ] Test: `convertTemperature(-40, 'C', 'F')` returns `-40` (edge case!)
- [ ] Test: Same unit conversion returns original value
- [ ] Test: `validateInput` rejects NaN and Infinity
- [ ] Test: `validateInput` rejects negative length/weight
- [ ] Test: `validateInput` allows negative temperature
- [ ] Test: Very small number `convertLength(0.0001, 'km', 'm')` returns `0.1`

---

## Phase 3: Server Actions (7 min)

### 3.1 Create Server Actions File
- [ ] Create `app/actions/conversions.ts` file
- [ ] Add `'use server'` directive at top of file
- [ ] Import Prisma client: `import { prisma } from '@/lib/prisma'`
- [ ] Import conversion functions: `import { convert, getFormula, validateInput } from '@/lib/conversions'`
- [ ] Import types: `import type { ConversionInput, ConversionResult, ActionResponse } from '@/types/conversion'`
- [ ] Import `revalidatePath` from `next/cache`

### 3.2 Implement createConversion Action
- [ ] Create async function: `createConversion(input: ConversionInput): Promise<ActionResponse<ConversionResult>>`
- [ ] Validate input with `validateInput(input)`
- [ ] Call `convert(input)` to calculate result
- [ ] Call `getFormula()` to generate formula string
- [ ] Wrap database call in try-catch block
- [ ] Create conversion record with `prisma.conversion.create()`
- [ ] Call `revalidatePath('/')` to refresh Server Components
- [ ] Return `{ success: true, data: result }` or `{ success: false, error: message }`

### 3.3 Implement getHistory Action
- [ ] Create async function: `getHistory(): Promise<ConversionResult[]>`
- [ ] Query with `prisma.conversion.findMany()`
- [ ] Order by `createdAt` descending
- [ ] Limit to 10 results with `take: 10`
- [ ] Wrap in try-catch block
- [ ] Return array or empty array on error

### 3.4 Implement getFavorites Action
- [ ] Create async function: `getFavorites(): Promise<ConversionResult[]>`
- [ ] Query with `prisma.conversion.findMany()`
- [ ] Filter with `where: { isFavorite: true }`
- [ ] Order by `createdAt` descending
- [ ] Wrap in try-catch block
- [ ] Return array or empty array on error

### 3.5 Implement toggleFavorite Action (Race Condition Safe)
- [ ] Create async function: `toggleFavorite(id: string): Promise<ActionResponse<ConversionResult>>`
- [ ] Validate id is not empty
- [ ] **IMPORTANT:** Fetch current value from database first:
  ```typescript
  const current = await prisma.conversion.findUnique({ where: { id } })
  if (!current) return { success: false, error: 'Not found' }
  ```
- [ ] Update with toggled value: `isFavorite: !current.isFavorite`
- [ ] Wrap in try-catch block
- [ ] Call `revalidatePath('/')` after successful update
- [ ] Return `{ success: true, data: updated }` or `{ success: false, error: message }`

### 3.6 Implement deleteConversion Action
- [ ] Create async function: `deleteConversion(id: string): Promise<ActionResponse<void>>`
- [ ] Validate id is not empty
- [ ] Delete record with `prisma.conversion.delete()`
- [ ] Wrap in try-catch block
- [ ] Call `revalidatePath('/')` after successful deletion
- [ ] Return `{ success: true, data: undefined }` or `{ success: false, error: message }`

### 3.7 Implement cleanupOldHistory Action (Optional)
- [ ] Create async function: `cleanupOldHistory(): Promise<void>`
- [ ] Delete non-favorite records older than 7 days:
  ```typescript
  await prisma.conversion.deleteMany({
    where: {
      isFavorite: false,
      createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  })
  ```
- [ ] Call after `createConversion` (optional, for cleanup)

### Phase 3 Tests
- [ ] Test: `createConversion()` saves to database
- [ ] Test: `createConversion()` rejects invalid input (NaN, negative length)
- [ ] Test: `createConversion()` accepts negative temperature
- [ ] Test: `getHistory()` returns max 10 items
- [ ] Test: `getFavorites()` only returns favorited items
- [ ] Test: `toggleFavorite()` fetches current value before toggle (no race condition)
- [ ] Test: `deleteConversion()` removes record from database
- [ ] Test: Error handling returns proper error messages

---

## Phase 4: UI Components (15 min)

### 4.1 Install shadcn/ui Components
- [ ] Run `npx shadcn-ui@latest init` (if not already initialized)
- [ ] Install required components:
  - `npx shadcn-ui@latest add button`
  - `npx shadcn-ui@latest add input`
  - `npx shadcn-ui@latest add select`
  - `npx shadcn-ui@latest add card`

### 4.2 Create ConverterForm Component (Client Component)
- [ ] Create `components/converter-form.tsx` file
- [ ] Add `'use client'` directive at top
- [ ] Import React hooks: `useState, useTransition`
- [ ] Import Server Action: `import { createConversion } from '@/app/actions/conversions'`
- [ ] Import shadcn components: Button, Input, Select, Card
- [ ] Import types from `@/types/conversion`

### 4.3 Implement Form State
- [ ] Define state: `category` (default: 'length')
- [ ] Define state: `value` (default: '')
- [ ] Define state: `fromUnit` (default: 'm')
- [ ] Define state: `toUnit` (default: 'ft')
- [ ] Define state: `result` (default: null)
- [ ] Define state: `formula` (default: '')
- [ ] Define state: `error` (default: '')
- [ ] Use `useTransition()` for loading state

### 4.4 Create Unit Options by Category
- [ ] Define `unitOptions` constant with typed arrays:
  ```typescript
  const unitOptions = {
    length: ['m', 'km', 'ft', 'mi'] as const,
    weight: ['kg', 'g', 'lb', 'oz'] as const,
    temperature: ['C', 'F', 'K'] as const,
  }
  ```
- [ ] Create `unitLabels` map for display names:
  ```typescript
  const unitLabels: Record<string, string> = {
    m: 'Meter (m)', km: 'Kilometer (km)', ft: 'Feet (ft)', mi: 'Mile (mi)',
    kg: 'Kilogram (kg)', g: 'Gram (g)', lb: 'Pound (lb)', oz: 'Ounce (oz)',
    C: 'Celsius (°C)', F: 'Fahrenheit (°F)', K: 'Kelvin (K)',
  }
  ```

### 4.5 Implement Category Change Handler
- [ ] Create `handleCategoryChange` function
- [ ] Update category state
- [ ] Reset fromUnit to first unit in new category
- [ ] Reset toUnit to second unit in new category
- [ ] Clear result, formula, and error

### 4.6 Implement Form Submission
- [ ] Create `handleSubmit` async function
- [ ] Validate value is not empty
- [ ] Parse value to float
- [ ] Build `ConversionInput` object with correct category type
- [ ] Call `createConversion()` Server Action with `startTransition`
- [ ] Handle response: set result and formula on success
- [ ] Handle response: set error message on failure
- [ ] Display result formatted to 2 decimal places

### 4.7 Build Form UI
- [ ] Wrap in Card component
- [ ] Add heading: "Unit Converter"
- [ ] Create category Select dropdown (length/weight/temperature)
- [ ] Create value Input field (type="number", allow negative for temperature)
- [ ] Create fromUnit Select dropdown
- [ ] Create toUnit Select dropdown
- [ ] Add Convert Button (shows loading state during transition)
- [ ] Display result section (conditional)
- [ ] Display formula section (conditional)
- [ ] Display error message (conditional)

### 4.8 Add Styling & Accessibility
- [ ] Use Tailwind classes for responsive layout
- [ ] Add proper labels for all form fields
- [ ] Add ARIA labels for screen readers
- [ ] Show focus states on interactive elements
- [ ] Disable submit button when loading

### 4.9 Create ConversionItem Component (Client Component for interactions)
- [ ] Create `components/conversion-item.tsx` file
- [ ] Add `'use client'` directive
- [ ] Import Server Actions: `toggleFavorite`, `deleteConversion`
- [ ] Accept props: `item: ConversionResult`, `showDelete?: boolean`
- [ ] Implement star button to toggle favorite
- [ ] Implement delete button (optional)
- [ ] Use `useTransition` for loading states
- [ ] Display: value, fromUnit → toUnit, result, formula, timestamp

### 4.10 Create HistoryList Component (Server Component)
- [ ] Create `components/history-list.tsx` file
- [ ] No `'use client'` directive (Server Component)
- [ ] Import `ConversionItem` (Client Component)
- [ ] Accept props: `history: ConversionResult[]` (passed from page)
- [ ] Handle empty state (no history yet)
- [ ] Map through history items using `ConversionItem`
- [ ] Wrap in Card component with heading "Recent History"

### 4.11 Create FavoritesList Component (Server Component)
- [ ] Create `components/favorites-list.tsx` file
- [ ] No `'use client'` directive (Server Component)
- [ ] Import `ConversionItem` (Client Component)
- [ ] Accept props: `favorites: ConversionResult[]` (passed from page)
- [ ] Handle empty state (no favorites yet)
- [ ] Map through favorite items using `ConversionItem`
- [ ] Wrap in Card component with heading "Favorites"

### Phase 4 Tests
- [ ] Test: Category selector changes available units
- [ ] Test: Form allows negative values for temperature
- [ ] Test: Form submission creates conversion
- [ ] Test: Result displays with 2 decimal places
- [ ] Test: Formula displays correctly
- [ ] Test: Error messages show for invalid input
- [ ] Test: Star button toggles favorite status
- [ ] Test: Delete button removes history item
- [ ] Test: All components are responsive on mobile

---

## Phase 5: Integration & Polish (10 min)

### 5.1 Update Main Page (with Promise.all)
- [ ] Open `app/page.tsx` file
- [ ] Import components from `@/components/`
- [ ] Import Server Actions: `getHistory`, `getFavorites`
- [ ] **IMPORTANT:** Fetch data in parallel with `Promise.all`:
  ```typescript
  export default async function Home() {
    const [history, favorites] = await Promise.all([
      getHistory(),
      getFavorites()
    ])
    return (
      // ... pass data as props
    )
  }
  ```
- [ ] Remove default Next.js boilerplate
- [ ] Keep as Server Component (no `'use client'`)

### 5.2 Create Page Layout
- [ ] Create main container with max-width and padding
- [ ] Add page title: "Unit Converter"
- [ ] Create responsive grid layout:
  - Mobile (< 768px): Single column
  - Tablet (768px - 1024px): Two columns
  - Desktop (> 1024px): `ConverterForm` (wider) + sidebar (History + Favorites)
- [ ] Pass fetched data to child components as props

### 5.3 Update Global Styles
- [ ] Open `app/globals.css`
- [ ] Ensure Tailwind directives are present
- [ ] Add custom CSS variables if needed (shadcn theme)
- [ ] Set background color for page
- [ ] Configure font family

### 5.4 Add Loading States
- [ ] Create `app/loading.tsx` for page-level loading
- [ ] Add Suspense boundaries around async components (optional)
- [ ] Show skeleton loaders for history/favorites while loading

### 5.5 Add Error Handling
- [ ] Create `app/error.tsx` for page-level errors
- [ ] Display user-friendly error messages
- [ ] Add retry functionality for failed actions

### 5.6 Responsive Design Checks
- [ ] Test on mobile viewport (320px - 768px)
- [ ] Test on tablet viewport (768px - 1024px)
- [ ] Test on desktop viewport (> 1024px)
- [ ] Ensure touch targets are at least 44x44px
- [ ] Verify text is readable at all sizes

### 5.7 Accessibility Audit
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Verify all interactive elements are focusable
- [ ] Check focus indicators are visible
- [ ] Verify ARIA labels are descriptive
- [ ] Ensure color contrast meets WCAG AA standards

### 5.8 Performance Optimization
- [ ] Run `npm run build` to check bundle size
- [ ] Verify no console errors in browser
- [ ] Ensure Server Components are used by default
- [ ] Minimize Client Component JavaScript (only interactive parts)

### Phase 5 Tests
- [ ] Test: Page loads without errors
- [ ] Test: All three components render correctly
- [ ] Test: Data fetched in parallel (check Network tab)
- [ ] Test: Layout is responsive on all screen sizes
- [ ] Test: Keyboard navigation works throughout app
- [ ] Test: Conversions persist after page refresh
- [ ] Test: No TypeScript errors in build
- [ ] Test: No console errors in browser

---

## Final Testing Checklist

### Functional Testing
- [ ] Length: 100m = 328.08ft (±0.01)
- [ ] Weight: 1kg = 2.20462lb (±0.00001)
- [ ] Temperature: 0°C = 32°F (exact)
- [ ] Temperature: 0°C = 273.15K (exact)
- [ ] **Temperature: -40°C = -40°F (edge case!)**
- [ ] Edge: Zero value converts to zero
- [ ] Edge: Very large numbers (1,000,000+) work
- [ ] Edge: Very small numbers (0.0001) maintain precision
- [ ] Edge: Same unit conversion returns original value
- [ ] Edge: NaN/Infinity rejected with error message
- [ ] History saves after each conversion
- [ ] History displays last 10 conversions only
- [ ] Favorites toggle works (star/unstar)
- [ ] Favorites persist after page refresh
- [ ] Formula displays correctly for each conversion

### Database Testing
- [ ] Run `npx prisma studio` and verify data
- [ ] Check createdAt timestamps are correct
- [ ] Verify isFavorite field updates
- [ ] Confirm deletions work properly
- [ ] Test data persists after dev server restart

### TypeScript & Code Quality
- [ ] Run `npm run build` successfully
- [ ] Zero TypeScript errors
- [ ] No `any` types used
- [ ] Discriminated union types working correctly
- [ ] All functions have return types
- [ ] All imports use `@/` path alias

### Performance Testing
- [ ] Conversion completes in < 500ms
- [ ] Page loads in < 2 seconds
- [ ] Parallel data fetching verified (Promise.all)
- [ ] No memory leaks during extended use

### Browser Compatibility
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)

---

## Updated File Structure

```
project-root/
├── app/
│   ├── actions/
│   │   └── conversions.ts      # 'use server' - all mutations
│   ├── page.tsx                # Server Component - main page
│   ├── loading.tsx             # Page loading state
│   ├── error.tsx               # Page error boundary
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/                  # ← Moved OUT of app/
│   ├── converter-form.tsx      # 'use client' - interactive form
│   ├── conversion-item.tsx     # 'use client' - item with buttons
│   ├── history-list.tsx        # Server Component - list wrapper
│   └── favorites-list.tsx      # Server Component - list wrapper
├── lib/                         # ← Moved OUT of app/
│   ├── prisma.ts               # Singleton Prisma client
│   ├── conversions.ts          # Pure conversion functions
│   └── utils.ts                # shadcn utils
├── types/                       # ← Moved OUT of app/
│   └── conversion.ts           # TypeScript type definitions
├── prisma/
│   ├── schema.prisma           # DB schema
│   └── migrations/             # Auto-generated
└── .env                         # Environment variables
```

---

## Completion Criteria

### Must Have ✅
- [ ] All 3 conversion categories working
- [ ] Negative temperature values supported
- [ ] Input validation (NaN, Infinity rejected)
- [ ] Database persistence with Prisma + SQLite
- [ ] History displays last 10 conversions
- [ ] Favorites can be toggled (race-condition safe)
- [ ] Discriminated union types for type safety
- [ ] Server Actions properly marked with 'use server'
- [ ] Client Components properly marked with 'use client'
- [ ] Interactive buttons in separate Client Components
- [ ] Parallel data fetching with Promise.all
- [ ] TypeScript strict mode enabled
- [ ] No TypeScript errors
- [ ] Responsive on mobile, tablet, desktop

### Nice to Have 🎯
- [ ] Real-time conversion (no button click needed)
- [ ] Dark mode support
- [ ] Auto-cleanup of old history (7 days)
- [ ] Click history item to reuse values
- [ ] Smooth animations and transitions
- [ ] Toast notifications for actions

---

## Notes & Reminders

**CRITICAL:**
- Allow negative values for temperature (음수 온도 허용!)
- Use `Number.isFinite()` to check for NaN/Infinity
- Fetch current value in `toggleFavorite` before toggling (race condition 방지)
- Use `Promise.all` for parallel data fetching
- Keep interactive buttons in Client Components

**IMPORTANT:**
- Components directory is at project root, NOT inside app/
- Use discriminated union types for ConversionInput
- Run `npx prisma migrate dev` after schema changes
- Test -40°C = -40°F conversion

**COMMON MISTAKES TO AVOID:**
- ❌ Passing `currentValue` from client to `toggleFavorite`
- ❌ Fetching history and favorites sequentially
- ❌ Putting toggle/delete buttons directly in Server Components
- ❌ Rejecting negative temperature values
- ❌ Using `string` instead of union types for units
