# Unit Converter - Product Requirements Document

## Project Overview

**Name:** Unit Converter App  
**Type:** Web Application (Next.js)  
**Target:** Students, professionals, anyone needing quick conversions  
**Timeline:** Day 7 (30-45 minutes)  
**Level:** 1 (Easy)

---

## Tech Stack

**Framework & Language:**
- Next.js 14 (App Router)
- TypeScript
- React Server Components

**Database:**
- SQLite (via Prisma)
- Prisma ORM

**UI:**
- shadcn/ui (button, input, select, card)
- Tailwind CSS

**Structure:**
```
app/
├── actions/
│   └── conversions.ts      (Server Actions)
├── components/
│   ├── converter-form.tsx
│   ├── history-list.tsx
│   └── favorites-list.tsx
├── lib/
│   ├── prisma.ts
│   └── utils.ts
└── page.tsx                (Main page)

prisma/
└── schema.prisma           (DB schema)
```

---

## Features

### 1. Conversion Types

**Length:**
- Meter (m)
- Kilometer (km)
- Feet (ft)
- Mile (mi)

**Weight:**
- Kilogram (kg)
- Gram (g)
- Pound (lb)
- Ounce (oz)

**Temperature:**
- Celsius (°C)
- Fahrenheit (°F)
- Kelvin (K)

### 2. Conversion UI

```
┌─────────────────────────────────────┐
│ Unit Converter                      │
├─────────────────────────────────────┤
│                                     │
│ Category: [Length ▼]                │
│                                     │
│ From: [100] [Meter ▼]              │
│                                     │
│ To:   [328.08] [Feet ▼]            │
│                                     │
│ Formula: 1 m = 3.28084 ft           │
│                                     │
│ [Convert] [⭐ Favorite]             │
│                                     │
└─────────────────────────────────────┘
```

### 3. Conversion History

**Display:**
- Last 10 conversions
- Show: value, from unit, to unit, result, timestamp
- Click to reuse

**Storage:**
- SQLite database
- Auto-save on conversion

### 4. Favorites

**Functionality:**
- Save frequently used conversions
- Quick access
- Remove from favorites

---

## Database Schema

```prisma
model Conversion {
  id          String   @id @default(cuid())
  category    String   // "length", "weight", "temperature"
  value       Float
  fromUnit    String
  toUnit      String
  result      Float
  formula     String
  isFavorite  Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

**Fields:**
- `id`: Unique identifier
- `category`: Conversion type
- `value`: Input value
- `fromUnit`: Source unit
- `toUnit`: Target unit
- `result`: Converted value
- `formula`: Conversion formula display
- `isFavorite`: Favorite flag
- `createdAt`: Timestamp

---

## TypeScript Types

```typescript
// types/conversion.ts
export type Category = 'length' | 'weight' | 'temperature';

export type Unit = {
  length: 'm' | 'km' | 'ft' | 'mi';
  weight: 'kg' | 'g' | 'lb' | 'oz';
  temperature: 'C' | 'F' | 'K';
};

export type ConversionInput = {
  category: Category;
  value: number;
  fromUnit: string;
  toUnit: string;
};

export type ConversionResult = {
  id: string;
  category: Category;
  value: number;
  fromUnit: string;
  toUnit: string;
  result: number;
  formula: string;
  isFavorite: boolean;
  createdAt: Date;
};
```

---

## Conversion Logic

### Length Conversions
```typescript
const lengthRates = {
  m: 1,
  km: 0.001,
  ft: 3.28084,
  mi: 0.000621371,
};
```

### Weight Conversions
```typescript
const weightRates = {
  kg: 1,
  g: 1000,
  lb: 2.20462,
  oz: 35.274,
};
```

### Temperature Conversions
```typescript
// Special formulas
C to F: (C × 9/5) + 32
F to C: (F - 32) × 5/9
C to K: C + 273.15
K to C: K - 273.15
```

---

## Server Actions

**File:** `app/actions/conversions.ts`

```typescript
'use server'

export async function createConversion(input: ConversionInput) {
  // Calculate result
  // Save to database
  // Return result
}

export async function getHistory() {
  // Fetch last 10 conversions
}

export async function getFavorites() {
  // Fetch favorite conversions
}

export async function toggleFavorite(id: string) {
  // Toggle isFavorite field
}

export async function deleteConversion(id: string) {
  // Delete from database
}
```

---

## Component Structure

### ConverterForm (Client Component)
```typescript
'use client'

