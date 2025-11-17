import {
  Project,
  TransformedProject,
  ModelProvider,
  Survey,
  SurveyRun,
  ModelScore,
  CriteriaCategoryBase,
  CriteriaDefinition,
} from "@/types/llm"

const CATEGORIES: CriteriaCategoryBase[] = [
  "Code Quality Support",
  "Code Compilation",
  "Problem Solving Helpfulness",
  "Security Awareness",
]

// Try to map whatever is in pipeline_metadata.feature_name to one of our canonical categories.
const normalizeCategory = (
  featureName?: string | null,
): CriteriaCategoryBase | null => {
  if (!featureName) return null

  // If it's already one of our categories, keep it
  if (CATEGORIES.includes(featureName as CriteriaCategoryBase)) {
    return featureName as CriteriaCategoryBase
  }

  const f = featureName.toLowerCase()

  if (f.includes("quality") || f.includes("architecture"))
    return "Code Quality Support"
  if (f.includes("compil") || f.includes("build")) return "Code Compilation"
  if (f.includes("help") || f.includes("support") || f.includes("troubleshoot"))
    return "Problem Solving Helpfulness"
  if (f.includes("secur") || f.includes("auth") || f.includes("permission"))
    return "Security Awareness"

  return null
}

// Safely extract criteria list from pipeline_metadata, supporting multiple possible keys.
const getCriteriaList = (
  metadata:
    | {
        criterias?: string[]
        criteria?: string[]
        criteria_list?: string[]
        [key: string]: unknown
      }
    | null
    | undefined,
): string[] => {
  if (!metadata || typeof metadata !== "object") return []
  if (Array.isArray(metadata.criterias)) return metadata.criterias
  if (Array.isArray(metadata.criteria)) return metadata.criteria
  if (Array.isArray(metadata.criteria_list)) return metadata.criteria_list
  return []
}

export const getModelProvider = (modelName: string): ModelProvider => {
  const name = modelName.toLowerCase()
  if (name.includes("gpt")) return "chatgpt"
  if (name.includes("claude")) return "claude"
  if (name.includes("gemini")) return "gemini"
  return "other"
}

const isModelInFamily = (
  modelName: string,
  provider: ModelProvider,
): boolean => {
  const name = modelName.toLowerCase()
  switch (provider) {
    case "chatgpt":
      return name.includes("gpt")
    case "claude":
      return name.includes("claude")
    case "gemini":
      return name.includes("gemini")
    default:
      return false
  }
}

// Strip numbered prefix from criteria text (e.g., "1. Validity" -> "Validity")
const stripNumberPrefix = (text: string) => {
  return text
    .replace(/^\d+\.\s*/, "")
    .split(":")[0]
    .trim()
}

const getAllRuns = (
  surveys: Survey[],
): Array<{ run: SurveyRun; survey: Survey }> => {
  return surveys.flatMap((survey) =>
    (survey.survey_batches || []).flatMap((batch) =>
      (batch.runs || []).map((run) => ({ run, survey })),
    ),
  )
}

// Normalize different result shapes into a common "evaluation" format.
// Older data: result.criteria_evaluations[]
// Newer data (as in the sample): result.understanding (0-10) + optional review.
// Presence-style data: result.present: boolean
// Ranking-style data: result.results: { [query]: { rank: number } }
const getEvaluationsFromRun = (
  run: SurveyRun,
): { grade: number; criteria: string; review?: string }[] => {
  const result = run.result as {
    review?: string
    understanding?: number
    present?: boolean
    results?:
      | {
          [query: string]: {
            rank?: number
            [key: string]: unknown
          }
        }
      | unknown
    [key: string]: unknown
  }
  if (!result) return []

  // Fallback: single aggregate score, e.g. "understanding"
  if (typeof result.understanding === "number") {
    return [
      {
        grade: result.understanding,
        criteria: "Understanding",
        review: result.review,
      },
    ]
  }

  // Presence-style result: map present=true -> 10, false -> 0
  if (typeof result.present === "boolean") {
    return [
      {
        grade: result.present ? 10 : 0,
        criteria: "Presence",
        review: result.review,
      },
    ]
  }

  // Ranking-style result: results: { [query]: { rank: number } }
  if (result.results && typeof result.results === "object") {
    const evals: { grade: number; criteria: string }[] = []
    for (const [query, info] of Object.entries(
      result.results as Record<string, { rank?: number } | undefined>,
    )) {
      const rank = info?.rank
      if (typeof rank === "number") {
        // Convert rank (1 = best) into a 0-10 score. If rank is 0 or negative, treat as 0.
        const grade = rank <= 0 ? 0 : Math.max(0, 11 - rank)
        evals.push({
          grade,
          criteria: `Ranking: ${query}`,
        })
      }
    }
    if (evals.length > 0) {
      return evals
    }
  }

  return []
}

