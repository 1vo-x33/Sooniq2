"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
  }, [user, isLoading, router])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setSaving(true)
    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    })
    setSaving(false)

    if (res.ok) {
      setMessage("Password updated successfully")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      setError("Failed to update password")
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your account information</p>
      </div>

      {/* Info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <User size={18} />
            </div>
            Account Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Full Name</Label>
            <p className="text-sm font-medium text-foreground">{user.name}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Email</Label>
            <p className="text-sm font-medium text-foreground">{user.email}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Role</Label>
            <p className="text-sm font-medium text-foreground capitalize">{user.role}</p>
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
                {message}
              </p>
            )}

            <Button type="submit" disabled={saving} className="w-full">
              {saving && <Loader2 size={15} className="mr-2 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full" onClick={logout}>
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
