import type {
  Category,
  ConversionInput,
  LengthUnit,
  WeightUnit,
  TemperatureUnit,
} from '@/types/conversion'

// ============================================
// Input Validation
// ============================================

export function validateInput(input: ConversionInput): boolean {
  // Check for NaN/Infinity
  if (!Number.isFinite(input.value)) {
    return false
  }

  // Allow negative values ONLY for temperature
  if (input.category !== 'temperature' && input.value < 0) {
    return false
  }

  return true
}

// ============================================
// Length Conversions (Base unit: meter)
// ============================================

const lengthRates: Record<LengthUnit, number> = {
  m: 1,
  km: 0.001,
  ft: 3.28084,
  mi: 0.000621371,
}

export function convertLength(
  value: number,
  from: LengthUnit,
  to: LengthUnit
): number {
  // Same unit conversion
  if (from === to) return value

  // Convert to meters (base unit)
  const meters = value / lengthRates[from]

  // Convert from meters to target unit
  return meters * lengthRates[to]
}

// ============================================
// Weight Conversions (Base unit: kilogram)
// ============================================

const weightRates: Record<WeightUnit, number> = {
  kg: 1,
  g: 1000,
  lb: 2.20462,
  oz: 35.274,
}

export function convertWeight(
  value: number,
  from: WeightUnit,
  to: WeightUnit
): number {
  // Same unit conversion
  if (from === to) return value

  // Convert to kilograms (base unit)
  const kilograms = value / weightRates[from]

  // Convert from kilograms to target unit
  return kilograms * weightRates[to]
}

// ============================================
// Temperature Conversions
// ============================================

export function convertTemperature(
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit
): number {
  // Same unit conversion
  if (from === to) return value

  // Convert to Celsius first (as intermediate)
  let celsius: number

  switch (from) {
    case 'C':
      celsius = value
      break
    case 'F':
      celsius = (value - 32) * (5 / 9)
      break
    case 'K':
      celsius = value - 273.15
      break
  }

  // Convert from Celsius to target unit
  switch (to) {
    case 'C':
      return celsius
    case 'F':
      return celsius * (9 / 5) + 32
    case 'K':
      return celsius + 273.15
  }
}

// ============================================
// Main Conversion Function
// ============================================

export function convert(input: ConversionInput): number {
  // TypeScript narrows the type automatically in each case
  switch (input.category) {
    case 'length':
      return convertLength(input.value, input.fromUnit, input.toUnit)
    case 'weight':
      return convertWeight(input.value, input.fromUnit, input.toUnit)
    case 'temperature':
      return convertTemperature(input.value, input.fromUnit, input.toUnit)
  }
}

// ============================================
// Formula Generator
// ============================================

export function getFormula(
  category: Category,
  from: string,
  to: string
): string {
  // Same unit
  if (from === to) {
    return 'No conversion needed'
  }

  switch (category) {
    case 'length':
      const lengthFrom = from as LengthUnit
      const lengthTo = to as LengthUnit
      const lengthRate = lengthRates[lengthTo] / lengthRates[lengthFrom]
      return `1 ${from} = ${lengthRate.toFixed(6)} ${to}`

    case 'weight':
      const weightFrom = from as WeightUnit
      const weightTo = to as WeightUnit
      const weightRate = weightRates[weightTo] / weightRates[weightFrom]
      return `1 ${from} = ${weightRate.toFixed(6)} ${to}`

    case 'temperature':
      if (from === 'C' && to === 'F') return '(°C × 9/5) + 32 = °F'
      if (from === 'F' && to === 'C') return '(°F - 32) × 5/9 = °C'
      if (from === 'C' && to === 'K') return '°C + 273.15 = K'
      if (from === 'K' && to === 'C') return 'K - 273.15 = °C'
      if (from === 'F' && to === 'K') return '(°F - 32) × 5/9 + 273.15 = K'
      if (from === 'K' && to === 'F') return '(K - 273.15) × 9/5 + 32 = °F'
      return `${from} to ${to}`

    default:
      return ''
  }
}
