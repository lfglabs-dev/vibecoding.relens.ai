import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import localFont from "next/font/local"
import "./globals.css"
import { ProjectProvider } from "@/contexts/ProjectContext"
import { Github } from "lucide-react"

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
  title: "The Vibe coding leaderboard",
  description: "The Vibe coding leaderboard ranks dev-tools based on how well AI models generate accurate code and applications with them.",
  keywords: ["Vibe coding", "AI Models", "Performance Metrics", "The Vibe coding Leaderboard"],
  authors: [
    {
      name: "ReLens AI",  
      url: "https://relens.ai",
    },
  ],
  creator: "ReLens AI",
  alternates: {
    canonical: "https://vivecoding.relance.ai/",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-900" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full font-sans antialiased text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProjectProvider>
            <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-black">
              {/* Background pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent pointer-events-none"></div>
              
              <header className="sticky top-0 z-40 w-full border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
                <div className="flex h-16 items-center px-6">
                  <div className="flex flex-1 items-center justify-center">
                    <a
                      href="https://relens.ai/blog/vibecoding-leaderboard-methodology"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
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
                  <a
                    href="https://github.com/lfglabs-dev/vibecoding.relens.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center rounded-lg p-2 text-gray-300 transition-colors hover:bg-gray-800"
                    aria-label="View source code on GitHub"
                  >
                    <Github size={20} />
                  </a>
                </div>
              </header>
              <main className="relative flex-1">{children}</main>
            </div>
          </ProjectProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