const calculateModelScores = (
  runsWithSurveys: Array<{ run: SurveyRun; survey: Survey }>,
  selectedProviders: ModelProvider[] = [],
): Record<CriteriaCategoryBase, ModelScore[]> => {
  const scoresByCategory: Record<
    CriteriaCategoryBase,
    Record<string, Record<string, number[]>>
  > = {
    "Code Quality Support": {},
    "Code Compilation": {},
    "Problem Solving Helpfulness": {},
    "Security Awareness": {},
  }

  // Collect scores by category, provider, and model
  runsWithSurveys.forEach(({ run, survey }) => {
    const evaluations = getEvaluationsFromRun(run)
    if (evaluations.length === 0) return

    const category =
      normalizeCategory(survey.pipeline_metadata?.feature_name) ??
      "Problem Solving Helpfulness"

    const modelName = run.metadata?.querier?.model_used?.name
    if (!modelName) return

    const provider = getModelProvider(modelName)

    // Skip if providers are selected and this model's provider is not included
    if (
      selectedProviders.length > 0 &&
      !selectedProviders.some(
        (selectedProvider) =>
          provider === selectedProvider ||
          isModelInFamily(modelName, selectedProvider),
      )
    ) {
      return
    }

    evaluations.forEach((evaluation) => {
      if (!scoresByCategory[category][provider]) {
        scoresByCategory[category][provider] = {}
      }
      if (!scoresByCategory[category][provider][modelName]) {
        scoresByCategory[category][provider][modelName] = []
      }

      scoresByCategory[category][provider][modelName].push(evaluation.grade)
    })
  })

  // Calculate averages and format results
  const result: Record<CriteriaCategoryBase, ModelScore[]> = {} as Record<
    CriteriaCategoryBase,
    ModelScore[]
  >

  CATEGORIES.forEach((category) => {
    result[category] = Object.entries(scoresByCategory[category]).flatMap(
      ([provider, modelScores]) =>
        Object.entries(modelScores).map(([modelName, scores]) => ({
          provider: provider as ModelProvider,
          name: modelName,
          score: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        })),
    )
  })

  return result
}

const calculateCriteriaScores = (
  runsWithSurveys: Array<{ run: SurveyRun; survey: Survey }>,
  selectedProviders: ModelProvider[] = [],
): {
  overall: Record<CriteriaCategoryBase, Record<string, number>>
  perModel: Record<
    CriteriaCategoryBase,
    Record<string, Record<string, Record<string, number>>>
  >
} => {
  // Initialize with all categories
  const scoresByCriteria: Record<
    CriteriaCategoryBase,
    Record<string, number[]>
  > = {
    "Code Quality Support": {},
    "Code Compilation": {},
    "Problem Solving Helpfulness": {},
    "Security Awareness": {},
  }

  const scoresPerModel: Record<
    CriteriaCategoryBase,
    Record<string, Record<string, Record<string, number[]>>>
  > = {
    "Code Quality Support": {},
    "Code Compilation": {},
    "Problem Solving Helpfulness": {},
    "Security Awareness": {},
  }

  // Collect scores by criteria
  runsWithSurveys.forEach(({ run, survey }) => {
    const evaluations = getEvaluationsFromRun(run)
    if (evaluations.length === 0) return

    const category =
      normalizeCategory(survey.pipeline_metadata?.feature_name) ??
      "Problem Solving Helpfulness"

    const modelName = run.metadata?.querier?.model_used?.name
    if (!modelName) return

    const provider = getModelProvider(modelName)

    // Skip if providers are selected and this model's provider is not included
    if (
      selectedProviders.length > 0 &&
      !selectedProviders.some(
        (selectedProvider) =>
          provider === selectedProvider ||
          isModelInFamily(modelName, selectedProvider),
      )
    ) {
      return
    }

    evaluations.forEach((evaluation) => {
      const criteriaName = stripNumberPrefix(evaluation.criteria)

      // Overall scores
      if (!scoresByCriteria[category][criteriaName]) {
        scoresByCriteria[category][criteriaName] = []
      }
      scoresByCriteria[category][criteriaName].push(evaluation.grade)

      // Per-model scores
      if (!scoresPerModel[category][provider]) {
        scoresPerModel[category][provider] = {}
      }
      if (!scoresPerModel[category][provider][modelName]) {
        scoresPerModel[category][provider][modelName] = {}
      }
      if (!scoresPerModel[category][provider][modelName][criteriaName]) {
        scoresPerModel[category][provider][modelName][criteriaName] = []
      }
      scoresPerModel[category][provider][modelName][criteriaName].push(
        evaluation.grade,
      )
    })
  })

  // Calculate averages for overall scores
  const overallScores = Object.fromEntries(
    CATEGORIES.map((category) => [
      category,
      Object.fromEntries(
        Object.entries(scoresByCriteria[category]).map(([criteria, scores]) => [
          criteria,
          scores.reduce((sum: number, score: number) => sum + score, 0) /
            scores.length,
        ]),
      ),
    ]),
  ) as Record<CriteriaCategoryBase, Record<string, number>>

  // Calculate averages for per-model scores
  const perModelScores = Object.fromEntries(
    CATEGORIES.map((category) => [
      category,
      Object.fromEntries(
        Object.entries(scoresPerModel[category]).map(
          ([provider, modelScores]) => [
            provider,
            Object.fromEntries(
              Object.entries(modelScores).map(([modelName, criteriaScores]) => [
                modelName,
                Object.fromEntries(
                  Object.entries(criteriaScores).map(([criteria, scores]) => [
                    criteria,
                    scores.reduce(
                      (sum: number, score: number) => sum + score,
                      0,
                    ) / scores.length,
                  ]),
                ),
              ]),
            ),
          ],
        ),
      ),
    ]),
  ) as Record<
    CriteriaCategoryBase,
    Record<string, Record<string, Record<string, number>>>
  >

  return {
    overall: overallScores,
    perModel: perModelScores,
  }
}

