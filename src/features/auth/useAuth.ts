import { useCallback, useState } from 'react'

export function useAuth() {
  const [isAuthed, setIsAuthed] = useState(false)

  const login = useCallback(() => setIsAuthed(true), [])
  const logout = useCallback(() => setIsAuthed(false), [])

  return { isAuthed, login, logout }
}

