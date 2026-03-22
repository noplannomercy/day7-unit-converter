import { describe, it, expect } from 'vitest'
import {
  validateInput,
  convert,
  convertLength,
  convertWeight,
  convertTemperature,
  getFormula,
} from '@/lib/conversions'

describe('validateInput', () => {
  it('rejects NaN', () => {
    expect(validateInput({ category: 'length', value: NaN, fromUnit: 'm', toUnit: 'km' })).toBe(false)
  })

  it('rejects Infinity', () => {
    expect(validateInput({ category: 'length', value: Infinity, fromUnit: 'm', toUnit: 'km' })).toBe(false)
  })

  it('rejects negative length', () => {
    expect(validateInput({ category: 'length', value: -10, fromUnit: 'm', toUnit: 'km' })).toBe(false)
  })

  it('rejects negative weight', () => {
    expect(validateInput({ category: 'weight', value: -5, fromUnit: 'kg', toUnit: 'g' })).toBe(false)
  })

  it('allows negative temperature', () => {
    expect(validateInput({ category: 'temperature', value: -40, fromUnit: 'C', toUnit: 'F' })).toBe(true)
  })

  it('allows zero for all categories', () => {
    expect(validateInput({ category: 'length', value: 0, fromUnit: 'm', toUnit: 'km' })).toBe(true)
    expect(validateInput({ category: 'weight', value: 0, fromUnit: 'kg', toUnit: 'g' })).toBe(true)
    expect(validateInput({ category: 'temperature', value: 0, fromUnit: 'C', toUnit: 'F' })).toBe(true)
  })
})

describe('convertLength', () => {
  it('converts 100m to feet', () => {
    expect(convertLength(100, 'm', 'ft')).toBeCloseTo(328.084, 2)
  })

  it('converts 1km to meters', () => {
    expect(convertLength(1, 'km', 'm')).toBeCloseTo(1000, 0)
  })

  it('converts 1mi to feet', () => {
    expect(convertLength(1, 'mi', 'ft')).toBeCloseTo(5280, 0)
  })

  it('returns same value for same unit', () => {
    expect(convertLength(42, 'm', 'm')).toBe(42)
  })
})

describe('convertWeight', () => {
  it('converts 1kg to pounds', () => {
    expect(convertWeight(1, 'kg', 'lb')).toBeCloseTo(2.20462, 4)
  })

  it('converts 1000g to kg', () => {
    expect(convertWeight(1000, 'g', 'kg')).toBeCloseTo(1, 0)
  })

  it('returns same value for same unit', () => {
    expect(convertWeight(99, 'oz', 'oz')).toBe(99)
  })
})

describe('convertTemperature', () => {
  it('converts 0°C to 32°F', () => {
    expect(convertTemperature(0, 'C', 'F')).toBeCloseTo(32, 1)
  })

  it('converts 100°C to 212°F', () => {
    expect(convertTemperature(100, 'C', 'F')).toBeCloseTo(212, 1)
  })

  it('converts -40°C to -40°F (critical edge case)', () => {
    expect(convertTemperature(-40, 'C', 'F')).toBeCloseTo(-40, 1)
  })

  it('converts 0°C to 273.15K', () => {
    expect(convertTemperature(0, 'C', 'K')).toBeCloseTo(273.15, 2)
  })

  it('converts 32°F to 0°C', () => {
    expect(convertTemperature(32, 'F', 'C')).toBeCloseTo(0, 1)
  })

  it('returns same value for same unit', () => {
    expect(convertTemperature(-273.15, 'K', 'K')).toBe(-273.15)
  })
})

describe('convert (main function)', () => {
  it('dispatches length conversions', () => {
    expect(convert({ category: 'length', value: 1, fromUnit: 'm', toUnit: 'km' })).toBeCloseTo(0.001, 4)
  })

  it('dispatches weight conversions', () => {
    expect(convert({ category: 'weight', value: 2222, fromUnit: 'g', toUnit: 'kg' })).toBeCloseTo(2.222, 3)
  })

  it('dispatches temperature conversions', () => {
    expect(convert({ category: 'temperature', value: 15, fromUnit: 'C', toUnit: 'F' })).toBeCloseTo(59, 0)
  })
})

describe('getFormula', () => {
  it('returns "No conversion needed" for same unit', () => {
    expect(getFormula('length', 'm', 'm')).toBe('No conversion needed')
  })

  it('returns correct temperature formula C→F', () => {
    expect(getFormula('temperature', 'C', 'F')).toBe('(°C × 9/5) + 32 = °F')
  })

  it('returns rate-based formula for length', () => {
    expect(getFormula('length', 'm', 'km')).toContain('1 m =')
  })

  it('returns rate-based formula for weight', () => {
    expect(getFormula('weight', 'kg', 'lb')).toContain('1 kg =')
  })
})
