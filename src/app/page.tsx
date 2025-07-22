"use client"

import { LLMTable } from "@/components/LLMTable"
import { PerformanceRadar } from "@/components/PerformanceRadar"

export default function Home() {
  return (
    <main>
      <PerformanceRadar />
      <div className="container mx-auto px-4 py-8 rounded-lg">
        <LLMTable />
      </div>
    </main>
  )
}
