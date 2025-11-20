"use client";

import * as React from "react";
import { RadarChart } from '@mui/x-charts/RadarChart';
import { CriteriaCategoryBase } from "@/types/llm";
import { useProjects } from "@/contexts/ProjectContext";

const RADAR_METRICS: CriteriaCategoryBase[] = [
  "Code Quality Support",
  "Code Compilation", 
  "Problem Solving Helpfulness",
  "Security Awareness"
];

// Color palette for AI models - matching the metric cards
const MODEL_COLORS: Record<string, string> = {
  'GPT-5.1': '#A855F7', // Purple
  'GPT-4': '#9333EA', // Darker Purple
  'Claude-4.1-Opus': '#06B6D4', // Cyan
  'Claude-Sonnet-2.5': '#0891B2', // Darker Cyan
  'Gemini-2.5-Pro': '#F59E0B', // Amber/Yellow
};

export const RadarGraph = () => {
  const { transformedProjects: projects, loading, error } = useProjects();

    if (loading) {
    return (
      <section className="relative py-20 px-4">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xl text-gray-400">Loading radar chart...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-20 px-4">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xl text-gray-400">Error loading projects: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Aggregate model scores across all tasks for each criterion
  const modelScoresByCriterion: Record<string, Record<CriteriaCategoryBase, number[]>> = {};

  projects.forEach((project) => {
    RADAR_METRICS.forEach((metric) => {
      const categoryData = project.scores.categories[metric];
      if (categoryData && categoryData.modelScores) {
        categoryData.modelScores.forEach((modelScore) => {
          if (!modelScoresByCriterion[modelScore.name]) {
            modelScoresByCriterion[modelScore.name] = {
              "Code Quality Support": [],
              "Code Compilation": [],
              "Problem Solving Helpfulness": [],
              "Security Awareness": [],
            };
          }
          modelScoresByCriterion[modelScore.name][metric].push(modelScore.score);
        });
      }
    });
  });

  // Calculate average scores for each model across all tasks for each criterion
  const series = Object.entries(modelScoresByCriterion).map(([modelName, criteriaScores]) => ({
    label: modelName,
    data: RADAR_METRICS.map((metric) => {
      const scores = criteriaScores[metric];
      if (scores.length === 0) return 0;
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return Math.round(average * 10) / 10; // Round to 1 decimal
    }),
    color: MODEL_COLORS[modelName] || '#8B5CF6',
    hideMark: false,
  }));

  console.log('Radar series data (models):', series);
  console.log('Model scores by criterion:', modelScoresByCriterion);

  // Calculate dynamic scale based on actual data
  const allDataPoints = series.flatMap(s => s.data);
  const minValue = Math.min(...allDataPoints);
  const maxValue = Math.max(...allDataPoints);
  const dataRange = maxValue - minValue;
  
  // Create a very focused scale that maximizes differences
  // Use minimal padding to zoom in on the data range
  const scalePadding = dataRange * 0.02; // Only 2% padding for maximum zoom
  const dynamicMin = Math.max(0, minValue - scalePadding);
  const dynamicMax = maxValue + scalePadding;

  const commonSettings = {
    height: 500,
    radar: {
      min: dynamicMin,
      max: dynamicMax,
      metrics: RADAR_METRICS.map(metric => 
        metric.replace(' Support', '').replace(' Helpfulness', '').replace(' Awareness', '')
      ),
    },
  };



  return (
    <section className="relative py-20 px-4">
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
              Performance
            </span>
            <br />
            <span className="text-white">Breakdown</span>
          </h3>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Compare how each AI model performs across the four key evaluation criteria, averaged across all development tasks.
          </p>
        </div>

        {/* Radar Chart */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
                <RadarChart
                  {...commonSettings}
                  series={series}
                  shape="circular"
                  divisions={10}
                  sx={{
                    '& .MuiChartsLegend-label': {
                      fill: '#FFFFFF !important',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: "white"
                    },
                    '& .MuiChartsLegend-series': {
                      '& text': {
                        fill: '#FFFFFF !important',
                        fontWeight: 500,
                      }
                    },
                    '& .MuiChartsLegend-root': {
                      '& text': {
                        fill: '#FFFFFF !important',
                      }
                    },
                    '& text': {
                      fill: '#FFFFFF !important',
                    },
                    '& .MuiRadarGrid-stripe': {
                      fill: 'purple',
                    },
                    '& .MuiRadarGrid-stripe:nth-of-type(even)': {
                      fill: 'rgba(168, 85, 247, 0.1)', // Purple with low opacity
                    },
                    '& .MuiRadarGrid-radial': {
                      stroke: 'white',
                    },
                    '& .MuiRadarGrid-divider': {
                        stroke: 'white',
                        strokeWidth: 1,
                    },
                    backgroundColor: 'transparent',
                  }}
                />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}; 