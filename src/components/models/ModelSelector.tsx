import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Zap, Brain, Sparkles, Check, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface Model {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  costPer1k: number;
  speed: "fast" | "medium" | "slow";
  quality: "high" | "medium" | "low";
}

interface ModelAssignment {
  agentId: string;
  modelId: string;
  apiKeyId: string;
}

interface ModelSelectorProps {
  models: Model[];
  agents: Array<{ id: string; name: string }>;
  assignments: ModelAssignment[];
  onAssignModel: (agentId: string, modelId: string, apiKeyId: string) => void;
  availableApiKeys: Array<{ id: string; name: string; provider: string }>;
  className?: string;
}

const getSpeedIcon = (speed: string) => {
  switch (speed) {
    case "fast": return <Zap className="h-3 w-3 text-success" />;
    case "medium": return <Cpu className="h-3 w-3 text-warning" />;
    case "slow": return <Brain className="h-3 w-3 text-muted-foreground" />;
    default: return <Cpu className="h-3 w-3" />;
  }
};

const getQualityColor = (quality: string) => {
  switch (quality) {
    case "high": return "border-success text-success";
    case "medium": return "border-warning text-warning";
    case "low": return "border-muted-foreground text-muted-foreground";
    default: return "border-muted-foreground text-muted-foreground";
  }
};

export const ModelSelector = ({
  models,
  agents,
  assignments,
  onAssignModel,
  availableApiKeys,
  className
}: ModelSelectorProps) => {
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedApiKey, setSelectedApiKey] = useState<string>("");

  const handleAssign = () => {
    if (selectedAgent && selectedModel && selectedApiKey) {
      onAssignModel(selectedAgent, selectedModel, selectedApiKey);
      setSelectedAgent("");
      setSelectedModel("");
      setSelectedApiKey("");
    }
  };

  const getAssignmentForAgent = (agentId: string) => {
    return assignments.find(a => a.agentId === agentId);
  };

  const getModelById = (modelId: string) => {
    return models.find(m => m.id === modelId);
  };

  const getApiKeyById = (apiKeyId: string) => {
    return availableApiKeys.find(k => k.id === apiKeyId);
  };

  const getCompatibleApiKeys = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return [];
    return availableApiKeys.filter(key => key.provider === model.provider);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-glow">Model Assignment</h2>
          <p className="text-sm text-muted-foreground">
            Configure models for each agent in your multi-agent system
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {assignments.length} / {agents.length} assigned
          </Badge>
        </div>
      </div>

      {/* Assignment Form */}
      <Card className="glass-panel">
        <div className="p-6">
          <h3 className="font-medium mb-4">Assign Model to Agent</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        {getSpeedIcon(model.speed)}
                        <span>{model.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">API Key</label>
              <Select 
                value={selectedApiKey} 
                onValueChange={setSelectedApiKey}
                disabled={!selectedModel}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select API key" />
                </SelectTrigger>
                <SelectContent>
                  {getCompatibleApiKeys(selectedModel).map((apiKey) => (
                    <SelectItem key={apiKey.id} value={apiKey.id}>
                      {apiKey.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleAssign}
            disabled={!selectedAgent || !selectedModel || !selectedApiKey}
            variant="neon"
            size="sm"
          >
            <Check className="h-4 w-4" />
            Assign Model
          </Button>
        </div>
      </Card>

      {/* Current Assignments */}
      <div className="space-y-4">
        <h3 className="font-medium">Current Assignments</h3>
        
        {agents.length === 0 ? (
          <Card className="glass-panel">
            <div className="p-8 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Agents Available</h3>
              <p className="text-sm text-muted-foreground">
                Configure your multi-agent system to assign models
              </p>
            </div>
          </Card>
        ) : (
          agents.map((agent) => {
            const assignment = getAssignmentForAgent(agent.id);
            const model = assignment ? getModelById(assignment.modelId) : null;
            const apiKey = assignment ? getApiKeyById(assignment.apiKeyId) : null;

            return (
              <Card key={agent.id} className="glass-panel animate-fade-in">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        assignment ? "bg-primary" : "bg-muted-foreground"
                      )} />
                      
                      <div>
                        <h3 className="font-medium">{agent.name}</h3>
                        {assignment && model && apiKey ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {model.name}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {apiKey.name}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No model assigned
                          </p>
                        )}
                      </div>
                    </div>

                    {assignment && model && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getQualityColor(model.quality)}>
                          {model.quality}
                        </Badge>
                        
                        <div className="flex items-center gap-1">
                          {getSpeedIcon(model.speed)}
                          <span className="text-xs text-muted-foreground">
                            {model.speed}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {assignment && model && (
                    <div className="mt-4 p-3 bg-background/30 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Context:</span>
                          <span className="block font-medium">
                            {model.contextLength.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost/1K:</span>
                          <span className="block font-medium">
                            ${model.costPer1k.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Provider:</span>
                          <span className="block font-medium">
                            {model.provider}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Quality:</span>
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-accent" />
                            <span className="font-medium">{model.quality}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};