// TypeScript type definitions with discriminated unions

export type LengthUnit = 'm' | 'km' | 'ft' | 'mi'
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz'
export type TemperatureUnit = 'C' | 'F' | 'K'
export type Category = 'length' | 'weight' | 'temperature'

// Discriminated union for type-safe conversions
export type ConversionInput =
  | { category: 'length'; value: number; fromUnit: LengthUnit; toUnit: LengthUnit }
  | { category: 'weight'; value: number; fromUnit: WeightUnit; toUnit: WeightUnit }
  | { category: 'temperature'; value: number; fromUnit: TemperatureUnit; toUnit: TemperatureUnit }

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

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }
