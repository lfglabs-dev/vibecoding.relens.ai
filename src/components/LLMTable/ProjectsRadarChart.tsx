import { TransformedProject } from "@/types/llm"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { CriteriaCategoryBase } from "@/types/llm"

const CRITERIA_CATEGORIES: CriteriaCategoryBase[] = [
  "Code Quality Support",
  "Code Compilation",
  "Problem Solving Helpfulness",
  "Security Awareness",
]

const COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#dc2626", // red-600
  "#9333ea", // purple-600
  "#ea580c", // orange-600
  "#0891b2", // cyan-600
  "#4f46e5", // indigo-600
]

interface ProjectsRadarChartProps {
  projects: TransformedProject[]
}

export function ProjectsRadarChart({ projects }: ProjectsRadarChartProps) {
  // Transform data for the radar chart
  const chartData = CRITERIA_CATEGORIES.map((category) => {
    const dataPoint: any = {
      category: category.split(" ").join("\n"), // Add line breaks for better display
    }

    // Add scores for each project
    projects.forEach((project) => {
      dataPoint[project.name] = project.scores.categories[category].score
    })

    return dataPoint
  })

  return (
    <div className="h-[500px] w-full rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: "currentColor" }}
          />
          {projects.map((project, index) => (
            <Radar
              key={project.id}
              name={project.name}
              dataKey={project.name}
              stroke={COLORS[index % COLORS.length]}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={0.1}
            />
          ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
