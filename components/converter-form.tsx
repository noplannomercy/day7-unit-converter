'use client'

import { useState, useTransition } from 'react'
import { createConversion } from '@/app/actions/conversions'
import type { Category, ConversionInput } from '@/types/conversion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Unit options by category (typed arrays)
const unitOptions = {
  length: ['m', 'km', 'ft', 'mi'] as const,
  weight: ['kg', 'g', 'lb', 'oz'] as const,
  temperature: ['C', 'F', 'K'] as const,
}

// Unit labels for display
const unitLabels: Record<string, string> = {
  m: 'Meter (m)',
  km: 'Kilometer (km)',
  ft: 'Feet (ft)',
  mi: 'Mile (mi)',
  kg: 'Kilogram (kg)',
  g: 'Gram (g)',
  lb: 'Pound (lb)',
  oz: 'Ounce (oz)',
  C: 'Celsius (°C)',
  F: 'Fahrenheit (°F)',
  K: 'Kelvin (K)',
}

export default function ConverterForm() {
  const [category, setCategory] = useState<Category>('length')
  const [value, setValue] = useState('')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('km')
  const [result, setResult] = useState<number | null>(null)
  const [formula, setFormula] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  // Handle category change
  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory)
    // Reset units to first and second of new category
    const units = unitOptions[newCategory]
    setFromUnit(units[0])
    setToUnit(units[1])
    // Clear result and error
    setResult(null)
    setFormula('')
    setError('')
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setFormula('')

    // Validate value
    if (!value || value.trim() === '') {
      setError('Please enter a value')
      return
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      setError('Please enter a valid number')
      return
    }

    // Build conversion input based on category
    let input: ConversionInput

    switch (category) {
      case 'length':
        input = {
          category: 'length',
          value: numValue,
          fromUnit: fromUnit as any,
          toUnit: toUnit as any,
        }
        break
      case 'weight':
        input = {
          category: 'weight',
          value: numValue,
          fromUnit: fromUnit as any,
          toUnit: toUnit as any,
        }
        break
      case 'temperature':
        input = {
          category: 'temperature',
          value: numValue,
          fromUnit: fromUnit as any,
          toUnit: toUnit as any,
        }
        break
    }

    // Call Server Action
    startTransition(async () => {
      const response = await createConversion(input)

      if (response.success) {
        setResult(response.data.result)
        setFormula(response.data.formula)
      } else {
        setError(response.error)
      }
    })
  }

  // Get current unit options
  const currentUnits = unitOptions[category]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Unit Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selector */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Select
              value={category}
              onValueChange={(val) => handleCategoryChange(val as Category)}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="length">Length</SelectItem>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Value Input */}
          <div className="space-y-2">
            <label htmlFor="value" className="text-sm font-medium">
              Value
            </label>
            <Input
              id="value"
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
              aria-label="Value to convert"
            />
          </div>

          {/* From Unit */}
          <div className="space-y-2">
            <label htmlFor="fromUnit" className="text-sm font-medium">
              From
            </label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger id="fromUnit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currentUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unitLabels[unit]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Unit */}
          <div className="space-y-2">
            <label htmlFor="toUnit" className="text-sm font-medium">
              To
            </label>
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger id="toUnit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currentUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unitLabels[unit]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
            aria-label="Convert"
          >
            {isPending ? 'Converting...' : 'Convert'}
          </Button>

          {/* Result Display */}
          {result !== null && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-lg font-semibold">
                Result: {result.toFixed(6)} {toUnit}
              </p>
              {formula && (
                <p className="text-sm text-gray-600 mt-1">
                  Formula: {formula}
                </p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
