import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
})

export const metadata: Metadata = {
  title: 'Sooniq — Absence Management',
  description: 'Report absences, track schedules, and manage notifications for your school.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
