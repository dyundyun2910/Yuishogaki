import { useState, useEffect } from 'react'
import type { Temple } from '../types/temple'

interface UseTemplesReturn {
  temples: Temple[]
  loading: boolean
  error: string | null
}

const BASE_PATH = import.meta.env.BASE_URL || '/'
const DATA_PATH = `${BASE_PATH}data/temples.json`

export function useTemples(): UseTemplesReturn {
  const [temples, setTemples] = useState<Temple[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemples = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(DATA_PATH)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.temples || !Array.isArray(data.temples)) {
          throw new Error('Invalid data format')
        }

        setTemples(data.temples)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました'
        setError(errorMessage)
        console.error('Failed to fetch temples:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTemples()
  }, [])

  return {
    temples,
    loading,
    error,
  }
}
