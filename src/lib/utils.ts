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

// Model family patterns - order matters, most specific first
const MODEL_PATTERNS = [
  { pattern: /^claude-4\.1-opus$/i, name: "Claude 4.1 Opus" },
  { pattern: /^claude-sonnet-4\.5$/i, name: "Claude Sonnet 4.5" },
  { pattern: /^gpt-5\.1$/i, name: "GPT-5.1" },
  { pattern: /^gpt-4$/i, name: "GPT-4" },
  { pattern: /^gemini-2\.5-pro$/i, name: "Gemini 2.5 Pro" },
]

export const getReadableModelName = (modelName: string): string => {
  // Try matching against patterns (most specific first)
  for (const { pattern, name: readableName } of MODEL_PATTERNS) {
    if (pattern.test(modelName)) {
      return readableName
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
