import { useState, useCallback } from "react";
import { Header } from "./layout/Header";
import { QueryInput } from "./query/QueryInput";
import { OrchestratorPanel } from "./agents/OrchestratorPanel";
import { ModelSelector } from "./models/ModelSelector";
import { ApiKeyManager } from "./api/ApiKeyManager";
import { ResultsDisplay } from "./results/ResultsDisplay";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Cpu, 
  Settings, 
  Zap, 
  Network,
  BarChart3,
  FileText
} from "lucide-react";

// Mock data and types
interface Agent {
  id: string;
  name: string;
  state: "idle" | "running" | "complete" | "error";
  progress: number;
  model: string;
  output?: string;
}

interface ApiKey {
  id: string;
  name: string;
  provider: string;
  key: string;
  isValid: boolean;
  isValidating: boolean;
  models: string[];
}

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

const defaultAgents: Agent[] = [
  { id: "1", name: "Research Analyst", state: "idle", progress: 0, model: "GPT-4.1-mini" },
  { id: "2", name: "Critical Evaluator", state: "idle", progress: 0, model: "Claude-3.5-Sonnet" },
  { id: "3", name: "Creative Synthesizer", state: "idle", progress: 0, model: "GPT-4.1" },
  { id: "4", name: "Domain Expert", state: "idle", progress: 0, model: "Claude-3-Opus" },
];

const mockModels: Model[] = [
  { 
    id: "gpt-4.1-mini", 
    name: "GPT-4.1-mini", 
    provider: "openai", 
    contextLength: 128000, 
    costPer1k: 0.003, 
    speed: "fast", 
    quality: "high" 
  },
  { 
    id: "gpt-4.1", 
    name: "GPT-4.1", 
    provider: "openai", 
    contextLength: 128000, 
    costPer1k: 0.03, 
    speed: "medium", 
    quality: "high" 
  },
  { 
    id: "claude-3.5-sonnet", 
    name: "Claude-3.5-Sonnet", 
    provider: "anthropic", 
    contextLength: 200000, 
    costPer1k: 0.015, 
    speed: "medium", 
    quality: "high" 
  },
  { 
    id: "claude-3-opus", 
    name: "Claude-3-Opus", 
    provider: "anthropic", 
    contextLength: 200000, 
    costPer1k: 0.075, 
    speed: "slow", 
    quality: "high" 
  },
];

