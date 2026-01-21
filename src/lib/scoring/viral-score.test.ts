import { describe, it, expect } from 'vitest'
import {
  calculateViralScore,
  calculateViralScoreWithBreakdown,
  getScoreCategory,
  getScoreLabel,
} from './viral-score'

describe('calculateViralScore', () => {
  it('returns low score for video with 0 engagement', () => {
    const score = calculateViralScore({
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
    })
    // With 0 engagement, score should be low (retention defaults to 75, velocity defaults based on views)
    expect(score).toBeLessThan(60)
  })

  it('calculates score for typical video metrics', () => {
    const score = calculateViralScore({
      views: 100000,
      likes: 5000,
      comments: 200,
      shares: 100,
    })
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('returns higher score for high engagement', () => {
    const lowEngagement = calculateViralScore({
      views: 100000,
      likes: 100,
      comments: 10,
      shares: 5,
    })

    const highEngagement = calculateViralScore({
      views: 100000,
      likes: 20000,
      comments: 5000,
      shares: 2000,
    })

    expect(highEngagement).toBeGreaterThan(lowEngagement)
  })

  it('considers velocity when upload_date is provided', () => {
    const recentVideo = calculateViralScore({
      views: 100000,
      likes: 5000,
      comments: 200,
      shares: 100,
      upload_date: new Date(), // today
    })

    const oldVideo = calculateViralScore({
      views: 100000,
      likes: 5000,
      comments: 200,
      shares: 100,
      upload_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
    })

    expect(recentVideo).toBeGreaterThan(oldVideo)
  })

  it('considers follower count for relative reach', () => {
    const smallCreator = calculateViralScore({
      views: 100000,
      likes: 5000,
      comments: 200,
      shares: 100,
      follower_count: 1000, // 100x reach
    })

    const bigCreator = calculateViralScore({
      views: 100000,
      likes: 5000,
      comments: 200,
      shares: 100,
      follower_count: 10000000, // 0.01x reach
    })

    expect(smallCreator).toBeGreaterThan(bigCreator)
  })
})

describe('calculateViralScoreWithBreakdown', () => {
  it('returns breakdown with all components', () => {
    const result = calculateViralScoreWithBreakdown({
      views: 100000,
      likes: 5000,
      comments: 200,
      shares: 100,
    })

    expect(result).toHaveProperty('total_score')
    expect(result).toHaveProperty('breakdown')
    expect(result.breakdown).toHaveProperty('engagement')
    expect(result.breakdown).toHaveProperty('retention')
    expect(result.breakdown).toHaveProperty('velocity')
    expect(result.breakdown).toHaveProperty('relative_reach')
  })

  it('breakdown scores have correct weights', () => {
    const result = calculateViralScoreWithBreakdown({
      views: 100000,
      likes: 5000,
      comments: 200,
      shares: 100,
    })

    expect(result.breakdown.engagement.weight).toBe('30%')
    expect(result.breakdown.retention.weight).toBe('25%')
    expect(result.breakdown.velocity.weight).toBe('25%')
    expect(result.breakdown.relative_reach.weight).toBe('20%')
  })
})

describe('getScoreCategory', () => {
  it('returns ultra for scores >= 85', () => {
    expect(getScoreCategory(85)).toBe('ultra')
    expect(getScoreCategory(100)).toBe('ultra')
  })

  it('returns high for scores 60-84', () => {
    expect(getScoreCategory(60)).toBe('high')
    expect(getScoreCategory(84)).toBe('high')
  })

  it('returns medium for scores 30-59', () => {
    expect(getScoreCategory(30)).toBe('medium')
    expect(getScoreCategory(59)).toBe('medium')
  })

  it('returns low for scores < 30', () => {
    expect(getScoreCategory(0)).toBe('low')
    expect(getScoreCategory(29)).toBe('low')
  })
})

describe('getScoreLabel', () => {
  it('returns correct labels for score ranges', () => {
    expect(getScoreLabel(95)).toBe('Elite Viral')
    expect(getScoreLabel(75)).toBe('High Potential')
    expect(getScoreLabel(55)).toBe('Trending')
    expect(getScoreLabel(35)).toBe('Growing')
    expect(getScoreLabel(15)).toBe('New')
  })
})
