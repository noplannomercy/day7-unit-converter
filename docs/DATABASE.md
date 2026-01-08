# Unit Converter - Database Documentation

## Schema Design

### Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

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

  @@index([createdAt])
  @@index([isFavorite])
}
```

---

## Table Structure

### Conversion Table

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | No | `cuid()` | Unique identifier (cuid format) |
| `category` | String | No | - | Conversion type: "length", "weight", "temperature" |
| `value` | Float | No | - | Input value to convert |
| `fromUnit` | String | No | - | Source unit (e.g., "m", "kg", "C") |
| `toUnit` | String | No | - | Target unit (e.g., "ft", "lb", "F") |
| `result` | Float | No | - | Calculated conversion result |
| `formula` | String | No | - | Human-readable formula (e.g., "1 m = 3.28084 ft") |
| `isFavorite` | Boolean | No | `false` | Favorite flag for quick access |
| `createdAt` | DateTime | No | `now()` | Timestamp of conversion |

**Total Fields:** 9

---

## Entity Relationship Diagram

```mermaid
erDiagram
    CONVERSION {
        String id PK "cuid()"
        String category "length/weight/temperature"
        Float value "Input value"
        String fromUnit "Source unit"
        String toUnit "Target unit"
        Float result "Converted value"
        String formula "Display formula"
        Boolean isFavorite "Favorite flag"
        DateTime createdAt "Timestamp"
    }
```

**Note:** Single table design (no relationships needed for this app)

---

## Indexes & Constraints

### Primary Key
```sql
PRIMARY KEY (id)
```
- **Type:** String (cuid)
- **Purpose:** Unique identifier for each conversion
- **Format:** `cl9p0q2vw0000...` (25 characters)

### Indexes

#### 1. CreatedAt Index
```prisma
@@index([createdAt])
```
- **Purpose:** Fast sorting for history queries
- **Query:** `ORDER BY createdAt DESC`
- **Impact:** O(log n) instead of O(n) for history retrieval

#### 2. IsFavorite Index
```prisma
@@index([isFavorite])
```
- **Purpose:** Quick filtering of favorites
- **Query:** `WHERE isFavorite = true`
- **Impact:** Faster favorites list rendering

### Constraints

| Constraint | Field | Rule |
|------------|-------|------|
| NOT NULL | All fields | No null values allowed |
| DEFAULT | `isFavorite` | Defaults to `false` |
| DEFAULT | `createdAt` | Auto-set to current timestamp |

**No Foreign Keys:** Single table design (no relations)

---

## Migration Strategy

### Initial Migration

```bash
# 1. Create migration
npx prisma migrate dev --name init

# Output:
# ✓ Generated Prisma Client
# ✓ Migration created: 20240108000000_init
# ✓ Applied migration: 20240108000000_init
```

**Generated SQL:**
```sql
-- CreateTable
CREATE TABLE "Conversion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "fromUnit" TEXT NOT NULL,
    "toUnit" TEXT NOT NULL,
    "result" REAL NOT NULL,
    "formula" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Conversion_createdAt_idx" ON "Conversion"("createdAt");

