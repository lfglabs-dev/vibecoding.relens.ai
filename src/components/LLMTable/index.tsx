"use client"

import { useState } from "react"
import {
  ModelProvider,
  CriteriaCategoryBase,
  TransformedProject,
} from "@/types/llm"
import { Badge } from "@/components/Badge"
import { ModelRanking } from "./ModelRanking"
import Image from "next/image"
import { ProjectModal } from "../ProjectModal"
import { capitalizeFirstLetter } from "@/lib/utils"
import { useProjects } from "@/contexts/ProjectContext"

const CRITERIA_CATEGORIES: CriteriaCategoryBase[] = [
  "Code Quality Support",
  "Code Compilation",
  "Problem Solving Helpfulness",
  "Security Awareness",
]

const MODEL_PROVIDERS: { id: ModelProvider; name: string; icon: string }[] = [
  { id: "chatgpt", name: "GPT 4o", icon: "/llms/gpt_black.webp" },
  { id: "claude", name: "Claude Sonnet 4", icon: "/llms/claude.webp" },
  { id: "gemini", name: "Gemini 2.5 pro", icon: "/llms/gemini.webp" },
]

export function LLMTable() {
  const {
    transformedProjects,
    loading,
    error,
    selectedProviders,
    setSelectedProviders,
  } = useProjects()
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  }>({ key: "overall", direction: "asc" })
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  )

  if (loading) {
    return null
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  const getBadgeColor = (score: number) => {
    if (score >= 9) return "purple"
    if (score >= 7) return "purple-light"
    return "purple-dark"
  }

  const toggleProvider = (provider: ModelProvider) => {
    setSelectedProviders(
      selectedProviders.includes(provider)
        ? selectedProviders.filter((p) => p !== provider)
        : [...selectedProviders, provider],
    )
  }

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const getFilteredModelScores = (project: TransformedProject) => {
    if (selectedProviders.length === 0) {
      return project.scores.topModels
    }

    return project.scores.topModels.filter((model) => {
      // For each selected provider, check if the model belongs to that family
      return selectedProviders.some((selectedProvider) => {
        if (selectedProvider === model.provider) return true

        // Special handling for model families
        const modelName = model.name.toLowerCase()
        switch (selectedProvider) {
          case "chatgpt":
            return modelName.includes("gpt")
          case "claude":
            return modelName.includes("claude")
          case "gemini":
            return modelName.includes("gemini")
          default:
            return false
        }
      })
    })
  }

  const filteredProjects = transformedProjects
    // Only keep projects that actually have at least one evaluated run
    .filter((project) => project.hasEvaluations)
    // And exclude projects whose overall score is 0 (no positive signal)
    .filter((project) => project.scores.overall > 0)
    .filter((project) => {
      if (selectedProviders.length === 0) return true

      return project.scores.topModels.some((model) =>
        selectedProviders.some((selectedProvider) => {
          if (selectedProvider === model.provider) return true

          const modelName = model.name.toLowerCase()
          switch (selectedProvider) {
            case "chatgpt":
              return modelName.includes("gpt")
            case "claude":
              return modelName.includes("claude")
            case "gemini":
              return modelName.includes("gemini")
            default:
              return false
          }
        }),
      )
    })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const direction = sortConfig.direction === "asc" ? 1 : -1

    if (sortConfig.key === "name") {
      return a.name.localeCompare(b.name) * direction
    }

    if (sortConfig.key === "overall") {
      return (b.scores.overall - a.scores.overall) * direction
    }

    // Handle sorting by specific category
    return (
      (b.scores.categories[sortConfig.key as CriteriaCategoryBase].score -
        a.scores.categories[sortConfig.key as CriteriaCategoryBase].score) *
      direction
    )
  })

  return (
    <div className="space-y-6">
      <div className="w-full overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-lg">
        <div className="border-b border-purple-900 bg-transparent px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4">
            {/* Model provider filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-purple-100">
                Model:
              </span>
              <div className="flex flex-wrap gap-2">
                {MODEL_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => toggleProvider(provider.id)}
                    className={`flex items-center gap-2 rounded-full border border-purple-700/40 px-3 py-1.5 text-sm font-medium shadow-sm transition-colors ${
                      selectedProviders.includes(provider.id)
                        ? "bg-purple-700/80 text-white"
                        : "bg-purple-900/40 text-purple-100 hover:bg-purple-800/60"
                    } `}
                  >
                    <Image
                      src={provider.icon}
                      alt={provider.name}
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                    {provider.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-900 rounded-2xl bg-transparent">
            <thead className="bg-gradient-to-r from-purple-950/30 via-purple-950/10 to-purple-950/30">
              <tr>
                <th
                  scope="col"
                  className="cursor-pointer px-4 py-3.5 text-left text-sm font-semibold text-purple-100"
                  onClick={() => handleSort("name")}
                >
                  Name{" "}
                  {sortConfig.key === "name" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-semibold text-purple-100"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-semibold text-purple-100"
                >
                  Best Models
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-4 py-3.5 text-center text-sm font-semibold text-purple-100"
                  onClick={() => handleSort("overall")}
                >
                  Overall Score{" "}
                  {sortConfig.key === "overall" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                {CRITERIA_CATEGORIES.map((category) => (
                  <th
                    key={category}
                    scope="col"
                    className="cursor-pointer px-4 py-3.5 text-center text-sm font-semibold text-purple-100"
                    onClick={() => handleSort(category)}
                  >
                    {category}{" "}
                    {sortConfig.key === category &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/60">
              {sortedProjects.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className="cursor-pointer transition-colors hover:bg-purple-900/30"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-purple-100">
                    {project.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-purple-200">
                    {capitalizeFirstLetter(project.category)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm">
                    <ModelRanking models={getFilteredModelScores(project)} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-center text-sm">
                    <Badge color={getBadgeColor(project.scores.overall)}>
                      {project.scores.overall.toFixed(1)}
                    </Badge>
                  </td>
                  {CRITERIA_CATEGORIES.map((category) => (
                    <td
                      key={category}
                      className="whitespace-nowrap px-4 py-4 text-center text-sm"
                    >
                      <Badge
                        color={getBadgeColor(
                          project.scores.categories[category]?.score,
                        )}
                      >
                        {project.scores.categories[category]?.score?.toFixed(1)}
                      </Badge>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ProjectModal
        projectId={selectedProjectId}
        isOpen={selectedProjectId !== null}
        onClose={() => setSelectedProjectId(null)}
      />
    </div>
  )
}
