import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Cpu, Zap, Brain, Sparkles } from "lucide-react";
import { Model } from "@/lib/models";
import { fetchModelsForProvider } from "@/lib/models";
import { cn } from "@/lib/utils";

interface ModelDropdownProps {
  selectedModel?: string;
  onModelSelect: (modelId: string) => void;
  availableModels: Model[];
  availableApiKeys: Array<{ id: string; provider: string; isValid: boolean }>;
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
    case "high": return "text-success";
    case "medium": return "text-warning";
    case "low": return "text-muted-foreground";
    default: return "text-muted-foreground";
  }
};

export function ModelDropdown({
  selectedModel,
  onModelSelect,
  availableModels,
  availableApiKeys,
  className
}: ModelDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [realtimeModels, setRealtimeModels] = useState<string[]>([]);

  // Get unique providers from valid API keys
  const validProviders = availableApiKeys
    .filter(key => key.isValid)
    .map(key => key.provider);

  // Filter models by providers that have valid API keys
  const filteredModels = availableModels.filter(model => 
    validProviders.includes(model.provider)
  );

  // Fetch real-time models for all valid providers
  useEffect(() => {
    if (validProviders.length > 0) {
      setIsLoading(true);
      Promise.all(
        validProviders.map(provider => fetchModelsForProvider(provider))
      )
        .then(results => {
          const allModels = results.flat();
          setRealtimeModels(allModels);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [validProviders.join(',')]);  // Use join to track provider changes

  return (
    <div className={cn("space-y-2", className)}>
      <Select value={selectedModel} onValueChange={onModelSelect}>
        <SelectTrigger className="bg-background border-border min-h-[40px]">
          <SelectValue placeholder={
            isLoading ? "Loading models..." : "Select model"
          } />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
        </SelectTrigger>
        <SelectContent 
          className="bg-background border-border max-h-[300px] overflow-y-auto z-[9999]" 
          position="popper"
          sideOffset={4}
        >
          {filteredModels.map((model) => (
            <SelectItem key={model.id} value={model.id} className="cursor-pointer">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {getSpeedIcon(model.speed)}
                  <span className="font-medium">{model.name}</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getQualityColor(model.quality))}
                  >
                    {model.quality}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ${model.costPer1k.toFixed(4)}/1K
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
          
          {filteredModels.length === 0 && !isLoading && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {validProviders.length === 0 ? 
                'Add and validate API keys first' :
                'No models available for selected providers'
              }
            </div>
          )}
        </SelectContent>
      </Select>
      
      {selectedModel && (
        <div className="text-xs text-muted-foreground">
          {realtimeModels.length > 0 && (
            <p>
              <Sparkles className="h-3 w-3 inline mr-1" />
              {realtimeModels.length} real-time models available
            </p>
          )}
        </div>
      )}
    </div>
  );
}