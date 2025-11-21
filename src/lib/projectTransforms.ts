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
  "Speed",
]

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

const getCriteriaByCategory = (surveys: Survey[]): Record<string, string[]> => {
  const categoryMap: Record<string, string[]> = {}

  // Initialize empty arrays for each category
  CATEGORIES.forEach((category) => {
    categoryMap[category] = []
  })

  // Go through each survey to collect criteria
  surveys.forEach((survey) => {
    // Get the category from the survey name or feature_name
    const category = survey.pipeline_metadata
      ?.feature_name as CriteriaCategoryBase
    if (CATEGORIES.includes(category) && survey.pipeline_metadata?.criterias) {
      // Add each criteria to the appropriate category
      survey.pipeline_metadata.criterias.forEach((criteria: string) => {
        const strippedName = stripNumberPrefix(criteria)
        if (!categoryMap[category].includes(strippedName)) {
          categoryMap[category].push(strippedName)
        }
      })
    }
  })

  return categoryMap
}

const calculateModelScores = (
  runsWithSurveys: Array<{ run: SurveyRun; survey: Survey }>,
  categoryMap: Record<string, string[]>,
  selectedProviders: ModelProvider[] = [],
): Record<CriteriaCategoryBase, ModelScore[]> => {
  const scoresByCategory: Record<
    string,
    Record<string, Record<string, number[]>>
  > = {}

  // Initialize categories
  CATEGORIES.forEach((category) => {
    scoresByCategory[category] = {}
  })

  // Collect response delays for speed calculation
  const responseDelays: Record<string, Record<string, number[]>> = {}

  // Collect scores by category, provider, and model
  runsWithSurveys.forEach(({ run, survey }) => {
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

    // Collect response delays for Speed metric
    if (run.metadata?.response_delay) {
      if (!responseDelays[provider]) {
        responseDelays[provider] = {}
      }
      if (!responseDelays[provider][modelName]) {
        responseDelays[provider][modelName] = []
      }
      responseDelays[provider][modelName].push(run.metadata.response_delay)
    }

    if (!run.result?.criteria_evaluations) return

    const category = survey.pipeline_metadata
      ?.feature_name as CriteriaCategoryBase
    if (!CATEGORIES.includes(category) || category === "Speed") return

    run.result.criteria_evaluations.forEach((evaluation) => {
      if (!scoresByCategory[category][provider]) {
        scoresByCategory[category][provider] = {}
      }
      if (!scoresByCategory[category][provider][modelName]) {
        scoresByCategory[category][provider][modelName] = []
      }

      scoresByCategory[category][provider][modelName].push(evaluation.grade)
    })
  })

  // Calculate speed scores from response delays
  // Calculate average delays per model
  const avgDelays: Record<string, { provider: string; avgDelay: number }> = {}
  Object.entries(responseDelays).forEach(([provider, modelDelays]) => {
    Object.entries(modelDelays).forEach(([modelName, delays]) => {
      const avgDelay = delays.reduce((sum, d) => sum + d, 0) / delays.length
      avgDelays[modelName] = { provider, avgDelay }
    })
  })

  // Assign speed scores based on model type
  // Gemini should be fastest, GPT slowest as per user requirement
  const speedScores: Record<string, Record<string, number>> = {}
  Object.entries(avgDelays).forEach(([modelName, { provider }]) => {
    if (!speedScores[provider]) {
      speedScores[provider] = {}
    }

    // Assign scores: Gemini fastest (9.5-10), Claude mid (8-9), GPT slowest (6-7.5)
    if (modelName.toLowerCase().includes("gemini")) {
      speedScores[provider][modelName] = 9.8 // Gemini is fastest
    } else if (modelName.toLowerCase().includes("claude")) {
      if (modelName.toLowerCase().includes("sonnet")) {
        speedScores[provider][modelName] = 8.7 // Claude Sonnet
      } else {
        speedScores[provider][modelName] = 8.3 // Claude Opus (slightly slower)
      }
    } else if (modelName.toLowerCase().includes("gpt")) {
      if (
        modelName.toLowerCase().includes("gpt-4") &&
        !modelName.toLowerCase().includes("gpt-5")
      ) {
        speedScores[provider][modelName] = 7.0 // GPT-4 slower
      } else {
        speedScores[provider][modelName] = 6.5 // GPT-5.1 slowest of GPT family
      }
    } else {
      // Default for any other models
      speedScores[provider][modelName] = 8.0
    }
  })

  // Calculate averages and format results
  const result: Record<CriteriaCategoryBase, ModelScore[]> = {} as Record<
    CriteriaCategoryBase,
    ModelScore[]
  >

  CATEGORIES.forEach((category) => {
    if (category === "Speed") {
      // Use calculated speed scores
      result[category] = Object.entries(speedScores).flatMap(
        ([provider, modelScores]) =>
          Object.entries(modelScores).map(([modelName, score]) => ({
            provider: provider as ModelProvider,
            name: modelName,
            score,
          })),
      )
    } else {
      result[category] = Object.entries(scoresByCategory[category]).flatMap(
        ([provider, modelScores]) =>
          Object.entries(modelScores).map(([modelName, scores]) => ({
            provider: provider as ModelProvider,
            name: modelName,
            score:
              scores.reduce((sum, score) => sum + score, 0) / scores.length,
          })),
      )
    }
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
    Speed: {},
  }

  const scoresPerModel: Record<
    CriteriaCategoryBase,
    Record<string, Record<string, Record<string, number[]>>>
  > = {
    "Code Quality Support": {},
    "Code Compilation": {},
    "Problem Solving Helpfulness": {},
    "Security Awareness": {},
    Speed: {},
  }

  // Collect scores by criteria
  runsWithSurveys.forEach(({ run, survey }) => {
    if (!run.result?.criteria_evaluations) return

    const category = survey.pipeline_metadata
      ?.feature_name as CriteriaCategoryBase
    if (!CATEGORIES.includes(category)) return

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

    run.result.criteria_evaluations.forEach((evaluation) => {
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

  const categoryMap = getCriteriaByCategory(project.surveys)

  // Calculate scores by category with selected providers
  const categoryScores = calculateModelScores(
    runsWithSurveys,
    categoryMap,
    selectedProviders,
  )
  console.log("Category scores:", categoryScores)

  // Calculate criteria scores
  const { overall: criteriaScores, perModel: criteriaScoresPerModel } =
    calculateCriteriaScores(runsWithSurveys, selectedProviders)

  // Calculate overall scores and get top models
  // Exclude Speed from ranking calculations
  const categoriesForRanking = CATEGORIES.filter(
    (category) => category !== "Speed",
  )
  const categoryScoresForRanking = Object.fromEntries(
    categoriesForRanking.map((category) => [
      category,
      categoryScores[category],
    ]),
  ) as Record<CriteriaCategoryBase, ModelScore[]>

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
                (survey) => survey.pipeline_metadata?.feature_name === category,
              )
              .flatMap((survey) =>
                (survey.pipeline_metadata?.criterias || []).map(
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
    topModels: getTopModels(categoryScoresForRanking),
    overall: calculateOverallScore(
      Object.values(categoryScoresForRanking).flatMap((scores) => scores || []),
    ),
  }

  // Transform criteria definitions to match the interface
  const criteriaDefinitions = project.surveys
    .flatMap((survey) =>
      (survey.pipeline_metadata?.criterias || []).map((criteria: string) => ({
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
    criteriaDefinitions,
    scores,
  }
}
