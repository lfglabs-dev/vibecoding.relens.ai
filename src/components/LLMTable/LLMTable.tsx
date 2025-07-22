"use client"

import { Badge } from "@/components/Badge"
import { useProjects } from "@/contexts/ProjectContext"
import { CriteriaCategoryBase } from "@/types/llm"
import { useState } from "react"
import { ProjectModal } from "@/components/ProjectModal"

export const LLMTable = () => {
  const { transformedProjects: projects, loading, error } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  )

  if (loading) {
    return null
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return "green"
    if (score >= 7) return "yellow"
    return "red"
  }

  // Get all criteria categories
  const categories = Object.keys(
    projects[0]?.scores.categories ?? {},
  ) as CriteriaCategoryBase[]

  return (
    <>
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-tremor-card ring-1 ring-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50 dark:bg-muted/30">
              <th className="py-2 px-4 text-left">Project</th>
              <th className="py-2 px-4 text-left">Category</th>
              {/* Headers for each criteria category */}
              {categories.map((category) => (
                <th key={category} className="py-2 px-4 text-left">
                  {category}
                </th>
              ))}
              <th className="py-2 px-4 text-left">Overall</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              return (
                <tr
                  key={project.id}
                  className="cursor-pointer border-b border-border hover:bg-muted/70 dark:hover:bg-muted/40 transition-colors"
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <td className="py-2 px-4">{project.name}</td>
                  <td className="py-2 px-4">{project.category}</td>
                  {/* Scores for each category */}
                  {categories.map((category) => {
                    const categoryScore =
                      project.scores.categories[category].score

                    return (
                      <td key={category} className="py-2 px-4">
                        <Badge color={getScoreColor(categoryScore)}>
                          {categoryScore.toFixed(1)}
                        </Badge>
                      </td>
                    )
                  })}
                  {/* Overall score */}
                  <td className="py-2 px-4">
                    <Badge color={getScoreColor(project.scores.overall)}>
                      {project.scores.overall.toFixed(1)}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ProjectModal
        projectId={selectedProjectId}
        isOpen={selectedProjectId !== null}
        onClose={() => setSelectedProjectId(null)}
      />
    </>
  )
}
