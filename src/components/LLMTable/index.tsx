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
  { id: "chatgpt", name: "ChatGPT", icon: "/llms/gpt_black.webp" },
  { id: "claude", name: "Claude", icon: "/llms/claude.webp" },
  { id: "gemini", name: "Gemini", icon: "/llms/gemini.webp" },
  { id: "perplexity", name: "Perplexity", icon: "/llms/perplexity.webp" },
]

export function LLMTable() {
  const {
    transformedProjects,
    loading,
    error,
    selectedProviders,
    setSelectedProviders,
  } = useProjects()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  }>({ key: "overall", direction: "asc" })
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  )

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  const getBadgeColor = (score: number) => {
    if (score >= 9) return "green"
    if (score >= 7) return "yellow"
    return "red"
  }

  // Get unique categories from projects
  if (transformedProjects.length > 0 && uniqueCategories.length === 0) {
    const categories = [...new Set(transformedProjects.map((p) => p.category))]
    setUniqueCategories(categories)
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    )
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
          case "perplexity":
            return (
              modelName.includes("sonar") || modelName.includes("perplexity")
            )
          default:
            return false
        }
      })
    })
  }

  const filteredProjects = transformedProjects
    .filter((project) =>
      selectedCategories.length === 0
        ? true
        : selectedCategories.includes(project.category),
    )
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
            case "perplexity":
              return (
                modelName.includes("sonar") || modelName.includes("perplexity")
              )
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
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6 dark:border-gray-800">
        <div className="flex flex-col gap-4">
          {/* Model provider filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Model:
            </span>
            <div className="flex flex-wrap gap-2">
              {MODEL_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => toggleProvider(provider.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedProviders.includes(provider.id)
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
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

          {/* Category filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category:
            </span>
            <div className="flex flex-wrap gap-2">
              {uniqueCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    selectedCategories.includes(category)
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {capitalizeFirstLetter(category)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                onClick={() => handleSort("name")}
              >
                Name{" "}
                {sortConfig.key === "name" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                scope="col"
                className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                Best Models
              </th>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100"
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
                  className="cursor-pointer px-4 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100"
                  onClick={() => handleSort(category)}
                >
                  {category}{" "}
                  {sortConfig.key === category &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedProjects.map((project) => (
              <tr
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {project.name}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {capitalizeFirstLetter(project.category)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm">
                  <ModelRanking
                    models={getFilteredModelScores(project)}
                    category={project.category}
                  />
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
                        project.scores.categories[category].score,
                      )}
                    >
                      {project.scores.categories[category].score.toFixed(1)}
                    </Badge>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProjectModal
        projectId={selectedProjectId}
        isOpen={selectedProjectId !== null}
        onClose={() => setSelectedProjectId(null)}
      />
    </div>
  )
}
