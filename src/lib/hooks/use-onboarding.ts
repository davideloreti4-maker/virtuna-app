'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userKeys } from './use-user'

interface OnboardingUpdate {
  has_seen_onboarding: boolean
}

/**
 * Hook to update user's onboarding status
 */
export function useUpdateOnboarding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: OnboardingUpdate) => {
      const response = await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update onboarding status')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate user query to refresh the data
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    },
  })
}