export default function ConverterForm() {
  // State: category, value, fromUnit, toUnit
  // Handle form submission
  // Call Server Action
  // Display result
}
```

### HistoryList (Server Component)
```typescript
export default async function HistoryList() {
  const history = await getHistory();
  // Render list
}
```

### FavoritesList (Server Component)
```typescript
export default async function FavoritesList() {
  const favorites = await getFavorites();
  // Render list
}
```

---

## Implementation Phases

### Phase 1: Database Setup (5 min)
- Create Prisma schema
- Run migration: `npx prisma migrate dev`
- Set up Prisma client (`lib/prisma.ts`)

### Phase 2: Conversion Logic (8 min)
- Create conversion functions
- Length/Weight/Temperature formulas
- Formula display strings
- Unit tests

### Phase 3: Server Actions (7 min)
- `createConversion()`
- `getHistory()`
- `getFavorites()`
- `toggleFavorite()`
- `deleteConversion()`

### Phase 4: UI Components (15 min)
- `ConverterForm` with shadcn/ui
- Category selector
- Unit selectors
- Result display
- `HistoryList` component
- `FavoritesList` component

### Phase 5: Main Page & Polish (10 min)
- Layout in `app/page.tsx`
- Integrate components
- Responsive design
- Error handling
- Loading states

---

## UI/UX Requirements

**Responsive:**
- Mobile: 320px+
- Tablet: 768px+
- Desktop: 1024px+

**Interactions:**
- Real-time conversion (on input change)
- Click history item → reuse
- ⭐ button → toggle favorite
- Smooth animations (Tailwind transitions)

**Accessibility:**
- Keyboard navigation
- ARIA labels
- Focus states
- Error messages

---

## Critical Rules

**IMPORTANT:**
- Server Actions MUST be marked `'use server'`
- Client Components MUST be marked `'use client'`
- Prisma client MUST be singleton pattern
- Conversions MUST be accurate (use precise formulas)
- History MUST auto-save after each conversion

**YOU MUST:**
- Validate input (number only, positive values)
- Handle division by zero
- Format numbers to 2 decimal places
- Use TypeScript strict mode
- Handle Prisma errors gracefully

**NEVER:**
- Put Prisma queries in Client Components
- Forget to run migrations
- Use `any` type
- Ignore TypeScript errors
- Hardcode database paths

**ALWAYS:**
- Use Server Components by default
- Mark Client Components explicitly
- Validate form inputs
- Handle edge cases (0, negative, very large numbers)
- Show loading states

---

## Success Criteria

**Functional:**
- [ ] All 3 categories convert correctly
- [ ] History saves to database
- [ ] Favorites toggle works
- [ ] Formula displays correctly
- [ ] History loads on page load

**Non-Functional:**
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Fast (< 500ms conversions)
- [ ] Accessible (keyboard nav)

**Database:**
- [ ] Migrations run successfully
- [ ] Data persists across refreshes
- [ ] No duplicate entries

---

## Testing Checklist

**Conversions:**
- [ ] 100m = 328.08ft
- [ ] 1kg = 2.20462lb
- [ ] 0°C = 32°F
- [ ] 0°C = 273.15K
- [ ] Edge: 0 value
- [ ] Edge: Very large numbers

**Database:**
- [ ] History saves
- [ ] History loads on refresh
- [ ] Favorites persist
- [ ] Delete works

**UI:**
- [ ] Category change updates units
- [ ] Real-time conversion
- [ ] History click reuses values
- [ ] Favorite button toggles

---

## File Checklist

```
day7-unit-converter/
├── app/
│   ├── actions/
│   │   └── conversions.ts          ✓ Server Actions
│   ├── components/
│   │   ├── converter-form.tsx      ✓ Main form
│   │   ├── history-list.tsx        ✓ History display
│   │   └── favorites-list.tsx      ✓ Favorites display
│   ├── lib/
│   │   ├── prisma.ts               ✓ Prisma client
│   │   ├── conversions.ts          ✓ Conversion logic
│   │   └── utils.ts                ✓ shadcn utils
│   ├── types/
│   │   └── conversion.ts           ✓ TypeScript types
│   └── page.tsx                    ✓ Main page
├── prisma/
│   ├── schema.prisma               ✓ DB schema
│   └── migrations/                 ✓ Auto-generated
├── docs/
│   ├── PRD.md                      ✓ This file
│   ├── ARCHITECTURE.md             ⏳ Next
│   └── DATABASE.md                 ⏳ Next
└── CLAUDE.md                       ⏳ Next
```

---

**Target:** 30-45 minutes implementation  
**Difficulty:** ⭐☆☆☆☆ (Level 1)  
**Next.js Fundamentals:** App Router, Server Actions, Server/Client Components
