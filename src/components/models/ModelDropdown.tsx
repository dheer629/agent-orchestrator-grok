import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Cpu, Zap, Brain, Sparkles } from "lucide-react";
import { Model } from "@/lib/models";
import { fetchModelsForProvider } from "@/lib/models";
import { cn } from "@/lib/utils";

interface ModelDropdownProps {
  selectedProvider?: string;
  selectedModel?: string;
  onModelSelect: (modelId: string) => void;
  availableModels: Model[];
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
  selectedProvider,
  selectedModel,
  onModelSelect,
  availableModels,
  className
}: ModelDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [providerModels, setProviderModels] = useState<string[]>([]);

  // Filter models by selected provider
  const filteredModels = selectedProvider 
    ? availableModels.filter(model => model.provider === selectedProvider)
    : availableModels;

  // Fetch real-time models when provider changes
  useEffect(() => {
    if (selectedProvider) {
      setIsLoading(true);
      fetchModelsForProvider(selectedProvider)
        .then(models => {
          setProviderModels(models);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [selectedProvider]);

  return (
    <div className={cn("space-y-2", className)}>
      <Select value={selectedModel} onValueChange={onModelSelect}>
        <SelectTrigger className="bg-background/50">
          <SelectValue placeholder={
            isLoading ? "Loading models..." : "Select model"
          } />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
        </SelectTrigger>
        <SelectContent className="bg-background border-border/50">
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
              {selectedProvider ? 
                `No models available for ${selectedProvider}` : 
                'Select a provider first'
              }
            </div>
          )}
        </SelectContent>
      </Select>
      
      {selectedModel && (
        <div className="text-xs text-muted-foreground">
          {providerModels.length > 0 && (
            <p>
              <Sparkles className="h-3 w-3 inline mr-1" />
              {providerModels.length} real-time models available
            </p>
          )}
        </div>
      )}
    </div>
  );
}