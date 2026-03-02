import { SWRProvider } from "@/components/swr-provider"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SWRProvider>
      <div className="min-h-screen bg-sidebar flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </SWRProvider>
  )
}
