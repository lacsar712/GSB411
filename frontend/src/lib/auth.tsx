import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'

interface AuthUser {
    username: string
    role: string
}

interface AuthContextValue {
    user: AuthUser | null
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readAuthUser(): AuthUser | null {
    const token = localStorage.getItem('momentum_token')
    if (!token) return null

    const role = localStorage.getItem('momentum_role') ?? 'analyst'
    const username =
        localStorage.getItem('momentum_username') ??
        (role === 'admin' ? 'admin' : role === 'analyst' ? 'analyst' : '')

    if (!username) return null
    return { username, role }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => readAuthUser())

    const syncUser = useCallback(() => {
        setUser(readAuthUser())
    }, [])

    useEffect(() => {
        window.addEventListener('storage', syncUser)
        window.addEventListener('momentum-auth', syncUser)
        return () => {
            window.removeEventListener('storage', syncUser)
            window.removeEventListener('momentum-auth', syncUser)
        }
    }, [syncUser])

    const value = useMemo(
        () => ({
            user,
            isAdmin: user?.role === 'admin',
        }),
        [user],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
