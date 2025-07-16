import { AgentStatus, AgentState } from "./AgentStatus";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  state: AgentState;
  progress: number;
  model: string;
  output?: string;
}

interface MultiAgentPanelProps {
  agents: Agent[];
  isRunning: boolean;
  mode: "single" | "multi";
  onToggleMode: (mode: "single" | "multi") => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  className?: string;
}

export const MultiAgentPanel = ({
  agents,
  isRunning,
  mode,
  onToggleMode,
  onStart,
  onStop,
  onReset,
  className
}: MultiAgentPanelProps) => {
  const activeAgents = agents.filter(agent => agent.state === "running").length;
  const completedAgents = agents.filter(agent => agent.state === "complete").length;
  const errorAgents = agents.filter(agent => agent.state === "error").length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Control Panel */}
      <div className="glass-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-glow">Agent Orchestration</h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "single" ? "neon" : "glass"}
              size="sm"
              onClick={() => onToggleMode("single")}
            >
              <User className="h-4 w-4" />
              Single
            </Button>
            <Button
              variant={mode === "multi" ? "neon" : "glass"}
              size="sm"
              onClick={() => onToggleMode("multi")}
            >
              <Users className="h-4 w-4" />
              Multi
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Mode: <span className="text-primary font-medium">{mode === "multi" ? "Multi-Agent" : "Single Agent"}</span>
            </span>
            
            {mode === "multi" && (
              <>
                <span className="text-muted-foreground">
                  Active: <span className="text-primary font-medium">{activeAgents}</span>
                </span>
                <span className="text-muted-foreground">
                  Complete: <span className="text-success font-medium">{completedAgents}</span>
                </span>
                {errorAgents > 0 && (
                  <span className="text-muted-foreground">
                    Errors: <span className="text-destructive font-medium">{errorAgents}</span>
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={onReset}
              disabled={isRunning}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            {isRunning ? (
              <Button variant="destructive" size="sm" onClick={onStop}>
                <Square className="h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button variant="neon" size="sm" onClick={onStart}>
                <Play className="h-4 w-4" />
                Start
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className={cn(
        "grid gap-4",
        mode === "multi" 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2" 
          : "grid-cols-1 max-w-md mx-auto"
      )}>
        {(mode === "multi" ? agents : agents.slice(0, 1)).map((agent) => (
          <AgentStatus
            key={agent.id}
            name={agent.name}
            state={agent.state}
            progress={agent.progress}
            model={agent.model}
            output={agent.output}
            className="animate-fade-in"
          />
        ))}
      </div>

      {/* Connection Visualization for Multi-Agent */}
      {mode === "multi" && agents.length > 1 && (
        <div className="glass-panel rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3 text-center">Agent Coordination</h3>
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-2 gap-8 max-w-sm">
              {agents.slice(0, 4).map((agent, index) => (
                <div key={agent.id} className="flex flex-col items-center">
                  <div className={cn(
                    "w-3 h-3 rounded-full border-2 transition-smooth",
                    agent.state === "running" ? "bg-primary border-primary animate-pulse-glow" :
                    agent.state === "complete" ? "bg-success border-success" :
                    agent.state === "error" ? "bg-destructive border-destructive" :
                    "bg-muted border-muted"
                  )} />
                  <span className="text-xs text-muted-foreground mt-1">{agent.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Connection Lines */}
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground bg-background px-2">Synthesis</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};