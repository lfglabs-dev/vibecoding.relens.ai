"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { Project, TransformedProject, ModelProvider } from "@/types/llm"
import { transformProject } from "@/lib/projectTransforms"

interface ProjectContextType {
  projects: Project[]
  transformedProjects: TransformedProject[]
  loading: boolean
  error: string | null
  selectedProviders: ModelProvider[]
  setSelectedProviders: (providers: ModelProvider[]) => void
  getProjectById: (id: string) => Project | undefined
  getTransformedProjectById: (
    id: string,
    useFilters?: boolean,
  ) => TransformedProject | undefined
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProviders, setSelectedProviders] = useState<ModelProvider[]>(
    [],
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }
        const data = await response.json()
        setProjects(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Transform projects with filters
  const transformedProjects = useMemo(() => {
    return projects.map((project) =>
      transformProject(project, selectedProviders),
    )
  }, [projects, selectedProviders])

  // Transform projects without filters
  const unfilteredTransformedProjects = useMemo(() => {
    return projects.map((project) => transformProject(project, []))
  }, [projects])

  // Memoize lookup functions
  const getProjectById = useMemo(() => {
    return (id: string) => projects.find((p) => p.id === id)
  }, [projects])

  const getTransformedProjectById = useMemo(() => {
    return (id: string, useFilters: boolean = true) =>
      useFilters
        ? transformedProjects.find((p) => p.id === id)
        : unfilteredTransformedProjects.find((p) => p.id === id)
  }, [transformedProjects, unfilteredTransformedProjects])

  return (
    <ProjectContext.Provider
      value={{
        projects,
        transformedProjects,
        loading,
        error,
        selectedProviders,
        setSelectedProviders,
        getProjectById,
        getTransformedProjectById,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider")
  }
  return context
}
