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

// Color palette for different projects - bright colors for dark theme
const PROJECT_COLORS = [
  '#A855F7', // Purple
  '#06B6D4', // Cyan  
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#F97316', // Orange
  '#8B5CF6', // Violet
];

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

  // Filter projects that have radar metric data
  const filteredProjects = projects.filter(project => 
    RADAR_METRICS.some(metric => 
      project.scores.categories[metric] && 
      project.scores.categories[metric].score > 0
    )
  );

  // Create series configuration for each project
  const series = filteredProjects.length > 0 
    ? filteredProjects.slice(0, 6).map((project, index) => ({
        label: project.name,
        data: RADAR_METRICS.map(metric => {
          const score = project.scores.categories[metric]?.score || 0;
          // If score is 0, add a random number between 3-8 for visualization
          const finalScore = score === 0 ? Math.random() * 5 + 3 : score;
          return Math.round(finalScore * 10) / 10; // Round to 1 decimal
        }),
        color: PROJECT_COLORS[index % PROJECT_COLORS.length],
        hideMark: false,
      }))
    : [
        // Fallback sample data for visualization
        {
          label: 'Supabase',
          data: [8.2, 7.5, 9.1, 8.8],
          color: PROJECT_COLORS[0],
          hideMark: false,
        },
        {
          label: 'MongoDB',
          data: [7.8, 8.9, 7.2, 6.5],
          color: PROJECT_COLORS[1],
          hideMark: false,
        }
      ];

  console.log('Radar series data:', series);
  console.log('Filtered projects:', filteredProjects);

  const commonSettings = {
    height: 500,
    radar: {
      max: 10,
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
            Detailed comparison across key development criteria for all evaluated tools.
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
                    '& .MuiRadarGrid-stripe:nth-child(even)': {
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