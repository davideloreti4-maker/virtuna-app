'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  AnalysisWithDetails,
  AnalysesListResponse,
  AnalysesQueryParams,
  AnalyzeResponse,
} from '@/types/analysis'

/**
 * Query keys for analyses
 */
export const analysesKeys = {
  all: ['analyses'] as const,
  lists: () => [...analysesKeys.all, 'list'] as const,
  list: (params: AnalysesQueryParams) => [...analysesKeys.lists(), params] as const,
  details: () => [...analysesKeys.all, 'detail'] as const,
  detail: (id: string) => [...analysesKeys.details(), id] as const,
}

/**
 * Hook to analyze a TikTok video
 */
export function useAnalyze() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (videoUrl: string): Promise<AnalyzeResponse> => {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      return data
    },
    onSuccess: () => {
      // Invalidate analyses list to show new analysis
      queryClient.invalidateQueries({ queryKey: analysesKeys.lists() })
      // Invalidate user data to update quota
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

/**
 * Hook to fetch list of analyses
 */
export function useAnalyses(params: AnalysesQueryParams = {}) {
  return useQuery({
    queryKey: analysesKeys.list(params),
    queryFn: async (): Promise<AnalysesListResponse> => {
      const searchParams = new URLSearchParams()
      if (params.page) searchParams.set('page', String(params.page))
      if (params.limit) searchParams.set('limit', String(params.limit))
      if (params.sort) searchParams.set('sort', params.sort)
      if (params.order) searchParams.set('order', params.order)
      if (params.minScore) searchParams.set('minScore', String(params.minScore))
      if (params.maxScore) searchParams.set('maxScore', String(params.maxScore))
      if (params.search) searchParams.set('search', params.search)

      const response = await fetch(`/api/analyses?${searchParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch analyses')
      }

      return response.json()
    },
  })
}

/**
 * Hook to fetch a single analysis
 */
export function useAnalysis(id: string) {
  return useQuery({
    queryKey: analysesKeys.detail(id),
    queryFn: async (): Promise<{ analysis: AnalysisWithDetails }> => {
      const response = await fetch(`/api/analyses/${id}`)

      if (!response.ok) {
        throw new Error('Analysis not found')
      }

      return response.json()
    },
    enabled: !!id,
  })
}

/**
 * Hook to delete an analysis
 */
export function useDeleteAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const response = await fetch(`/api/analyses/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete analysis')
      }

      return response.json()
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: analysesKeys.detail(id) })
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: analysesKeys.lists() })
    },
  })
}

/**
 * Hook to prefetch an analysis (for hover states)
 */
export function usePrefetchAnalysis() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: analysesKeys.detail(id),
      queryFn: async () => {
        const response = await fetch(`/api/analyses/${id}`)
        if (!response.ok) throw new Error('Analysis not found')
        return response.json()
      },
    })
  }
}
