import { useState, useCallback } from 'react'

export function useStore() {
  const [analyses, setAnalyses] = useState(() => {
    const saved = localStorage.getItem('markman-analyses')
    return saved ? JSON.parse(saved) : []
  })

  const addMatter = useCallback((matter) => {
    setAnalyses(prev => {
      const next = [{ ...matter, id: `a-${Date.now()}`, timestamp: new Date().toISOString() }, ...prev].slice(0, 50)
      localStorage.setItem('markman-analyses', JSON.stringify(next))
      return next
    })
  }, [])

  return { analyses, addMatter }
}