const calculateOverallScore = (categoryScores: ModelScore[]): number => {
  if (!categoryScores || categoryScores.length === 0) return 0

  // Filter out any undefined or null scores
  const validScores = categoryScores.filter(
    (score) => score && typeof score.score === "number",
  )
  if (validScores.length === 0) return 0

  return (
    validScores.reduce((sum, score) => sum + score.score, 0) /
    validScores.length
  )
}

const getTopModels = (
  categoryScores: Record<CriteriaCategoryBase, ModelScore[]>,
): ModelScore[] => {
  const modelScores: Record<string, { sum: number; count: number }> = {}

  // Collect all scores
  Object.values(categoryScores).forEach((scores) => {
    scores.forEach((score) => {
      const key = `${score.provider}:${score.name}`
      if (!modelScores[key]) {
        modelScores[key] = { sum: 0, count: 0 }
      }
      modelScores[key].sum += score.score
      modelScores[key].count += 1
    })
  })

  // Calculate averages and sort
  return Object.entries(modelScores)
    .map(([key, { sum, count }]) => {
      const [provider, name] = key.split(":")
      return {
        provider: provider as ModelProvider,
        name,
        score: sum / count,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

export const transformProject = (
  project: Project,
  selectedProviders: ModelProvider[] = [],
): TransformedProject => {
  const runsWithSurveys = getAllRuns(project.surveys)

  // Determine if this project has at least one evaluated run (any numeric signal)
  const hasEvaluations = runsWithSurveys.some(
    ({ run }) => getEvaluationsFromRun(run).length > 0,
  )

  // Calculate scores by category with selected providers
  const categoryScores = calculateModelScores(
    runsWithSurveys,
    selectedProviders,
  )

  // Calculate criteria scores
  const { overall: criteriaScores, perModel: criteriaScoresPerModel } =
    calculateCriteriaScores(runsWithSurveys, selectedProviders)

  // Calculate overall scores and get top models
  const scores = {
    categories: Object.fromEntries(
      CATEGORIES.map((category) => {
        const modelScores = categoryScores[category] || []
        return [
          category,
          {
            score: calculateOverallScore(modelScores),
            modelScores,
            criteriaScores: criteriaScores[category] || {},
            criteriaScoresPerModel: criteriaScoresPerModel[category] || {},
            criteria: project.surveys
              .filter(
                (survey) =>
                  (normalizeCategory(survey.pipeline_metadata?.feature_name) ??
                    "Problem Solving Helpfulness") === category,
              )
              .flatMap((survey) =>
                getCriteriaList(survey.pipeline_metadata).map(
                  (criteria: string) => ({
                    name: stripNumberPrefix(criteria),
                    description: criteria.split(":")[1]?.trim() || "",
                  }),
                ),
              )
              .filter(
                (def, index, self) =>
                  index === self.findIndex((d) => d.name === def.name),
              ),
          },
        ]
      }),
    ) as Record<
      CriteriaCategoryBase,
      {
        score: number
        modelScores: ModelScore[]
        criteriaScores: Record<string, number>
        criteriaScoresPerModel: Record<
          string,
          Record<string, Record<string, number>>
        >
        criteria: CriteriaDefinition[]
      }
    >,
    topModels: getTopModels(categoryScores),
    overall: calculateOverallScore(
      Object.values(categoryScores).flatMap((scores) => scores || []),
    ),
  }

  // Transform criteria definitions to match the interface
  const criteriaDefinitions = project.surveys
    .flatMap((survey) =>
      getCriteriaList(survey.pipeline_metadata).map((criteria: string) => ({
        name: stripNumberPrefix(criteria),
        description: criteria.split(":")[1]?.trim() || "",
      })),
    )
    .filter(
      (def, index, self) =>
        index === self.findIndex((d) => d.name === def.name),
    )

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    category: project.project_metadata.index_category,
    hasEvaluations,
    criteriaDefinitions,
    scores,
  }
}
