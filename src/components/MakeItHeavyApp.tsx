import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Key, Download, Share2, RotateCcw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { QueryInput } from "@/components/query/QueryInput";
import { OrchestratorPanel } from "@/components/agents/OrchestratorPanel";
import { MultiAgentPanel } from "@/components/agents/MultiAgentPanel";
import { ModelDropdown } from "@/components/models/ModelDropdown";
import { ResultsDisplay } from "@/components/results/ResultsDisplay";
import { ApiKeyManager } from "@/components/api/ApiKeyManager";
import { ApiSettings } from "@/components/settings/ApiSettings";
import { useToast } from "@/hooks/use-toast";
import { apiClient, mapApiStatusToAppStatus, type OrchestrationResult } from "@/lib/api";
import { modelManager, fetchModelsForProvider, type Model } from "@/lib/models";

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

// Get models from the centralized model manager
const availableModels = modelManager.getModels();

export const MakeItHeavyApp = () => {
  // State management
  const [query, setQuery] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [modelAssignments, setModelAssignments] = useState<ModelAssignment[]>([]);
  const [mode, setMode] = useState<"single" | "multi">("multi");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<OrchestrationResult | null>(null);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("query");
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState("http://localhost:8000");

  const { toast } = useToast();

  // Real-time status polling
  useEffect(() => {
    if (!currentTaskId || !isRunning) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await apiClient.getOrchestrationStatus(currentTaskId);
        
        // Update agents with real status
        setAgents(prev => prev.map(agent => {
          const agentStatus = status.agents.find(a => a.agentId === agent.id);
          if (agentStatus) {
            return {
              ...agent,
              state: mapApiStatusToAppStatus(agentStatus.status),
              progress: agentStatus.progress,
              output: agentStatus.output
            };
          }
          return agent;
        }));

        // Check if orchestration is complete
        if (!status.isRunning) {
          setIsRunning(false);
          setTotalTime(status.elapsedTime);
          
          // Get final results
          try {
            const results = await apiClient.getOrchestrationResults(currentTaskId);
            setResults(results);
            setActiveTab("results");
            
            toast({
              title: "Analysis Complete",
              description: "Multi-agent orchestration finished successfully.",
            });
          } catch (error) {
            console.error('Failed to get results:', error);
            toast({
              title: "Results Error",
              description: "Failed to retrieve orchestration results.",
              variant: "destructive",
            });
          }
          
          setCurrentTaskId(null);
        }
      } catch (error) {
        console.error('Failed to poll status:', error);
        setIsRunning(false);
        setCurrentTaskId(null);
        
        toast({
          title: "Connection Error",
          description: "Lost connection to the Python API.",
          variant: "destructive",
        });
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [currentTaskId, isRunning, toast]);

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
    setCurrentTaskId(null);

    // Reset agents
    setAgents(prev => prev.map(agent => ({
      ...agent,
      state: "idle",
      progress: 0,
      output: undefined
    })));

    try {
      // Prepare API keys for the backend
      const apiKeyMap = apiKeys.reduce((acc, key) => {
        acc[key.provider] = key.key;
        return acc;
      }, {} as Record<string, string>);

      // Start orchestration via API
      const response = await apiClient.startOrchestration(query, apiKeyMap);
      setCurrentTaskId(response.taskId);
      
      toast({
        title: "Analysis Started",
        description: "Multi-agent orchestration is running...",
      });
      
    } catch (error) {
      console.error('Failed to start orchestration:', error);
      setIsRunning(false);
      
      toast({
        title: "Start Failed",
        description: "Could not start orchestration. Check your API connection.",
        variant: "destructive",
      });
    }
  }, [query, apiKeys, toast]);

  const handleStopAnalysis = useCallback(async () => {
    if (currentTaskId) {
      try {
        await apiClient.stopOrchestration(currentTaskId);
      } catch (error) {
        console.error('Failed to stop orchestration:', error);
      }
    }
    
    setIsRunning(false);
    setCurrentTaskId(null);
    setAgents(prev => prev.map(agent => ({
      ...agent,
      state: "idle",
      progress: 0
    })));
    
    toast({
      title: "Analysis Stopped",
      description: "Multi-agent analysis has been stopped.",
    });
  }, [currentTaskId, toast]);

  const handleResetAgents = useCallback(() => {
    setAgents(prev => prev.map(agent => ({
      ...agent,
      state: "idle",
      progress: 0,
      output: undefined
    })));
    setResults(null);
    setTotalTime(0);
  }, []);

  const handleAddApiKey = useCallback(async (provider: string, key: string) => {
    // Generate a default name based on provider
    const name = `${provider.charAt(0).toUpperCase() + provider.slice(1)} Key`;
    
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name,
      provider,
      key,
      isValid: false,
      isValidating: true,
      models: []
    };
    
    setApiKeys(prev => [...prev, newKey]);

    try {
      // Validate the key and fetch models
      const validation = await apiClient.validateApiKey(provider, key);
      const availableModels = await fetchModelsForProvider(provider);
      
      setApiKeys(prev => prev.map(apiKey => 
        apiKey.id === newKey.id 
          ? { 
              ...apiKey, 
              isValid: validation.isValid, 
              isValidating: false,
              models: validation.models || availableModels 
            }
          : apiKey
      ));

      toast({
        title: validation.isValid ? "API Key Valid" : "API Key Invalid",
        description: validation.isValid ? 
          `Successfully validated ${provider} API key with ${(validation.models || availableModels).length} models` : 
          "The provided API key is not valid",
        variant: validation.isValid ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Validation failed:', error);
      setApiKeys(prev => prev.map(apiKey => 
        apiKey.id === newKey.id 
          ? { ...apiKey, isValid: false, isValidating: false }
          : apiKey
      ));

      toast({
        title: "Validation Error",
        description: "Could not validate API key. It has been added but may need manual validation.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleRemoveApiKey = useCallback((id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
    setModelAssignments(prev => prev.filter(assignment => assignment.apiKeyId !== id));
    
    toast({
      title: "API Key Removed",
      description: "API key has been successfully removed.",
    });
  }, [toast]);

  const handleValidateApiKey = useCallback(async (id: string) => {
    const keyToValidate = apiKeys.find(k => k.id === id);
    if (!keyToValidate) return;

    setApiKeys(prev => prev.map(key => 
      key.id === id 
        ? { ...key, isValidating: true }
        : key
    ));
    
    try {
      const result = await apiClient.validateApiKey(keyToValidate.provider, keyToValidate.key);
      const availableModels = await fetchModelsForProvider(keyToValidate.provider);
      
      setApiKeys(prev => prev.map(key => 
        key.id === id 
          ? { 
              ...key, 
              isValidating: false, 
              isValid: result.isValid,
              models: result.models || availableModels
            }
          : key
      ));
      
      toast({
        title: result.isValid ? "Key Valid" : "Key Invalid",
        description: result.isValid 
          ? `API key validated with ${(result.models || availableModels).length} models available` 
          : "API key validation failed",
        variant: result.isValid ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Validation failed:', error);
      
      setApiKeys(prev => prev.map(key => 
        key.id === id 
          ? { ...key, isValidating: false, isValid: false, models: [] }
          : key
      ));
      
      toast({
        title: "Validation Error",
        description: "Could not validate API key. Check your connection.",
        variant: "destructive",
      });
    }
  }, [apiKeys, toast]);

  const handleAssignModel = useCallback((agentId: string, modelId: string, apiKeyId: string) => {
    setModelAssignments(prev => [
      ...prev.filter(a => a.agentId !== agentId),
      { agentId, modelId, apiKeyId }
    ]);
    
    const model = modelManager.getModelById(modelId);
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
    if (!results) return;
    
    // In a real implementation, this would export the actual results
    const exportData = JSON.stringify(results, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orchestration-results.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `Results exported as ${format.toUpperCase()}`,
    });
  }, [results, toast]);

  const handleShareResults = useCallback(() => {
    // In a real implementation, this would create a shareable link
    navigator.clipboard.writeText(window.location.href);
    
    toast({
      title: "Share Link Copied",
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

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="query">Query</TabsTrigger>
            <TabsTrigger value="orchestrator">Orchestrator</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="query" className="space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Model Selection</label>
                  <ModelDropdown
                    selectedModel={selectedModel}
                    onModelSelect={setSelectedModel}
                    availableModels={availableModels}
                    availableApiKeys={apiKeys}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">System Prompt</label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Enter system prompt for the agents..."
                    className="w-full min-h-[80px] p-3 rounded-lg border bg-background/50 text-sm"
                  />
                </div>
              </div>
              
              <QueryInput
                value={query}
                onChange={setQuery}
                onSubmit={handleStartAnalysis}
                isLoading={isRunning}
              />
            </div>
          </TabsContent>

          <TabsContent value="orchestrator" className="space-y-6">
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Multi-Agent Orchestrator</h2>
                  <p className="text-muted-foreground">Monitor and control agent execution</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isRunning ? "default" : "secondary"}>
                    {isRunning ? "Running" : "Idle"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetAgents}
                    disabled={isRunning}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>

              <MultiAgentPanel
                agents={agents}
                isRunning={isRunning}
                mode={mode}
                onToggleMode={setMode}
                onStart={handleStartAnalysis}
                onStop={handleStopAnalysis}
                onReset={handleResetAgents}
              />
            </div>
          </TabsContent>


          <TabsContent value="results" className="space-y-6">
            {results ? (
              <ResultsDisplay
                query={results.query}
                agentResults={results.agentResults.map(result => ({
                  ...result,
                  confidence: result.metadata?.confidence || 0.8,
                  processingTime: result.metadata?.executionTime || 5.2,
                  model: agents.find(a => a.id === result.agentId)?.model || "Unknown"
                }))}
                isComplete={!isRunning}
                totalTime={totalTime}
                onExport={handleExportResults}
                onShare={handleShareResults}
              />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground mb-4">
                  No results yet
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Start an orchestration to see results
                </p>
                <Button onClick={() => setActiveTab("query")}>
                  Go to Query
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* API Key Manager Dialog */}
      <Dialog open={showApiKeyManager} onOpenChange={setShowApiKeyManager}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <ApiSettings 
              currentApiUrl={apiUrl}
              onApiUrlChange={(url) => {
                setApiUrl(url);
                apiClient.setBaseUrl(url);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};