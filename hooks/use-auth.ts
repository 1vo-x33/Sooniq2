import useSWR from "swr"
import { useRouter } from "next/navigation"

interface AuthUser {
  userId: number
  role: "student" | "teacher"
  name: string
  email: string
  classId?: number
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (res.status === 401) return null
    return res.json()
  })

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<AuthUser | null>("/api/auth/me", fetcher)
  const router = useRouter()

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    await mutate(null, false)
    router.push("/login")
  }

  return {
    user: data ?? null,
    isLoading,
    isError: !!error,
    isAuthenticated: !!data,
    logout,
    mutate,
  }
}
