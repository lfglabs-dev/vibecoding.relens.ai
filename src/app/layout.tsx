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
              <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
                <div className="flex h-16 items-center space-x-4 px-6 sm:justify-between sm:space-x-0">
                  <div className="flex items-center gap-6 text-base font-medium">
                    <h1 className="text-xl font-bold">
                      Vibe Coding Tools Index
                    </h1>
                  </div>
                  <div className="flex flex-1 items-center justify-end space-x-4">
                    <a
                      href={process.env.NEXT_PUBLIC_METHODOLOGY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-book-open"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                      Methodology
                    </a>
                  </div>
                </div>
              </header>
              <main className="flex-1 px-6 py-6">{children}</main>
            </div>
          </ProjectProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
