import { ModelScore } from "@/types/llm"
import Image from "next/image"
import { useState } from "react"
import { getReadableModelName } from "@/lib/utils"

const MODEL_IMAGES = {
  chatgpt: "/llms/gpt_black.webp",
  claude: "/llms/claude.webp",
  gemini: "/llms/gemini.webp",
  perplexity: "/llms/perplexity.webp",
  other: "/llms/cursor.webp",
} as const

interface ModelRankingProps {
  models: ModelScore[]
  category: string
}

export function ModelRanking({ models, category }: ModelRankingProps) {
  const [hoveredModel, setHoveredModel] = useState<ModelScore | null>(null)

  // Sort all models by score
  const sortedModels = [...models].sort((a, b) => b.score - a.score).slice(0, 3) // Take top 3 models

  if (sortedModels.length === 0) {
    return <span className="text-gray-400">No models available</span>
  }

  return (
    <div className="relative flex items-center space-x-2">
      {sortedModels.map((model, index) => (
        <div
          key={`${model.provider}-${model.name}-${index}`}
          className="relative"
          onMouseEnter={() => setHoveredModel(model)}
          onMouseLeave={() => setHoveredModel(null)}
        >
          <div className="relative h-6 w-6">
            <Image
              src={
                MODEL_IMAGES[model.provider as keyof typeof MODEL_IMAGES] ||
                MODEL_IMAGES.other
              }
              alt={getReadableModelName(model.name)}
              fill
              className="rounded-full object-contain"
            />
            <div
              className={`absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-black ${
                index === 0
                  ? "bg-yellow-400"
                  : index === 1
                    ? "bg-gray-300"
                    : "bg-amber-600"
              }`}
            >
              {index + 1}
            </div>
          </div>

          {hoveredModel && hoveredModel.name === model.name && (
            <div className="absolute -left-2 top-8 z-10 rounded-lg bg-white p-1.5 shadow-lg dark:bg-gray-800">
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium">
                    {getReadableModelName(model.name)}
                  </span>
                  <span className="ml-1 text-gray-500">
                    {model.score.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
