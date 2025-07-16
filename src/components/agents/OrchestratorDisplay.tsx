import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Agent {
  id: number;
  status: 'QUEUED' | 'INITIALIZING...' | 'PROCESSING...' | 'COMPLETED' | 'FAILED';
  progress: number;
}

interface OrchestratorDisplayProps {
  agents: Agent[];
  isRunning: boolean;
  elapsedTime: number;
  modelName?: string;
  className?: string;
}

export const OrchestratorDisplay = ({ 
  agents, 
  isRunning, 
  elapsedTime, 
  modelName = "HEAVY",
  className 
}: OrchestratorDisplayProps) => {
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.floor(seconds)}S`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}M${secs}S`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}H${minutes}M`;
    }
  };

  const createProgressBar = (status: string, progress: number) => {
    const dots = 35; // Adjusted for UI
    
    if (status === "QUEUED") {
      return (
        <div className="flex items-center font-mono text-sm">
          <span className="text-muted-foreground mr-2">○</span>
          <span className="text-muted-foreground">{'·'.repeat(dots)}</span>
        </div>
      );
    } else if (status === "INITIALIZING...") {
      return (
        <div className="flex items-center font-mono text-sm">
          <span className="text-orange-400 mr-2 animate-pulse">◐</span>
          <span className="text-muted-foreground">{'·'.repeat(dots)}</span>
        </div>
      );
    } else if (status === "PROCESSING...") {
      const filled = Math.floor((progress / 100) * dots);
      const remaining = dots - filled;
      return (
        <div className="flex items-center font-mono text-sm">
          <span className="text-orange-400 mr-2">●</span>
          <span className="text-orange-400 animate-pulse">{':'.repeat(filled)}</span>
          <span className="text-muted-foreground">{'·'.repeat(remaining)}</span>
        </div>
      );
    } else if (status === "COMPLETED") {
      return (
        <div className="flex items-center font-mono text-sm">
          <span className="text-orange-400 mr-2">●</span>
          <span className="text-orange-400">{':'.repeat(dots)}</span>
        </div>
      );
    } else if (status.startsWith("FAILED")) {
      return (
        <div className="flex items-center font-mono text-sm">
          <span className="text-red-400 mr-2">✗</span>
          <span className="text-red-400">{'×'.repeat(dots)}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center font-mono text-sm">
        <span className="text-orange-400 mr-2 animate-pulse">◐</span>
        <span className="text-muted-foreground">{'·'.repeat(dots)}</span>
      </div>
    );
  };

  return (
    <Card className={cn("terminal-display shadow-large", className)}>
      <div className="p-6 font-mono">
        {/* Header */}
        <div className="mb-6">
          <div className="text-lg font-bold text-white tracking-wider">
            {modelName}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={cn(
              "text-orange-400",
              isRunning && "animate-pulse"
            )}>●</span>
            <span className="text-white">
              {isRunning ? "RUNNING" : "COMPLETED"} • {formatTime(elapsedTime)}
            </span>
          </div>
        </div>

        {/* Agent Status Lines */}
        <div className="space-y-3">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center gap-4">
              <span className="text-white text-sm min-w-[80px]">
                AGENT {agent.id.toString().padStart(2, '0')}
              </span>
              {createProgressBar(agent.status, agent.progress)}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};