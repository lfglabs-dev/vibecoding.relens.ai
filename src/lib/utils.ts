// Tremor Raw cx [v0.0.0]

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const cx = cn

// Tremor Raw focusInput [v0.0.1]

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-orange-200 focus:dark:ring-orange-700/30",
  // border color
  "focus:border-orange-500 focus:dark:border-orange-700",
]

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-orange-500 dark:outline-orange-500",
]

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
]

interface CurrencyParams {
  number: number
  maxFractionDigits?: number
  currency?: string
}

interface PercentageParams {
  number: number
  decimals?: number
}

interface MillionParams {
  number: number
  decimals?: number
}

type FormatterFunctions = {
  currency: (params: CurrencyParams) => string
  unit: (number: number) => string
  percentage: (params: PercentageParams) => string
  million: (params: MillionParams) => string
}

export const formatters: FormatterFunctions = {
  currency: ({
    number,
    maxFractionDigits = 2,
    currency = "USD",
  }: CurrencyParams): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: maxFractionDigits,
    }).format(number)
  },

  unit: (number: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
    }).format(number)
  },

  percentage: ({ number, decimals = 1 }: PercentageParams): string => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number)
  },

  million: ({ number, decimals = 1 }: MillionParams): string => {
    return `${new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number)}M`
  },
}

export enum MenuType {
  SignIn = "signin",
  SignUp = "signup",
  Confirmation = "confirmation",
}

export const calculateCategoryScore = (runs: any[]) => {
  if (!runs || runs.length === 0) return 0

  let totalGrade = 0
  let totalEvaluations = 0

  runs.forEach((run) => {
    if (run.result?.criteria_evaluations) {
      run.result.criteria_evaluations.forEach((evaluation: any) => {
        if (typeof evaluation.grade === "number") {
          totalGrade += evaluation.grade
          totalEvaluations++
        }
      })
    }
  })

  return totalEvaluations > 0 ? totalGrade / totalEvaluations : 0
}

export const calculateOverallScore = (categoryScores: number[]) => {
  const validScores = categoryScores.filter((score) => score > 0)
  if (validScores.length === 0) return 0
  return validScores.reduce((a, b) => a + b, 0) / validScores.length
}

export const getCategoryScores = (surveys: any[]) => {
  return surveys.reduce((acc, survey) => {
    const runs = (survey.survey_batches || []).flatMap(
      (batch: any) => batch.survey_runs || [],
    )
    return {
      ...acc,
      [survey.name]: calculateCategoryScore(runs),
    }
  }, {})
}

// Model family patterns
const MODEL_PATTERNS = {
  claude: [
    { pattern: /^claude-3-5-haiku/, name: "Claude 3.5 Haiku" },
    { pattern: /^claude-3-5-opus/, name: "Claude 3.5 Opus" },
    { pattern: /^claude-3-sonnet/, name: "Claude 3 Sonnet" },
    { pattern: /^claude-2\.1/, name: "Claude 2.1" },
    { pattern: /^claude-2$/, name: "Claude 2" },
    { pattern: /^claude-instant/, name: "Claude Instant" },
  ],
  gpt: [
    { pattern: /^gpt-4-turbo/, name: "GPT-4 Turbo" },
    { pattern: /^gpt-4o-mini/, name: "GPT-4 Mini" },
    { pattern: /^gpt-4-32k/, name: "GPT-4 32K" },
    { pattern: /^gpt-4/, name: "GPT-4" },
    { pattern: /^gpt-3\.5-turbo-16k/, name: "GPT-3.5 Turbo 16K" },
    { pattern: /^gpt-3\.5-turbo/, name: "GPT-3.5 Turbo" },
  ],
  gemini: [
    { pattern: /^google\/gemini-2\.5-flash-preview/, name: "Gemini 2.5 Flash" },
    { pattern: /^gemini-pro/, name: "Gemini Pro" },
    { pattern: /^gemini-ultra/, name: "Gemini Ultra" },
  ],
  perplexity: [
    { pattern: /^sonar-deep-research$/, name: "Perplexity Deep Research" },
    { pattern: /^sonar$/, name: "Perplexity Sonar" },
  ],
}

// Exact matches for special cases
const MODEL_NAME_MAPPINGS: Record<string, string> = {
  sonar: "Perplexity Sonar",
  "sonar-deep-research": "Perplexity Deep Research",
}

export const getReadableModelName = (modelName: string): string => {
  const name = modelName.toLowerCase()

  // Try matching against patterns
  for (const [, patterns] of Object.entries(MODEL_PATTERNS)) {
    for (const { pattern, name: readableName } of patterns) {
      if (pattern.test(name)) {
        return readableName
      }
    }
  }

  // If no pattern matches, return the original name
  return modelName
}

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const normalizeCriteriaName = (criteria: string) => {
  // Remove number prefix and colon if present (e.g., "1. Name:" -> "Name")
  return criteria
    .replace(/^\d+\.\s*/, "")
    .split(":")[0]
    .trim()
}
