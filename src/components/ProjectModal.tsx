"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import { getReadableModelName } from "@/lib/utils"
import { useProjects } from "@/contexts/ProjectContext"
import { ModelProvider } from "@/types/llm"
import Image from "next/image"
import { X } from "lucide-react"

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
  const { getProjectById, getTransformedProjectById } = useProjects()
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set())

  if (!projectId) return null

  const project = getProjectById(projectId)
  const transformedProject = getTransformedProjectById(projectId, false)

  if (!project || !transformedProject) return null

  const bestModel = transformedProject.scores.topModels[0]
  const overallScore = transformedProject.scores.overall

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />

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
            <Dialog.Panel className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl border border-[#2d004d] bg-gradient-to-br from-[#0a001a] via-[#1a0033] to-[#2d004d] p-0 text-left align-middle shadow-2xl transition-all">
              {/* Subtle Accent Bar */}
              <div className="h-1 w-full bg-[#2d004d]" />
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-6 top-6 z-10 rounded-full bg-[#1a0033] p-2 text-purple-200 transition-colors hover:bg-[#2d004d]"
                aria-label="Close modal"
              >
                <X size={22} />
              </button>
              {/* Header */}
              <div className="px-10 pb-2 pt-8">
                <Dialog.Title className="mb-2 text-3xl font-bold text-purple-100">
                  {project.name}
                </Dialog.Title>
                <p className="mb-8 text-base text-purple-200">
                  {project.description}
                </p>
              </div>

              {/* Score Cards */}
              <div className="mb-8 grid grid-cols-2 gap-8 px-10">
                {/* Overall Score */}
                <div className="flex flex-col items-start justify-start rounded-2xl border border-[#2d004d] bg-[#12001a] p-8 shadow">
                  <h3 className="mb-6 text-xl font-semibold text-purple-200">
                    Overall Score
                  </h3>
                  <div className="flex items-baseline">
                    <div className="text-[72px] font-extrabold leading-none tracking-tighter text-purple-300">
                      {overallScore.toFixed(1)}
                    </div>
                    <div className="ml-1 text-2xl font-medium text-purple-400">
                      /10
                    </div>
                  </div>
                </div>

                {/* Best Model */}
                <div className="relative flex flex-col items-start justify-start rounded-2xl border border-[#2d004d] bg-[#12001a] p-8 shadow">
                  <span className="absolute right-6 top-6 rounded-full bg-[#2d004d] px-3 py-1 text-xs font-bold text-purple-200 shadow">
                    Best
                  </span>
                  <h3 className="mb-6 text-xl font-semibold text-purple-200">
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
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span className="text-2xl font-semibold text-purple-100">
                          {getReadableModelName(bestModel.name)}
                        </span>
                      </div>
                      <div className="flex items-baseline">
                        <div className="text-[56px] font-bold leading-none tracking-tighter text-purple-300">
                          {bestModel.score.toFixed(1)}
                        </div>
                        <div className="ml-1 text-xl font-medium text-purple-400">
                          /10
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Scores */}
              <div className="space-y-4 p-10">
                <h3 className="mb-4 text-xl font-semibold text-purple-200">
                  Category Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(transformedProject.scores.categories).map(
                    ([category, data]) => (
                      <div
                        key={category}
                        className="flex flex-col rounded-xl border border-[#2d004d] bg-[#12001a] p-6 shadow"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-lg font-semibold text-purple-100">
                            {category}
                          </span>
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold text-purple-300">
                              {data.score.toFixed(1)}
                            </span>
                            <span className="ml-1 text-xs text-purple-400">
                              /10
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="mb-2 text-sm font-medium text-purple-200">
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
                                    className="flex items-start justify-between gap-2 text-sm text-purple-100"
                                  >
                                    <div className="flex items-start gap-2">
                                      <span>• {criteria.name}</span>
                                      {criteria.description && (
                                        <div className="group relative inline-block">
                                          <button
                                            className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2d004d] text-xs font-medium text-purple-200 hover:bg-[#1a0033]"
                                            aria-label="Show description"
                                          >
                                            ?
                                          </button>
                                          <div className="invisible absolute left-6 top-0 z-10 w-64 rounded-lg bg-[#12001a] p-4 text-sm text-purple-100 shadow-lg transition-opacity group-hover:visible">
                                            {criteria.description}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-baseline">
                                      <span className="font-medium text-purple-300">
                                        {criteriaScore?.toFixed(1) || "N/A"}
                                      </span>
                                      <span className="ml-1 text-xs text-purple-400">
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
                <div className="py-10">
                  <h3 className="mb-4 text-xl font-semibold text-purple-200">
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
                          className="overflow-hidden rounded-xl border border-[#2d004d] bg-[#12001a] shadow"
                        >
                          {/* Model Header */}
                          <div
                            className="flex cursor-pointer items-center justify-between border-b border-[#2d004d] px-6 py-4"
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
                                    className="object-contain"
                                  />
                                </div>
                              )}
                              <span className="font-medium text-purple-100">
                                {getReadableModelName(model.name)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-baseline">
                                <span className="font-medium text-purple-300">
                                  {(
                                    transformedProject.scores.topModels.find(
                                      (m) => m.name === model.name,
                                    )?.score || 0
                                  ).toFixed(1)}
                                </span>
                                <span className="ml-1 text-xs text-purple-400">
                                  /10
                                </span>
                              </div>
                              <span className="text-sm text-purple-400">
                                {expandedModels.has(model.name) ? "▼" : "▶"}
                              </span>
                            </div>
                          </div>

                          {/* Model Details */}
                          {expandedModels.has(model.name) && (
                            <div className="divide-y divide-[#0a001a]">
                              {Object.entries(
                                transformedProject.scores.categories,
                              ).map(([category, data]) => {
                                const modelScore = data.modelScores.find(
                                  (score) => score.name === model.name,
                                )
                                return (
                                  <div key={category} className="px-6 py-4">
                                    <div className="mb-2 flex items-center justify-between">
                                      <span className="font-medium text-purple-100">
                                        {category}
                                      </span>
                                      <div className="flex items-baseline">
                                        <span className="font-medium text-purple-300">
                                          {modelScore
                                            ? modelScore.score.toFixed(1)
                                            : "N/A"}
                                        </span>
                                        <span className="ml-1 text-xs text-purple-400">
                                          /10
                                        </span>
                                      </div>
                                    </div>
                                    <ul className="space-y-2">
                                      {data.criteria.map((criteria) => {
                                        const modelCriteriaScores =
                                          data.criteriaScoresPerModel[
                                            model.provider
                                          ]?.[model.name]
                                        const criteriaScore =
                                          modelCriteriaScores?.[criteria.name]
                                        return (
                                          <li
                                            key={criteria.name}
                                            className="flex items-start justify-between gap-2 text-sm text-purple-100"
                                          >
                                            <div className="flex items-start gap-2">
                                              <span>• {criteria.name}</span>
                                              {criteria.description && (
                                                <div className="group relative inline-block">
                                                  <button
                                                    className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2d004d] text-xs font-medium text-purple-200 hover:bg-[#1a0033]"
                                                    aria-label="Show description"
                                                  >
                                                    ?
                                                  </button>
                                                  <div className="invisible absolute left-6 top-0 z-10 w-64 rounded-lg bg-[#12001a] p-4 text-sm text-purple-100 shadow-lg transition-opacity group-hover:visible">
                                                    {criteria.description}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex items-baseline">
                                              <span className="font-medium text-purple-300">
                                                {criteriaScore?.toFixed(1) ||
                                                  "N/A"}
                                              </span>
                                              <span className="ml-1 text-xs text-purple-400">
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
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  )
}
