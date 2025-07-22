"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import { getReadableModelName } from "@/lib/utils"
import { useProjects } from "@/contexts/ProjectContext"
import { ModelProvider, ModelScore, CriteriaCategoryBase } from "@/types/llm"
import Image from "next/image"
import { createRoot } from "react-dom/client"
import { ProjectProvider } from "@/contexts/ProjectContext"

interface ProjectModalProps {
  projectId: string | null
  isOpen: boolean
  onClose: () => void
}

const getProviderIcon = (provider: ModelProvider) => {
  switch (provider) {
    case "chatgpt":
      return "/llms/gpt_black.webp"
    case "claude":
      return "/llms/claude.webp"
    case "gemini":
      return "/llms/gemini.webp"
    default:
      return null
  }
}

export function ProjectModal({
  projectId,
  isOpen,
  onClose,
}: ProjectModalProps) {
  const { getProjectById, getTransformedProjectById, transformedProjects } =
    useProjects()
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set())

  if (!projectId) return null

  const project = getProjectById(projectId)
  const transformedProject = getTransformedProjectById(projectId, false)

  if (!project || !transformedProject) return null

  const bestModel = transformedProject.scores.topModels[0]
  const overallScore = transformedProject.scores.overall

  // Get related projects (same category, excluding current project)
  const relatedProjects = transformedProjects
    .filter(
      (p) =>
        p.category === transformedProject.category &&
        p.id !== transformedProject.id,
    )
    .sort((a, b) => b.scores.overall - a.scores.overall)

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
              {/* Header */}
              <Dialog.Title className="mb-2 text-2xl font-semibold">
                {project.name}
              </Dialog.Title>
              <p className="mb-8 text-gray-600 dark:text-gray-300">
                {project.description}
              </p>

              {/* Score Cards */}
              <div className="mb-8 grid grid-cols-2 gap-8">
                {/* Overall Score */}
                <div className="flex flex-col items-start justify-start rounded-2xl bg-gray-50 p-8 dark:bg-gray-700">
                  <h3 className="mb-6 text-xl font-medium">Overall Score</h3>
                  <div className="flex items-baseline">
                    <div className="text-[72px] font-bold leading-none tracking-tighter text-orange-500">
                      {overallScore.toFixed(1)}
                    </div>
                    <div className="ml-1 text-2xl font-medium text-orange-500/70">
                      /10
                    </div>
                  </div>
                </div>

                {/* Best Model */}
                <div className="flex flex-col items-start justify-start rounded-2xl bg-gray-50 p-8 dark:bg-gray-700">
                  <h3 className="mb-6 text-xl font-medium">
                    Best Performing Model
                  </h3>
                  {bestModel && (
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getProviderIcon(bestModel.provider) && (
                          <div className="relative h-10 w-10">
                            <Image
                              src={getProviderIcon(bestModel.provider)!}
                              alt={bestModel.provider}
                              fill
                              className="object-contain dark:invert"
                            />
                          </div>
                        )}
                        <span className="text-2xl font-medium">
                          {getReadableModelName(bestModel.name)}
                        </span>
                      </div>
                      <div className="flex items-baseline">
                        <div className="text-[56px] font-bold leading-none tracking-tighter text-orange-500">
                          {bestModel.score.toFixed(1)}
                        </div>
                        <div className="ml-1 text-xl font-medium text-orange-500/70">
                          /10
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Scores */}
              <div className="space-y-4">
                <h3 className="mb-4 text-xl font-medium">Category Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(transformedProject.scores.categories).map(
                    ([category, data]) => (
                      <div
                        key={category}
                        className="flex flex-col rounded-xl bg-gray-50 p-6 dark:bg-gray-700"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-lg font-medium">
                            {category}
                          </span>
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold text-orange-500">
                              {data.score.toFixed(1)}
                            </span>
                            <span className="ml-1 text-xs text-orange-500/70">
                              /10
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                            Evaluation Criteria:
                          </p>
                          <ul className="space-y-1">
                            {transformedProject.criteriaDefinitions
                              .filter((criteria) => {
                                // Get the criteria list for this category from the survey metadata
                                const survey = project.surveys.find(
                                  (s) =>
                                    s.pipeline_metadata?.feature_name ===
                                      category &&
                                    s.pipeline_metadata?.criterias?.some(
                                      (c) =>
                                        c
                                          .split(":")[0]
                                          ?.replace(/^\d+\.\s*/, "")
                                          .trim() === criteria.name,
                                    ),
                                )
                                return Boolean(survey)
                              })
                              .map((criteria) => {
                                const criteriaScore =
                                  data.criteriaScores[criteria.name]
                                return (
                                  <li
                                    key={criteria.name}
                                    className="flex items-start justify-between gap-2 text-sm text-gray-600 dark:text-gray-300"
                                  >
                                    <div className="flex items-start gap-2">
                                      <span>• {criteria.name}</span>
                                      {criteria.description && (
                                        <div className="group relative inline-block">
                                          <button
                                            className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                                            aria-label="Show description"
                                          >
                                            ?
                                          </button>
                                          <div className="invisible absolute left-6 top-0 z-10 w-64 rounded-lg bg-white p-4 text-sm text-gray-600 shadow-lg transition-opacity group-hover:visible dark:bg-gray-800 dark:text-gray-300">
                                            {criteria.description}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-baseline">
                                      <span className="font-medium text-orange-500">
                                        {criteriaScore?.toFixed(1) || "N/A"}
                                      </span>
                                      <span className="ml-1 text-xs text-orange-500/70">
                                        /10
                                      </span>
                                    </div>
                                  </li>
                                )
                              })}
                          </ul>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                {/* Detailed Model Scores */}
                <div className="mt-8">
                  <h3 className="mb-4 text-xl font-medium">
                    Detailed Model Performance
                  </h3>
                  <div className="space-y-4">
                    {Object.values(transformedProject.scores.categories)
                      .flatMap((category) => category.modelScores)
                      .filter(
                        (model, index, self) =>
                          index ===
                          self.findIndex((m) => m.name === model.name),
                      )
                      .sort((a, b) => b.score - a.score)
                      .map((model) => (
                        <div
                          key={model.name}
                          className="overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-700"
                        >
                          {/* Model Header */}
                          <div
                            className="flex cursor-pointer items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-600"
                            onClick={() => {
                              setExpandedModels((prev) => {
                                const newSet = new Set(prev)
                                if (newSet.has(model.name)) {
                                  newSet.delete(model.name)
                                } else {
                                  newSet.add(model.name)
                                }
                                return newSet
                              })
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {getProviderIcon(model.provider) && (
                                <div className="relative h-6 w-6">
                                  <Image
                                    src={getProviderIcon(model.provider)!}
                                    alt={model.provider}
                                    fill
                                    className="object-contain dark:invert"
                                  />
                                </div>
                              )}
                              <span className="font-medium">
                                {getReadableModelName(model.name)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-baseline">
                                <span className="font-medium text-orange-500">
                                  {(
                                    transformedProject.scores.topModels.find(
                                      (m) => m.name === model.name,
                                    )?.score || 0
                                  ).toFixed(1)}
                                </span>
                                <span className="ml-1 text-xs text-orange-500/70">
                                  /10
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {expandedModels.has(model.name) ? "▼" : "▶"}
                              </span>
                            </div>
                          </div>

                          {/* Model Details */}
                          {expandedModels.has(model.name) && (
                            <div className="divide-y divide-gray-200 dark:divide-gray-600">
                              {Object.entries(
                                transformedProject.scores.categories,
                              ).map(([category, data]) => {
                                const modelScore = data.modelScores.find(
                                  (score) => score.name === model.name,
                                )
                                return (
                                  <div key={category} className="px-6 py-4">
                                    <div className="mb-2 flex items-center justify-between">
                                      <span className="font-medium">
                                        {category}
                                      </span>
                                      <div className="flex items-baseline">
                                        <span className="font-medium text-orange-500">
                                          {modelScore
                                            ? modelScore.score.toFixed(1)
                                            : "N/A"}
                                        </span>
                                        <span className="ml-1 text-xs text-orange-500/70">
                                          /10
                                        </span>
                                      </div>
                                    </div>
                                    <ul className="space-y-2">
                                      {data.criteria.map((criteria) => {
                                        const criteriaScore =
                                          data.criteriaScores[criteria.name]
                                        return (
                                          <li
                                            key={criteria.name}
                                            className="flex items-start justify-between gap-2 text-sm text-gray-600 dark:text-gray-300"
                                          >
                                            <div className="flex items-start gap-2">
                                              <span>• {criteria.name}</span>
                                              {criteria.description && (
                                                <div className="group relative inline-block">
                                                  <button
                                                    className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                                                    aria-label="Show description"
                                                  >
                                                    ?
                                                  </button>
                                                  <div className="invisible absolute left-6 top-0 z-10 w-64 rounded-lg bg-white p-4 text-sm text-gray-600 shadow-lg transition-opacity group-hover:visible dark:bg-gray-800 dark:text-gray-300">
                                                    {criteria.description}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex items-baseline">
                                              <span className="font-medium text-orange-500">
                                                {criteriaScore?.toFixed(1) ||
                                                  "N/A"}
                                              </span>
                                              <span className="ml-1 text-xs text-orange-500/70">
                                                /10
                                              </span>
                                            </div>
                                          </li>
                                        )
                                      })}
                                    </ul>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Related Projects */}
                {relatedProjects.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-xl font-medium">Related Projects</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {relatedProjects.map((relatedProject) => (
                        <button
                          key={relatedProject.id}
                          onClick={() => {
                            // Close current modal first
                            onClose()
                            // Small delay to avoid modal transition conflicts
                            setTimeout(() => {
                              const container = document.createElement("div")
                              document.body.appendChild(container)
                              const root = createRoot(container)
                              const cleanup = () => {
                                root.unmount()
                                document.body.removeChild(container)
                              }
                              root.render(
                                <ProjectProvider>
                                  <ProjectModal
                                    projectId={relatedProject.id}
                                    isOpen={true}
                                    onClose={cleanup}
                                  />
                                </ProjectProvider>,
                              )
                            }, 300)
                          }}
                          className="flex items-start gap-4 rounded-xl bg-gray-50 p-6 text-left transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                          <div className="flex-1">
                            <h4 className="mb-2 font-medium">
                              {relatedProject.name}
                            </h4>
                            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                              {relatedProject.description}
                            </p>
                          </div>
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold text-orange-500">
                              {relatedProject.scores.overall.toFixed(1)}
                            </span>
                            <span className="ml-1 text-xs text-orange-500/70">
                              /10
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  )
}
