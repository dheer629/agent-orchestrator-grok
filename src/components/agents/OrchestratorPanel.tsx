import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrchestratorDisplay } from "./OrchestratorDisplay";
import { Play, Square, RotateCcw, Settings, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Agent {
  id: number;
  status: 'QUEUED' | 'INITIALIZING...' | 'PROCESSING...' | 'COMPLETED' | 'FAILED';
  progress: number;
}

interface OrchestratorPanelProps {
  query: string;
  isActive?: boolean;
  onComplete?: (results: any) => void;
  className?: string;
}

export const OrchestratorPanel = ({ 
  query, 
  isActive = false, 
  onComplete,
  className 
}: OrchestratorPanelProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [agents, setAgents] = useState<Agent[]>([
    { id: 1, status: 'QUEUED', progress: 0 },
    { id: 2, status: 'QUEUED', progress: 0 },
    { id: 3, status: 'QUEUED', progress: 0 },
    { id: 4, status: 'QUEUED', progress: 0 },
  ]);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();
  const { toast } = useToast();

  // Update elapsed time
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setElapsedTime((Date.now() - startTimeRef.current) / 1000);
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Simulate orchestration process
  const simulateOrchestration = async () => {
    // Reset all agents
    setAgents(prev => prev.map(agent => ({ ...agent, status: 'QUEUED' as const, progress: 0 })));
    
    // Start agents sequentially with realistic timing
    for (let i = 0; i < agents.length; i++) {
      // Initializing phase
      setAgents(prev => prev.map((agent, idx) => 
        idx === i ? { ...agent, status: 'INITIALIZING...' as const } : agent
      ));
      
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
      
      // Processing phase with progress
      setAgents(prev => prev.map((agent, idx) => 
        idx === i ? { ...agent, status: 'PROCESSING...' as const, progress: 0 } : agent
      ));
      
      // Simulate progress
      const progressDuration = 1500 + Math.random() * 2500; // 1.5-4 seconds
      const progressSteps = 20;
      const stepDelay = progressDuration / progressSteps;
      
      for (let step = 1; step <= progressSteps; step++) {
        await new Promise(resolve => setTimeout(resolve, stepDelay));
        setAgents(prev => prev.map((agent, idx) => 
          idx === i ? { ...agent, progress: (step / progressSteps) * 100 } : agent
        ));
      }
      
      // Complete
      setAgents(prev => prev.map((agent, idx) => 
        idx === i ? { ...agent, status: 'COMPLETED' as const, progress: 100 } : agent
      ));
      
      // Small delay before starting next agent
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // Generate mock results
    const results = {
      query,
      agentResults: [
        {
          agentId: "1",
          agentName: "Research Agent",
          content: `Comprehensive research analysis for: "${query}"\n\nThis analysis synthesizes information from multiple authoritative sources to provide foundational insights and context for the query.`,
          confidence: 88,
          processingTime: 2.3,
          model: "GEMINI-2.5-FLASH"
        },
        {
          agentId: "2", 
          agentName: "Critical Evaluator",
          content: `Critical evaluation of: "${query}"\n\nThis assessment examines assumptions, identifies potential biases, and evaluates the strength of evidence to ensure analytical rigor.`,
          confidence: 85,
          processingTime: 2.7,
          model: "GEMINI-2.5-FLASH"
        },
        {
          agentId: "3",
          agentName: "Creative Synthesizer", 
          content: `Creative synthesis for: "${query}"\n\nThis perspective combines insights through innovative frameworks and explores novel connections to generate unique analytical approaches.`,
          confidence: 91,
          processingTime: 3.1,
          model: "GEMINI-2.5-FLASH"
        },
        {
          agentId: "4",
          agentName: "Domain Expert",
          content: `Expert domain analysis of: "${query}"\n\nThis specialized evaluation leverages deep domain knowledge to provide authoritative insights and identify key implications.`,
          confidence: 92,
          processingTime: 2.8,
          model: "GEMINI-2.5-FLASH"
        }
      ],
      synthesizedResult: {
        summary: `Comprehensive multi-agent analysis of "${query}" combining research, critical evaluation, creative synthesis, and domain expertise.`,
        keyInsights: [
          "Multi-perspective convergence identified core analytical patterns",
          "Cross-agent validation strengthened confidence in primary findings", 
          "Emergent insights discovered through agent interaction dynamics"
        ],
        recommendations: [
          "Implement findings using systematic multi-phase approach",
          "Monitor key indicators identified by domain expert analysis",
          "Consider creative synthesis suggestions for innovative applications"
        ],
        confidence: 89,
        sources: ["Research Agent", "Critical Evaluator", "Creative Synthesizer", "Domain Expert"]
      }
    };

    onComplete?.(results);
  };

  const handleStart = async () => {
    if (!query?.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a query to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    setIsRunning(true);
    setElapsedTime(0);
    
    try {
      await simulateOrchestration();
      toast({
        title: "Analysis Complete", 
        description: "Multi-agent orchestration finished successfully.",
      });
    } catch (error) {
      console.error("Orchestration failed:", error);
      // Mark current agents as failed
      setAgents(prev => prev.map(agent => 
        agent.status === 'PROCESSING...' || agent.status === 'INITIALIZING...' 
          ? { ...agent, status: 'FAILED' as const } 
          : agent
      ));
      
      toast({
        title: "Analysis Failed",
        description: "An error occurred during orchestration.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setAgents(prev => prev.map(agent => ({ 
      ...agent, 
      status: agent.status === 'COMPLETED' ? 'COMPLETED' as const : 'QUEUED' as const,
      progress: agent.status === 'COMPLETED' ? 100 : 0
    })));
    
    toast({
      title: "Analysis Stopped",
      description: "Orchestration has been terminated.",
      variant: "destructive",
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setAgents(prev => prev.map(agent => ({ 
      ...agent, 
      status: 'QUEUED' as const, 
      progress: 0
    })));
  };

  const getOverallStatus = () => {
    const completedCount = agents.filter(a => a.status === 'COMPLETED').length;
    const failedCount = agents.filter(a => a.status === 'FAILED').length;
    const runningCount = agents.filter(a => a.status === 'PROCESSING...' || a.status === 'INITIALIZING...').length;
    
    if (failedCount > 0) return { status: "Error", variant: "destructive" as const };
    if (completedCount === agents.length) return { status: "Complete", variant: "default" as const };
    if (runningCount > 0) return { status: "Running", variant: "default" as const };
    return { status: "Ready", variant: "secondary" as const };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Control Panel */}
      <Card className="glass-panel">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Multi-Agent Orchestrator</h3>
            </div>
            
            <Badge variant={overallStatus.variant} className="text-xs">
              {overallStatus.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleStart}
              disabled={isRunning || !query?.trim()}
              variant="neon"
              size="sm"
              className="hover-lift"
            >
              <Play className="h-4 w-4" />
              Start Analysis
            </Button>
            
            <Button
              onClick={handleStop}
              disabled={!isRunning}
              variant="outline"
              size="sm"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
            
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
          
          {query && (
            <div className="mt-4 p-3 bg-background/30 rounded border border-border/30">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Query:</span> {query}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Orchestrator Display */}
      <OrchestratorDisplay
        agents={agents}
        isRunning={isRunning}
        elapsedTime={elapsedTime}
        modelName="GEMINI-2.5-FLASH HEAVY"
      />
    </div>
  );
};