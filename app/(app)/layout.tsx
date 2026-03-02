import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { SWRProvider } from "@/components/swr-provider"
import { Navbar } from "@/components/navbar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session.userId) {
    redirect("/login")
  }

  return (
    <SWRProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </SWRProvider>
  )
}
