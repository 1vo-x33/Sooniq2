"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import useSWR from "swr"
import { Bell, BookOpen, CalendarDays, ClipboardList, Home, LogOut, Menu, User, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Notification {
  id: number
  title: string
  message: string
  is_read: number
  created_at: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles: ("student" | "teacher")[]
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <Home size={18} />, roles: ["student", "teacher"] },
  { href: "/schedule", label: "Schedule", icon: <CalendarDays size={18} />, roles: ["student", "teacher"] },
  { href: "/absences", label: "Absences", icon: <ClipboardList size={18} />, roles: ["student"] },
  { href: "/teacher/absences", label: "Manage Absences", icon: <ClipboardList size={18} />, roles: ["teacher"] },
  { href: "/teacher/students", label: "Students", icon: <BookOpen size={18} />, roles: ["teacher"] },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: notifications, mutate } = useSWR<Notification[]>(
    user ? "/api/notifications" : null
  )

  const unread = notifications?.filter((n) => !n.is_read).length ?? 0

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" })
    mutate()
  }

  const visibleNav = navItems.filter((item) => user?.role && item.roles.includes(user.role))

  return (
    <header className="sticky top-0 z-40 bg-sidebar border-b border-sidebar-border shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm">S</span>
            <span className="text-sidebar-foreground font-bold text-lg tracking-tight">Sooniq</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu onOpenChange={(open) => { if (!open && unread > 0) markAllRead() }}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60">
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-3 py-2 font-semibold text-sm text-foreground border-b border-border">Notifications</div>
                {!notifications?.length && (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">No notifications</div>
                )}
                {notifications?.slice(0, 8).map((n) => (
                  <div key={n.id} className={cn("px-3 py-2.5 border-b border-border last:border-0", !n.is_read && "bg-primary/5")}>
                    <div className="font-medium text-sm text-foreground">{n.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</div>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 gap-2">
                  <User size={16} />
                  <span className="hidden sm:inline text-sm">{user?.name?.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-3 py-2">
                  <div className="font-medium text-sm">{user?.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User size={14} /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive gap-2">
                  <LogOut size={14} /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-sidebar-border px-4 py-2 flex flex-col gap-1 bg-sidebar">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
