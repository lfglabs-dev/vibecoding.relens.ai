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
    return <div>Loading...</div>
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
      <div className="w-full">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Project</th>
              <th className="py-2 text-left">Category</th>
              {/* Headers for each criteria category */}
              {categories.map((category) => (
                <th key={category} className="py-2 text-left">
                  {category}
                </th>
              ))}
              <th className="py-2 text-left">Overall</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              return (
                <tr
                  key={project.id}
                  className="cursor-pointer border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <td className="py-2">{project.name}</td>
                  <td className="py-2">{project.category}</td>
                  {/* Scores for each category */}
                  {categories.map((category) => {
                    const categoryScore =
                      project.scores.categories[category].score

                    return (
                      <td key={category} className="py-2">
                        <Badge color={getScoreColor(categoryScore)}>
                          {categoryScore.toFixed(1)}
                        </Badge>
                      </td>
                    )
                  })}
                  {/* Overall score */}
                  <td className="py-2">
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
