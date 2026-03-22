'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { convert, getFormula, validateInput } from '@/lib/conversions'
import type {
  ConversionInput,
  ConversionResult,
  ActionResponse,
} from '@/types/conversion'

// ============================================
// Create Conversion
// ============================================

export async function createConversion(
  input: ConversionInput
): Promise<ActionResponse<ConversionResult>> {
  try {
    // Validate input
    if (!validateInput(input)) {
      return {
        success: false,
        error: 'Invalid input: Please check your values (no NaN/Infinity, no negative length/weight)',
      }
    }

    // Calculate result
    const result = convert(input)

    // Generate formula
    const formula = getFormula(input.category, input.fromUnit, input.toUnit)

    // Save to database
    const conversion = await prisma.conversion.create({
      data: {
        category: input.category,
        value: input.value,
        fromUnit: input.fromUnit,
        toUnit: input.toUnit,
        result,
        formula,
        isFavorite: false,
      },
    })

    // Revalidate page to refresh Server Components
    revalidatePath('/')

    return {
      success: true,
      data: conversion as ConversionResult,
    }
  } catch (error) {
    console.error('Error creating conversion:', error)
    return {
      success: false,
      error: 'Failed to save conversion',
    }
  }
}

// ============================================
// Get History (last 10 conversions)
// ============================================

export async function getHistory(): Promise<ConversionResult[]> {
  try {
    const history = await prisma.conversion.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    return history as ConversionResult[]
  } catch (error) {
    console.error('Error fetching history:', error)
    return []
  }
}

// ============================================
// Get Favorites
// ============================================

export async function getFavorites(): Promise<ConversionResult[]> {
  try {
    const favorites = await prisma.conversion.findMany({
      where: {
        isFavorite: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return favorites as ConversionResult[]
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return []
  }
}

// ============================================
// Toggle Favorite (Race Condition Safe)
// ============================================

export async function toggleFavorite(
  id: string
): Promise<ActionResponse<ConversionResult>> {
  try {
    // Validate id
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: 'Invalid ID',
      }
    }

    // Atomic toggle: single query to avoid race condition
    // Uses raw SQL to toggle in one operation
    const result = await prisma.$executeRaw`
      UPDATE Conversion SET isFavorite = NOT isFavorite WHERE id = ${id}
    `

    if (result === 0) {
      return {
        success: false,
        error: 'Conversion not found',
      }
    }

    const updated = await prisma.conversion.findUnique({
      where: { id },
    })

    if (!updated) {
      return {
        success: false,
        error: 'Conversion not found',
      }
    }

    // Revalidate page
    revalidatePath('/')

    return {
      success: true,
      data: updated as ConversionResult,
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return {
      success: false,
      error: 'Failed to toggle favorite',
    }
  }
}

// ============================================
// Delete Conversion
// ============================================

export async function deleteConversion(
  id: string
): Promise<ActionResponse<void>> {
  try {
    // Validate id
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: 'Invalid ID',
      }
    }

    // Delete from database
    await prisma.conversion.delete({
      where: { id },
    })

    // Revalidate page
    revalidatePath('/')

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error('Error deleting conversion:', error)
    return {
      success: false,
      error: 'Failed to delete conversion',
    }
  }
}

