import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { Project, Survey, SurveyBatch, SurveyRun } from "@/types/llm"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET() {
  try {
    const { data: projects, error } = await supabase
      .from("projects")
      .select(
        `
        id,
        name,
        description,
        project_metadata,
        surveys (
          id,
          project_id,
          name,
          description,
          pipeline_metadata,
          survey_batches (
            id,
            survey_id,
            runs:survey_runs (
              id,
              batch_id,
              result,
              metadata
            )
          )
        )
      `,
      )
      .eq("project_metadata->included_in_index", true)

    if (error) throw error
    if (!projects) {
      return NextResponse.json({ error: "No projects found" }, { status: 404 })
    }
    console.log(projects)

    // Parse any stringified JSON in the nested objects
    const expandedProjects = projects.map((project: Partial<Project>) => ({
      ...project,
      surveys: (project.surveys || []).map((survey: Partial<Survey>) => ({
        ...survey,
        pipeline_metadata:
          typeof survey.pipeline_metadata === "string"
            ? JSON.parse(survey.pipeline_metadata)
            : survey.pipeline_metadata,
        survey_batches: (survey.survey_batches || []).map(
          (batch: Partial<SurveyBatch>) => ({
            ...batch,
            runs: (batch.runs || []).map((run: Partial<SurveyRun>) => ({
              ...run,
              result:
                typeof run.result === "string"
                  ? JSON.parse(run.result)
                  : run.result,
              metadata:
                typeof run.metadata === "string"
                  ? JSON.parse(run.metadata)
                  : run.metadata,
            })),
          }),
        ),
      })),
    }))

    return NextResponse.json(expandedProjects, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
