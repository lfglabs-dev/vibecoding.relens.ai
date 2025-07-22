"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Project, TransformedProject } from "@/types/llm";
import { transformProject } from "@/lib/projectTransforms";
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
        <div className="w-8 h-8 flex items-center justify-center text-gray-300">
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

export const PerformanceRadar = () => {
  const [projects, setProjects] = useState<TransformedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        
        // Transform projects and sort by overall score (best first)
        const transformedProjects = data
          .map((project: Project) => transformProject(project))
          .sort((a: TransformedProject, b: TransformedProject) => b.scores.overall - a.scores.overall)
          .slice(0, 6); // Top 6 projects
        
        setProjects(transformedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Logo mapping based on project names
  const logoMapping: Record<string, string> = {
    'PostgreSQL': 'https://logo.clearbit.com/postgresql.com',
    'Supabase': 'https://logo.clearbit.com/supabase.com',
    'PlanetScale': 'https://logo.clearbit.com/planetscale.com',
    'MongoDB': 'https://logo.clearbit.com/mongodb.com',
    'Neon': 'https://logo.clearbit.com/neon.com',
    'SQLite': 'https://logo.clearbit.com/sqlite.com',
    'Firestore': 'https://logo.clearbit.com/firestore.com',
  };

  // Fallback icon for projects without logos
  const fallbackIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  // Function to get logo for a project
  const getProjectLogo = (projectName: string) => {
    const logoUrl = logoMapping[projectName];
    if (logoUrl) {
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <Image
            src={logoUrl}
            alt={`${projectName} logo`}
            width={24}
            height={24}
            className="object-contain"
            unoptimized
            onError={() => {
              // This will be handled by Next.js Image component fallback
              console.log(`Failed to load logo for ${projectName}`);
            }}
          />
        </div>
      );
    }
    return (
      <div className="w-6 h-6 flex items-center justify-center text-gray-300">
        {fallbackIcon}
      </div>
    );
  };

  // Color array to cycle through 
  const colors = [
    "bg-gradient-to-r from-purple-500 to-purple-600",
    "bg-gradient-to-r from-cyan-400 to-cyan-500", 
    "bg-gradient-to-r from-yellow-400 to-orange-500",
    "bg-gradient-to-r from-green-400 to-green-500",
    "bg-gradient-to-r from-blue-400 to-blue-500",
    "bg-gradient-to-r from-pink-400 to-pink-500"
  ];

    const metrics = projects.map((project, index) => {
    const score = Math.round(project.scores.overall * 10) / 10; // Round to 1 decimal
    const maxScore = 10;
    const progress = (score / maxScore) * 100;
    
    return {
      icon: getProjectLogo(project.name),
      title: project.name,
      score: score,
      maxScore: maxScore,
      progress: Math.min(progress, 100), // Cap at 100%
      ranking: index + 1, // Since projects are sorted by score, index + 1 = ranking
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
              Vibe Coding
              </span>
              <br />
              <span className="text-white">Leaderboard</span>
            </h2>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              We evaluate dev-tools based on how easily AI models generate accurate code, docs, and use cases with them so you know what just works (Starting with databases).
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