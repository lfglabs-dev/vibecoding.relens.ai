"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useProjects } from "@/contexts/ProjectContext"
import { RadarGraph } from "./RadarGraph"
import { Sparkles } from "lucide-react"
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal"
import { motion } from "framer-motion"

interface MetricCardProps {
  icon: React.ReactNode
  title: string
  score: number
  maxScore: number
  progress: number
  ranking: number
  barColor: string
}

const MetricCard = ({
  icon,
  title,
  score,
  maxScore,
  progress,
  ranking,
  barColor,
}: MetricCardProps) => {
  const getRankingSuffix = (rank: number) => {
    if (rank === 1) return "st"
    if (rank === 2) return "nd"
    if (rank === 3) return "rd"
    return "th"
  }

  return (
    <motion.div
      className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/70"
      whileHover={{
        scale: 1.03,
        borderColor: "rgba(168, 85, 247, 0.5)",
        transition: { duration: 0.2 },
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center">{icon}</div>
        <div
          className={`rounded-full px-2 py-1 text-xs font-bold ${
            ranking === 1
              ? "bg-yellow-500/20 text-yellow-400"
              : ranking === 2
                ? "bg-gray-300/20 text-gray-300"
                : ranking === 3
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-blue-500/20 text-blue-400"
          }`}
        >
          {ranking}
          {getRankingSuffix(ranking)}
        </div>
      </div>

      <h3 className="mb-2 text-sm font-medium text-gray-300">{title}</h3>

      <div className="mb-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-sm text-gray-400">/{maxScore}</span>
      </div>

      <div className="h-2 w-full rounded-full bg-gray-700/50">
        <motion.div
          className={`h-2 rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  )
}

interface ModelScore {
  modelName: string
  totalScore: number
  count: number
  averageScore: number
}

export const PerformanceRadar = () => {
  const { transformedProjects, loading } = useProjects()
  const [modelMetrics, setModelMetrics] = useState<ModelScore[]>([])

  useEffect(() => {
    if (!loading && transformedProjects.length > 0) {
      // Calculate average scores for each AI model across ALL projects and ALL categories
      // Exclude Speed from ranking calculations
      const modelScores: Record<string, { total: number; count: number }> = {}

      transformedProjects.forEach((project) => {
        // Get all model scores from categories EXCEPT Speed
        Object.entries(project.scores.categories).forEach(
          ([categoryName, category]) => {
            // Skip Speed category for ranking calculations
            if (categoryName === "Speed") return

            category.modelScores.forEach((model) => {
              if (!modelScores[model.name]) {
                modelScores[model.name] = { total: 0, count: 0 }
              }
              modelScores[model.name].total += model.score
              modelScores[model.name].count += 1
            })
          },
        )
      })

      // Calculate averages and sort by score
      const metrics = Object.entries(modelScores)
        .map(([modelName, { total, count }]) => ({
          modelName,
          totalScore: total,
          count,
          averageScore: total / count,
        }))
        .sort((a, b) => b.averageScore - a.averageScore)

      setModelMetrics(metrics)
    }
  }, [transformedProjects, loading])

  // AI Model logos - map by actual model names from data
  const modelLogos: Record<string, string> = {
    "GPT-5.1": "/llms/gpt_black.webp",
    "GPT-4": "/llms/gpt_black.webp",
    "Claude-4.1-Opus": "/llms/claude.webp",
    "Claude-Sonnet-4.5": "/llms/claude.webp",
    "Gemini-3-Pro": "/llms/gemini.webp",
  }

  // Function to get logo for a model
  const getModelLogo = (modelName: string) => {
    const logoUrl = modelLogos[modelName]
    if (logoUrl) {
      return (
        <div className="relative flex h-12 w-12 items-center justify-center">
          <Image
            src={logoUrl}
            alt={`${modelName} logo`}
            width={48}
            height={48}
            className="rounded-lg object-contain"
            unoptimized
          />
        </div>
      )
    }
    return (
      <div className="flex h-12 w-12 items-center justify-center text-gray-300">
        <Sparkles className="h-8 w-8" />
      </div>
    )
  }

  // Color array to cycle through
  const colors = [
    "bg-gradient-to-r from-purple-500 to-purple-600",
    "bg-gradient-to-r from-cyan-400 to-cyan-500",
    "bg-gradient-to-r from-yellow-400 to-orange-500",
  ]

  const metrics = modelMetrics.map((model, index) => {
    const score = Math.round(model.averageScore * 10) / 10 // Round to 1 decimal
    const maxScore = 10
    const progress = (score / maxScore) * 100

    return {
      icon: getModelLogo(model.modelName),
      title: model.modelName,
      score: score,
      maxScore: maxScore,
      progress: Math.min(progress, 100), // Cap at 100%
      ranking: index + 1, // Since models are sorted by score, index + 1 = ranking
      barColor: colors[index % colors.length],
    }
  })

  if (loading) {
    return (
      <section className="relative px-4 py-20">
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20">
              <svg
                className="h-8 w-8 animate-spin text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <p className="text-xl text-gray-400">Loading projects...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="relative px-4 py-20">
        <div className="relative mx-auto max-w-7xl">
          {/* Header */}
          <ScrollReveal className="mb-16 text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20">
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>

            <h2 className="mb-6 text-5xl font-bold md:text-6xl">
              The&nbsp;
              <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
                Vibe Coding
              </span>
              <br />
              <span className="text-white">Leaderboard</span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-400">
              We evaluate AI models on different development tasks to help you
              choose the best model for frontend, backend, data analysis, and
              more.
            </p>
          </ScrollReveal>

          {/* Metrics Grid */}
          <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <StaggerItem key={metric.title}>
                <MetricCard {...metric} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Radar Chart Section */}
      <RadarGraph />
    </>
  )
}
