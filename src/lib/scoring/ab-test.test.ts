import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getVariant,
  isInVariant,
  getVariantDistribution,
  createTestConfig,
} from './ab-test'

describe('getVariant', () => {
  it('returns consistent variant for same user', () => {
    const userId = 'user-123'
    const variant1 = getVariant(userId)
    const variant2 = getVariant(userId)

    expect(variant1).toBe(variant2)
  })

  it('returns different variants for different users', () => {
    // With enough users, we should see different variants
    const variants = new Set<string>()
    for (let i = 0; i < 100; i++) {
      variants.add(getVariant(`user-${i}`))
    }

    // Should have multiple different variants
    expect(variants.size).toBeGreaterThan(1)
  })

  it('returns hybrid when disabled', () => {
    const config = createTestConfig('test', {
      hybrid: 100,
      ml: 0,
      gemini: 0,
      formula: 0,
    })
    // Manually set enabled to false
    const disabledConfig = { ...config, enabled: false }

    const variant = getVariant('any-user', disabledConfig)
    expect(variant).toBe('hybrid')
  })

  it('returns valid scoring method', () => {
    const validMethods = ['ml', 'gemini', 'formula', 'hybrid']

    for (let i = 0; i < 50; i++) {
      const variant = getVariant(`user-${i}`)
      expect(validMethods).toContain(variant)
    }
  })
})

describe('isInVariant', () => {
  it('returns true when user is in specified variant', () => {
    const userId = 'test-user-123'
    const variant = getVariant(userId)

    expect(isInVariant(userId, variant)).toBe(true)
  })

  it('returns false when user is not in specified variant', () => {
    const userId = 'test-user-123'
    const variant = getVariant(userId)
    const otherVariants = ['ml', 'gemini', 'formula', 'hybrid'].filter(
      (v) => v !== variant
    ) as Array<'ml' | 'gemini' | 'formula' | 'hybrid'>

    // User should not be in other variants
    for (const other of otherVariants) {
      expect(isInVariant(userId, other)).toBe(false)
    }
  })
})

describe('getVariantDistribution', () => {
  it('returns distribution for all users', () => {
    const userIds = Array.from({ length: 100 }, (_, i) => `user-${i}`)
    const distribution = getVariantDistribution(userIds)

    expect(distribution).toHaveProperty('ml')
    expect(distribution).toHaveProperty('gemini')
    expect(distribution).toHaveProperty('formula')
    expect(distribution).toHaveProperty('hybrid')

    // Total should equal number of users
    const total =
      distribution.ml +
      distribution.gemini +
      distribution.formula +
      distribution.hybrid
    expect(total).toBe(100)
  })

  it('distribution roughly matches config percentages', () => {
    // With 1000 users, distribution should be close to config
    const userIds = Array.from({ length: 1000 }, (_, i) => `user-${i}`)
    const distribution = getVariantDistribution(userIds)

    // Allow 10% variance from expected
    expect(distribution.hybrid).toBeGreaterThan(300) // 40% = 400 ± 100
    expect(distribution.hybrid).toBeLessThan(500)
    expect(distribution.ml).toBeGreaterThan(200) // 30% = 300 ± 100
    expect(distribution.ml).toBeLessThan(400)
  })
})

describe('createTestConfig', () => {
  it('creates config with specified variants', () => {
    const config = createTestConfig('my-test', {
      ml: 50,
      formula: 50,
    })

    expect(config.testId).toBe('my-test')
    expect(config.enabled).toBe(true)
    expect(config.variants.ml).toBe(50)
    expect(config.variants.formula).toBe(50)
    expect(config.variants.gemini).toBe(0)
    expect(config.variants.hybrid).toBe(0)
  })

  it('warns when variants do not sum to 100', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    createTestConfig('bad-test', {
      ml: 30,
      formula: 30,
    })

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('should sum to 100')
    )

    warnSpy.mockRestore()
  })
})
