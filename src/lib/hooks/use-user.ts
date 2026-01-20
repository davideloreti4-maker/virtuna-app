'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Profile } from '@/types/database'
import type { ProfileInput } from '@/lib/utils/validation'

/**
 * Query keys for user data
 */
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
}

interface UserResponse {
  user: Profile & { id: string; email: string }
}

/**
 * Hook to fetch current user's profile
 */
export function useUser() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: async (): Promise<UserResponse> => {
      const response = await fetch('/api/user')

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated')
        }
        throw new Error('Failed to fetch user')
      }

      return response.json()
    },
    retry: false, // Don't retry on auth errors
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProfileInput): Promise<UserResponse> => {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update cache with new data
      queryClient.setQueryData(userKeys.profile(), data)
    },
  })
}

/**
 * Hook to delete user account
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (confirmation: string): Promise<{ message: string }> => {
      const response = await fetch('/api/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete account')
      }

      return response.json()
    },
  })
}