export const MakeItHeavyApp = () => {
  // State management
  const [query, setQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [modelAssignments, setModelAssignments] = useState<ModelAssignment[]>([]);
  const [mode, setMode] = useState<"single" | "multi">("multi");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [totalTime, setTotalTime] = useState(0);
  
  // Dialog states
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("query");

  const { toast } = useToast();

  // Simulation functions
  const simulateAgentExecution = useCallback(async (agentId: string) => {
    const steps = [25, 50, 75, 100];
    
    for (const progress of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { 
              ...agent, 
              progress,
              state: progress === 100 ? "complete" : "running",
              output: progress === 100 ? `Analysis complete for: "${query}"\n\nThis agent has provided detailed insights based on its specialized perspective. The analysis includes comprehensive evaluation of the query parameters and contextual considerations.` : undefined
            }
          : agent
      ));
    }
  }, [query]);

  // Event handlers
  const handleStartAnalysis = useCallback(async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a query to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (apiKeys.length === 0) {
      toast({
        title: "API Keys Required",
        description: "Please configure at least one API key to proceed.",
        variant: "destructive",
      });
      setShowApiKeyManager(true);
      return;
    }

    setIsRunning(true);
    setResults(null);
    const startTime = Date.now();

    // Reset agents
    setAgents(prev => prev.map(agent => ({
      ...agent,
      state: "idle",
      progress: 0,
      output: undefined
    })));

    // Start agent execution
    const activeAgents = mode === "multi" ? agents : [agents[0]];
    
    // Simulate parallel execution
    setTimeout(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        state: activeAgents.find(a => a.id === agent.id) ? "running" : "idle"
      })));

      activeAgents.forEach(agent => {
        simulateAgentExecution(agent.id);
      });
    }, 500);

    // Simulate completion
    setTimeout(() => {
      setIsRunning(false);
      setTotalTime((Date.now() - startTime) / 1000);
      setResults({
        query,
        agentResults: activeAgents.map(agent => ({
          agentId: agent.id,
          agentName: agent.name,
          content: `Detailed analysis from ${agent.name}:\n\nThis analysis provides comprehensive insights into the query "${query}". The agent has processed the information through its specialized lens and identified key patterns, implications, and actionable recommendations.`,
          confidence: 75 + Math.random() * 20,
          processingTime: 2 + Math.random() * 3,
          model: agent.model
        })),
        synthesizedResult: {
          summary: `Based on comprehensive multi-agent analysis of "${query}", this synthesis combines insights from ${activeAgents.length} specialized agents to provide a holistic perspective.`,
          keyInsights: [
            "Primary insight derived from cross-agent consensus",
            "Secondary finding with high confidence rating",
            "Tertiary observation requiring further investigation"
          ],
          recommendations: [
            "Immediate action item based on analysis",
            "Medium-term strategic consideration",
            "Long-term monitoring recommendation"
          ],
          confidence: 85,
          sources: activeAgents.map(a => a.name)
        }
      });
      setActiveTab("results");
      
      toast({
        title: "Analysis Complete",
        description: `Successfully processed query using ${activeAgents.length} agent${activeAgents.length > 1 ? 's' : ''}.`,
      });
    }, 8000);
  }, [query, apiKeys, agents, mode, simulateAgentExecution, toast]);

  const handleStopAnalysis = useCallback(() => {
    setIsRunning(false);
    setAgents(prev => prev.map(agent => ({
      ...agent,
      state: agent.state === "running" ? "error" : agent.state
    })));
    
    toast({
      title: "Analysis Stopped",
      description: "Agent execution has been terminated.",
      variant: "destructive",
    });
  }, [toast]);

  const handleResetAgents = useCallback(() => {
    setAgents(prev => prev.map(agent => ({
      ...agent,
      state: "idle",
      progress: 0,
      output: undefined
    })));
    setResults(null);
  }, []);

  const handleAddApiKey = useCallback((provider: string, name: string, key: string) => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name,
      provider,
      key,
      isValid: true, // Simulate validation
      isValidating: false,
      models: mockModels.filter(m => m.provider === provider).map(m => m.name)
    };
    
    setApiKeys(prev => [...prev, newKey]);
    
    toast({
      title: "API Key Added",
      description: `Successfully added ${name} for ${provider}.`,
    });
  }, [toast]);

  const handleRemoveApiKey = useCallback((id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
    setModelAssignments(prev => prev.filter(assignment => assignment.apiKeyId !== id));
    
    toast({
      title: "API Key Removed",
      description: "API key has been successfully removed.",
    });
  }, [toast]);

  const handleValidateApiKey = useCallback((id: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === id ? { ...key, isValidating: true } : key
    ));

    // Simulate validation
    setTimeout(() => {
      setApiKeys(prev => prev.map(key => 
        key.id === id ? { ...key, isValidating: false, isValid: true } : key
      ));
      
      toast({
        title: "API Key Validated",
        description: "API key is valid and ready to use.",
      });
    }, 2000);
  }, [toast]);

  const handleAssignModel = useCallback((agentId: string, modelId: string, apiKeyId: string) => {
    setModelAssignments(prev => [
      ...prev.filter(a => a.agentId !== agentId),
      { agentId, modelId, apiKeyId }
    ]);
    
    const model = mockModels.find(m => m.id === modelId);
    if (model) {
      setAgents(prev => prev.map(agent =>
        agent.id === agentId ? { ...agent, model: model.name } : agent
      ));
    }

    toast({
      title: "Model Assigned",
      description: "Model has been successfully assigned to the agent.",
    });
  }, [toast]);

  const handleExportResults = useCallback((format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting results in ${format.toUpperCase()} format...`,
    });
  }, [toast]);

  const handleShareResults = useCallback(() => {
    toast({
      title: "Share Link Created",
      description: "Results link copied to clipboard.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleSidebar={() => {}}
        onOpenSettings={() => setShowSettings(true)}
        onOpenKeyManager={() => setShowApiKeyManager(true)}
      />

      <main className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="query" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Query
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Models
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="query" className="space-y-6">
            <QueryInput
              value={query}
              onChange={setQuery}
              onSubmit={handleStartAnalysis}
              isLoading={isRunning}
            />
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <OrchestratorPanel
              query={query}
              onComplete={setResults}
            />
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <ModelSelector
              models={mockModels}
              agents={agents}
              assignments={modelAssignments}
              onAssignModel={handleAssignModel}
              availableApiKeys={apiKeys}
            />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {results ? (
              <ResultsDisplay
                query={results.query}
                agentResults={results.agentResults}
                synthesizedResult={results.synthesizedResult}
                isComplete={!isRunning}
                totalTime={totalTime}
                onExport={handleExportResults}
                onShare={handleShareResults}
              />
            ) : (
              <Card className="glass-panel">
                <div className="p-12 text-center">
                  <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                  <h2 className="text-xl font-semibold mb-2">No Results Yet</h2>
                  <p className="text-muted-foreground mb-6">
                    Run an analysis to see results from your multi-agent system
                  </p>
                  <Button 
                    variant="neon" 
                    onClick={() => setActiveTab("query")}
                    disabled={isRunning}
                  >
                    <Zap className="h-4 w-4" />
                    Start Analysis
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* API Key Manager Dialog */}
      <Dialog open={showApiKeyManager} onOpenChange={setShowApiKeyManager}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto custom-scrollbar glass-panel">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              API Key Management
            </DialogTitle>
          </DialogHeader>
          
          <ApiKeyManager
            apiKeys={apiKeys}
            onAddKey={handleAddApiKey}
            onRemoveKey={handleRemoveApiKey}
            onValidateKey={handleValidateApiKey}
          />
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="glass-panel">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6">
            <p className="text-muted-foreground">Settings panel coming soon...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};