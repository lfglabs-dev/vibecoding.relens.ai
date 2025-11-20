"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useProjects } from "@/contexts/ProjectContext";
import { RadarGraph } from "./RadarGraph";
import { Sparkles } from "lucide-react";

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  score: number;
  maxScore: number;
  progress: number;
  ranking: number;
  barColor: string;
}

const MetricCard = ({ icon, title, score, maxScore, progress, ranking, barColor }: MetricCardProps) => {
  const getRankingSuffix = (rank: number) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 flex items-center justify-center">
          {icon}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
          ranking === 1 
            ? 'bg-yellow-500/20 text-yellow-400' 
            : ranking === 2
            ? 'bg-gray-300/20 text-gray-300'
            : ranking === 3
            ? 'bg-orange-500/20 text-orange-400'
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          {ranking}{getRankingSuffix(ranking)}
        </div>
      </div>
      
      <h3 className="text-gray-300 text-sm font-medium mb-2">{title}</h3>
      
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-gray-400 text-sm">/{maxScore}</span>
      </div>
      
      <div className="w-full bg-gray-700/50 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

interface ModelScore {
  modelName: string;
  totalScore: number;
  count: number;
  averageScore: number;
}

export const PerformanceRadar = () => {
  const { transformedProjects, loading } = useProjects();
  const [modelMetrics, setModelMetrics] = useState<ModelScore[]>([]);

  useEffect(() => {
    if (!loading && transformedProjects.length > 0) {
      // Calculate average scores for each AI model across all tasks
      const modelScores: Record<string, { total: number; count: number }> = {};

      transformedProjects.forEach((project) => {
        // Get all model scores from this project
        project.scores.topModels.forEach((model) => {
          if (!modelScores[model.name]) {
            modelScores[model.name] = { total: 0, count: 0 };
          }
          modelScores[model.name].total += model.score;
          modelScores[model.name].count += 1;
        });
      });

      // Calculate averages and sort by score
      const metrics = Object.entries(modelScores)
        .map(([modelName, { total, count }]) => ({
          modelName,
          totalScore: total,
          count,
          averageScore: total / count,
        }))
        .sort((a, b) => b.averageScore - a.averageScore);

      setModelMetrics(metrics);
    }
  }, [transformedProjects, loading]);

  // AI Model logos
  const modelLogos: Record<string, string> = {
    'GPT-4o': '/llms/gpt_black.webp',
    'Claude-3.5-Sonnet': '/llms/claude.webp',
    'Gemini-2.0-Flash': '/llms/gemini.webp',
  };

  // Function to get logo for a model
  const getModelLogo = (modelName: string) => {
    const logoUrl = modelLogos[modelName];
    if (logoUrl) {
      return (
        <div className="relative w-12 h-12 flex items-center justify-center">
          <Image
            src={logoUrl}
            alt={`${modelName} logo`}
            width={48}
            height={48}
            className="object-contain rounded-lg"
            unoptimized
          />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 flex items-center justify-center text-gray-300">
        <Sparkles className="w-8 h-8" />
      </div>
    );
  };

  // Color array to cycle through 
  const colors = [
    "bg-gradient-to-r from-purple-500 to-purple-600",
    "bg-gradient-to-r from-cyan-400 to-cyan-500", 
    "bg-gradient-to-r from-yellow-400 to-orange-500",
  ];

  const metrics = modelMetrics.map((model, index) => {
    const score = Math.round(model.averageScore * 10) / 10; // Round to 1 decimal
    const maxScore = 10;
    const progress = (score / maxScore) * 100;
    
    return {
      icon: getModelLogo(model.modelName),
      title: model.modelName,
      score: score,
      maxScore: maxScore,
      progress: Math.min(progress, 100), // Cap at 100%
      ranking: index + 1, // Since models are sorted by score, index + 1 = ranking
      barColor: colors[index % colors.length]
    };
  });

  if (loading) {
    return (
      <section className="relative py-20 px-4">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-6">
              <svg className="w-8 h-8 text-purple-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-xl text-gray-400">Loading projects...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative py-20 px-4">
        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              The&nbsp;
              <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
              AI Models
              </span>
              <br />
              <span className="text-white">Leaderboard</span>
            </h2>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              We evaluate AI models on different development tasks to help you choose the best model for frontend, backend, data analysis, and more.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Radar Chart Section */}
      <RadarGraph />
    </>
  );
}; 