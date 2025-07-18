import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import localFont from "next/font/local"
import "./globals.css"
import { ProjectProvider } from "@/contexts/ProjectContext"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "Vibe Coding Tools Index",
  description: "Compare and analyze LLM models performance metrics",
  keywords: ["LLM", "AI Models", "Performance Metrics", "Dashboard"],
  authors: [
    {
      name: "Your Name",
      url: "https://github.com/yourusername",
    },
  ],
  creator: "Your Name",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background h-full font-sans antialiased dark:bg-gray-950`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProjectProvider>
            <div className="relative flex min-h-screen flex-col">
              <header className="bg-background sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800">
                <div className="container flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
                  <div className="flex items-center gap-6 text-base font-medium">
                    <h1 className="text-xl font-bold">
                      Vibe Coding Tools Index
                    </h1>
                  </div>
                  <div className="flex flex-1 items-center justify-end space-x-4"></div>
                </div>
              </header>
              <main className="container flex-1 py-6">{children}</main>
            </div>
          </ProjectProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
