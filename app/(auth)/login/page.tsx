"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Login failed")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  const fillDemo = () => {
    setEmail("malek@mborijnland.nl")
    setPassword("spitfire")
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sidebar-primary mb-3 shadow-lg">
          <GraduationCap size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Sooniq</h1>
        <p className="text-white/60 text-sm mt-1">Your school absence tracker</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-xl font-bold text-foreground mb-1">Welcome back</h2>
        <p className="text-muted-foreground text-sm mb-6">Sign in to check your schedule and absences.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.nl"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-11"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
            {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
            Sign In
          </Button>
        </form>

        {/* Demo shortcut */}
        <div className="mt-4 p-3 bg-primary/6 rounded-xl border border-primary/15">
          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Demo account</p>
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-foreground/70">
              <span className="font-mono">malek@mborijnland.nl</span>
              {" / "}
              <span className="font-mono">spitfire</span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={fillDemo} className="text-xs h-7 shrink-0">
              Fill in
            </Button>
          </div>
        </div>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          {"No account? "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  )
}
