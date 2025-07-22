export type CriteriaCategoryBase =
  | "Code Quality Support"
  | "Code Compilation"
  | "Problem Solving Helpfulness"
  | "Security Awareness"
//   | "Tooling & Ecosystem Awareness"
//   | "Social & Community Signals"

export type CriteriaCategory = CriteriaCategoryBase | "all"

export interface Survey {
  id: string
  project_id: string
  name: string
  description: string
  pipeline_metadata: {
    criterias: string[]
    feature_name: string
    example_questions: string[]
    feature_description: string
  }
  survey_batches: SurveyBatch[]
}

export interface SurveyBatch {
  id: string
  survey_id: string
  runs: SurveyRun[]
}

export interface SurveyRun {
  id: string
  batch_id: string
  result: {
    criteria_evaluations: CriteriaEvaluation[]
  }
  metadata: RunMetadata
}

export interface ProjectMetadata {
  industry: string
  index_category: string
  included_in_index: boolean
}

export interface DatabaseProject {
  id: string
  name: string
  description: string
  project_metadata: ProjectMetadata
}

export interface CriteriaEvaluation {
  grade: number
  review: string
  criteria: string
  mistakes?: string[]
}

export interface ModelInfo {
  name: string
  features?: string[]
}

export interface RunMetadata {
  quantifier: any
  model_prompt_id: string
  response_delay: number
  querier: {
    language: string
    model_used: ModelInfo
  }
}

// Group models by provider
export type ModelProvider = "chatgpt" | "claude" | "gemini" | "other"

export interface ModelScore {
  provider: ModelProvider
  name: string
  score: number
}

export interface ModelStats {
  provider: ModelProvider
  name: string
  score: number
  runCount: number
}

export interface CriteriaResult {
  text: string
  modelScores: ModelScore[]
}

export interface CriteriaDefinition {
  name: string
  description: string
}

export interface Project extends DatabaseProject {
  surveys: Survey[]
}

export interface TransformedProject {
  id: string
  name: string
  description: string
  category: string
  criteriaDefinitions: CriteriaDefinition[]
  scores: {
    overall: number
    categories: {
      [key in CriteriaCategoryBase]: {
        score: number
        modelScores: ModelScore[]
        criteriaScores: Record<string, number>
        criteria: CriteriaDefinition[]
      }
    }
    topModels: ModelScore[]
  }
}