-- CreateIndex
CREATE INDEX "Conversion_isFavorite_idx" ON "Conversion"("isFavorite");
```

### Seed Data (Optional)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Sample conversions
  await prisma.conversion.createMany({
    data: [
      {
        category: 'length',
        value: 100,
        fromUnit: 'm',
        toUnit: 'ft',
        result: 328.084,
        formula: '1 m = 3.28084 ft',
        isFavorite: true,
      },
      {
        category: 'weight',
        value: 1,
        fromUnit: 'kg',
        toUnit: 'lb',
        result: 2.20462,
        formula: '1 kg = 2.20462 lb',
        isFavorite: true,
      },
      {
        category: 'temperature',
        value: 0,
        fromUnit: 'C',
        toUnit: 'F',
        result: 32,
        formula: '(C × 9/5) + 32',
        isFavorite: false,
      },
    ],
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Run seeding:**
```bash
npx prisma db seed
```

---

## Query Patterns

### 1. Get Recent History

```typescript
// Get last 10 conversions (most recent first)
const history = await prisma.conversion.findMany({
  orderBy: { createdAt: 'desc' },
  take: 10,
})
```

**SQL:**
```sql
SELECT * FROM "Conversion"
ORDER BY "createdAt" DESC
LIMIT 10;
```

**Performance:** O(log n) with `createdAt` index

---

### 2. Get Favorites

```typescript
// Get all favorite conversions
const favorites = await prisma.conversion.findMany({
  where: { isFavorite: true },
  orderBy: { createdAt: 'desc' },
})
```

**SQL:**
```sql
SELECT * FROM "Conversion"
WHERE "isFavorite" = 1
ORDER BY "createdAt" DESC;
```

**Performance:** O(log n) with `isFavorite` index

---

### 3. Create Conversion

```typescript
// Save new conversion
const conversion = await prisma.conversion.create({
  data: {
    category: 'length',
    value: 100,
    fromUnit: 'm',
    toUnit: 'ft',
    result: 328.084,
    formula: '1 m = 3.28084 ft',
    isFavorite: false,
  },
})
```

**SQL:**
```sql
INSERT INTO "Conversion" (
  "id", "category", "value", "fromUnit", "toUnit",
  "result", "formula", "isFavorite", "createdAt"
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
```

**Performance:** O(1) insertion

---

### 4. Toggle Favorite

```typescript
// Toggle favorite status
const conversion = await prisma.conversion.update({
  where: { id: 'cl9p0q2vw0000...' },
  data: {
    isFavorite: {
      set: !currentValue, // Or use boolean value directly
    },
  },
})
```

**SQL:**
```sql
UPDATE "Conversion"
SET "isFavorite" = ?
WHERE "id" = ?;
```

**Performance:** O(1) by primary key

---

### 5. Delete Conversion

```typescript
// Delete a conversion
await prisma.conversion.delete({
  where: { id: 'cl9p0q2vw0000...' },
})
```

**SQL:**
```sql
DELETE FROM "Conversion"
WHERE "id" = ?;
```

**Performance:** O(1) by primary key

---

### 6. Get Conversion by ID

```typescript
// Get single conversion
const conversion = await prisma.conversion.findUnique({
  where: { id: 'cl9p0q2vw0000...' },
})
```

**SQL:**
```sql
SELECT * FROM "Conversion"
WHERE "id" = ?;
```

**Performance:** O(1) by primary key

---

## Database Configuration

### Environment Variables

```env
# .env
DATABASE_URL="file:./dev.db"
```

**Development:**
- File: `prisma/dev.db`
- Location: Local file system
- Backup: Git-ignored

**Production:**
- Option 1: SQLite with persistent volume
- Option 2: Migrate to PostgreSQL

```env
# Production (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

---

## Prisma Client Setup

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = prisma
```

**Benefits:**
- Singleton pattern (prevents multiple connections)
- Query logging in development
- Hot reload safe

---

## Data Examples

### Length Conversion
```json
{
  "id": "cl9p0q2vw0000xyz",
  "category": "length",
  "value": 100,
  "fromUnit": "m",
  "toUnit": "ft",
  "result": 328.084,
  "formula": "1 m = 3.28084 ft",
  "isFavorite": false,
  "createdAt": "2024-01-08T12:00:00.000Z"
}
```

### Weight Conversion
```json
{
  "id": "cl9p0q2vw0001abc",
  "category": "weight",
  "value": 5,
  "fromUnit": "kg",
  "toUnit": "lb",
  "result": 11.0231,
  "formula": "1 kg = 2.20462 lb",
  "isFavorite": true,
  "createdAt": "2024-01-08T12:05:00.000Z"
}
```

### Temperature Conversion
```json
{
  "id": "cl9p0q2vw0002def",
  "category": "temperature",
  "value": 25,
  "fromUnit": "C",
  "toUnit": "F",
  "result": 77,
  "formula": "(C × 9/5) + 32",
  "isFavorite": false,
  "createdAt": "2024-01-08T12:10:00.000Z"
}
```

---

## Performance Metrics

### Expected Query Times (SQLite)

| Query | Time | Notes |
|-------|------|-------|
| Get history (10 rows) | <1ms | Indexed by `createdAt` |
| Get favorites | <2ms | Indexed by `isFavorite` |
| Create conversion | <1ms | Single insert |
| Update favorite | <1ms | Primary key lookup |
| Delete conversion | <1ms | Primary key lookup |

**Database Size Estimation:**
- Per record: ~200 bytes
- 1,000 conversions: ~200 KB
- 10,000 conversions: ~2 MB
- 100,000 conversions: ~20 MB

SQLite handles this scale easily.

---

## Migration Commands Reference

```bash
# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio

# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

---

## Summary

**Schema Highlights:**
- ✅ Single table design (simple, efficient)
- ✅ Indexed for common queries
- ✅ Type-safe with Prisma
- ✅ Auto-generated timestamps
- ✅ CUID for unique IDs

**Query Performance:**
- All queries < 2ms (with indexes)
- Scales to 100k+ records easily
- No N+1 query issues

**Migration Path:**
- Start: SQLite (local dev)
- Scale: PostgreSQL (production)
- Change: Update `DATABASE_URL` only
