"use client"

import * as React from "react"
import { RadarChart } from "@mui/x-charts/RadarChart"
import { CriteriaCategoryBase } from "@/types/llm"
import { useProjects } from "@/contexts/ProjectContext"

const RADAR_METRICS: CriteriaCategoryBase[] = [
  "Code Quality Support",
  "Code Compilation",
  "Problem Solving Helpfulness",
  "Security Awareness",
]

// Color palette for AI models - matching the metric cards
const MODEL_COLORS: Record<string, string> = {
  "GPT-5.1": "#A855F7", // Purple
  "GPT-4": "#9333EA", // Darker Purple
  "Claude-4.1-Opus": "#06B6D4", // Cyan
  "Claude-Sonnet-4.5": "#0891B2", // Darker Cyan
  "Gemini-2.5-Pro": "#F59E0B", // Amber/Yellow
}

export const RadarGraph = () => {
  const { transformedProjects: projects, loading, error } = useProjects()
  const [highlightedMetricIndex, setHighlightedMetricIndex] = React.useState<
    number | null
  >(null)

  // Calculate series data with useMemo to avoid recreating on every render
  const { seriesWithScores, modelScoresByCriterion } = React.useMemo(() => {
    // Aggregate model scores across all tasks for each criterion
    const scores: Record<string, Record<CriteriaCategoryBase, number[]>> = {}

    projects.forEach((project) => {
      RADAR_METRICS.forEach((metric) => {
        const categoryData = project.scores.categories[metric]
        if (categoryData && categoryData.modelScores) {
          categoryData.modelScores.forEach((modelScore) => {
            if (!scores[modelScore.name]) {
              scores[modelScore.name] = {
                "Code Quality Support": [],
                "Code Compilation": [],
                "Problem Solving Helpfulness": [],
                "Security Awareness": [],
              }
            }
            scores[modelScore.name][metric].push(modelScore.score)
          })
        }
      })
    })

    // Calculate average scores for each model across all tasks for each criterion
    const withScores = Object.entries(scores).map(
      ([modelName, criteriaScores]) => {
        const data = RADAR_METRICS.map((metric) => {
          const metricScores = criteriaScores[metric]
          if (metricScores.length === 0) return 0
          const average =
            metricScores.reduce((sum, score) => sum + score, 0) /
            metricScores.length
          return Math.round(average * 10) / 10 // Round to 1 decimal
        })

        // Calculate overall average for sorting
        const overallAverage =
          data.reduce((sum, val) => sum + val, 0) / data.length

        return {
          label: modelName,
          data,
          color: MODEL_COLORS[modelName] || "#8B5CF6",
          hideMark: false,
          overallAverage,
        }
      },
    )

    return { seriesWithScores: withScores, modelScoresByCriterion: scores }
  }, [projects])

  // Sort series based on highlighted metric or overall average
  // When hovering over a specific metric, models are sorted by their score for that metric (highest first)
  // When not hovering, models are sorted by their overall average score (highest first)
  const series = React.useMemo(() => {
    const sorted = [...seriesWithScores].sort((a, b) => {
      if (
        highlightedMetricIndex !== null &&
        highlightedMetricIndex >= 0 &&
        highlightedMetricIndex < RADAR_METRICS.length
      ) {
        // Sort by the specific highlighted metric (highest first)
        return b.data[highlightedMetricIndex] - a.data[highlightedMetricIndex]
      }
      // Sort by overall average score (highest first)
      return b.overallAverage - a.overallAverage
    })

    return sorted.map(({ label, data, color, hideMark }) => ({
      label,
      data,
      color,
      hideMark,
    }))
  }, [seriesWithScores, highlightedMetricIndex])

  if (loading) {
    return (
      <section className="relative px-4 py-20">
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="text-xl text-gray-400">Loading radar chart...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="relative px-4 py-20">
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="text-xl text-gray-400">
              Error loading projects: {error}
            </p>
          </div>
        </div>
      </section>
    )
  }

  console.log("Radar series data (models):", series)
  console.log("Model scores by criterion:", modelScoresByCriterion)

  // Calculate dynamic scale based on actual data
  const allDataPoints = series.flatMap((s) => s.data)
  const minValue = Math.min(...allDataPoints)
  const maxValue = Math.max(...allDataPoints)
  const dataRange = maxValue - minValue

  // Create a very focused scale that maximizes differences
  // Use minimal padding to zoom in on the data range
  const scalePadding = dataRange * 0.02 // Only 2% padding for maximum zoom
  const dynamicMin = Math.max(0, minValue - scalePadding)
  const dynamicMax = maxValue + scalePadding

  const commonSettings = {
    height: 500,
    radar: {
      min: dynamicMin,
      max: dynamicMax,
      metrics: RADAR_METRICS.map((metric) =>
        metric
          .replace(" Support", "")
          .replace(" Helpfulness", "")
          .replace(" Awareness", ""),
      ),
    },
  }

  return (
    <section className="relative px-4 py-20">
      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h3 className="mb-6 text-4xl font-bold md:text-5xl">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
              Performance
            </span>
            <br />
            <span className="text-white">Breakdown</span>
          </h3>

          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-400">
            Compare how each AI model performs across the four key evaluation
            criteria, averaged across all development tasks.
          </p>
        </div>

        {/* Radar Chart */}
        <div className="rounded-2xl border border-gray-700/50 bg-gray-800/30 p-8 backdrop-blur-sm">
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <RadarChart
                {...commonSettings}
                series={series}
                shape="circular"
                divisions={10}
                onHighlightChange={(highlightedItem) => {
                  if (
                    highlightedItem &&
                    highlightedItem.dataIndex !== undefined
                  ) {
                    setHighlightedMetricIndex(highlightedItem.dataIndex)
                  } else {
                    setHighlightedMetricIndex(null)
                  }
                }}
                sx={{
                  "& .MuiChartsLegend-label": {
                    fill: "#FFFFFF !important",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "white",
                  },
                  "& .MuiChartsLegend-series": {
                    "& text": {
                      fill: "#FFFFFF !important",
                      fontWeight: 500,
                    },
                  },
                  "& .MuiChartsLegend-root": {
                    "& text": {
                      fill: "#FFFFFF !important",
                    },
                  },
                  "& text": {
                    fill: "#FFFFFF !important",
                  },
                  "& .MuiRadarGrid-stripe": {
                    fill: "purple",
                  },
                  "& .MuiRadarGrid-stripe:nth-of-type(even)": {
                    fill: "rgba(168, 85, 247, 0.1)", // Purple with low opacity
                  },
                  "& .MuiRadarGrid-radial": {
                    stroke: "white",
                  },
                  "& .MuiRadarGrid-divider": {
                    stroke: "white",
                    strokeWidth: 1,
                  },
                  backgroundColor: "transparent",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
