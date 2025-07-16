import { CheckCircle, Clock, AlertCircle, Circle, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export type AgentState = "idle" | "running" | "complete" | "error";

interface AgentStatusProps {
  name: string;
  state: AgentState;
  progress?: number;
  model?: string;
  output?: string;
  className?: string;
}

const stateConfig = {
  idle: {
    icon: Circle,
    color: "text-muted-foreground",
    bg: "bg-muted/20",
    border: "border-muted",
    shadow: "",
  },
  running: {
    icon: Cpu,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary",
    shadow: "shadow-[0_0_15px_hsl(var(--primary)/0.3)] animate-pulse-glow",
  },
  complete: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success",
    shadow: "shadow-[0_0_10px_hsl(var(--success)/0.3)]",
  },
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive",
    shadow: "shadow-[0_0_10px_hsl(var(--destructive)/0.3)]",
  },
};

export const AgentStatus = ({ 
  name, 
  state, 
  progress = 0, 
  model, 
  output, 
  className 
}: AgentStatusProps) => {
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "glass-panel rounded-lg p-4 transition-smooth",
        config.bg,
        config.border,
        config.shadow,
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-5 w-5", config.color)} />
          <h3 className="font-semibold text-sm">{name}</h3>
        </div>
        
        {model && (
          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/20 rounded">
            {model}
          </span>
        )}
      </div>

      {state === "running" && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Processing...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted/20 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-smooth shadow-neon"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {output && (
        <div className="mt-3 p-3 bg-background/50 rounded border border-border/50 custom-scrollbar max-h-32 overflow-y-auto">
          <p className="text-xs text-muted-foreground whitespace-pre-wrap">
            {output}
          </p>
        </div>
      )}
    </div>
  );
};