'use client'

import { type ReactNode } from 'react'
import { QueryProvider } from './query-provider'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Combined providers wrapper
 * Add all client-side providers here
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  )
}
