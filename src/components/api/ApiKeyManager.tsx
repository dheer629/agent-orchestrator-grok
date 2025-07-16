import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Settings,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiKey {
  id: string;
  name: string;
  provider: string;
  key: string;
  isValid: boolean;
  isValidating: boolean;
  models: string[];
}

interface ApiKeyManagerProps {
  apiKeys: ApiKey[];
  onAddKey: (provider: string, name: string, key: string) => void;
  onRemoveKey: (id: string) => void;
  onValidateKey: (id: string) => void;
  className?: string;
}

const providers = [
  { id: "openrouter", name: "OpenRouter", color: "bg-blue-500" },
  { id: "anthropic", name: "Anthropic", color: "bg-orange-500" },
  { id: "openai", name: "OpenAI", color: "bg-green-500" },
  { id: "deepseek", name: "DeepSeek", color: "bg-purple-500" },
];

export const ApiKeyManager = ({
  apiKeys,
  onAddKey,
  onRemoveKey,
  onValidateKey,
  className
}: ApiKeyManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState({ provider: "", name: "", key: "" });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const handleAddKey = () => {
    if (newKey.provider && newKey.name && newKey.key) {
      onAddKey(newKey.provider, newKey.name, newKey.key);
      setNewKey({ provider: "", name: "", key: "" });
      setIsAdding(false);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return "*".repeat(key.length);
    return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-glow">API Key Management</h2>
          <p className="text-sm text-muted-foreground">
            Configure API keys for different LLM providers
          </p>
        </div>

        <Button variant="neon" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4" />
          Add Key
        </Button>
      </div>

      {/* Add New Key Form */}
      {isAdding && (
        <Card className="glass-panel border-primary/20 animate-fade-in">
          <div className="p-6">
            <h3 className="font-medium mb-4">Add New API Key</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Provider</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setNewKey(prev => ({ ...prev, provider: provider.id }))}
                      className={cn(
                        "p-3 rounded-lg border transition-smooth text-sm font-medium",
                        newKey.provider === provider.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-background/50 hover:border-primary/50"
                      )}
                    >
                      {provider.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={newKey.name}
                  onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Primary Key, Development, etc."
                  className="bg-background/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">API Key</label>
                <Input
                  type="password"
                  value={newKey.key}
                  onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="Enter your API key..."
                  className="bg-background/50"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddKey} variant="neon" size="sm">
                  Add Key
                </Button>
                <Button onClick={() => setIsAdding(false)} variant="ghost" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Existing Keys */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <Card className="glass-panel">
            <div className="p-8 text-center">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No API Keys Configured</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add API keys to start using the multi-agent system
              </p>
              <Button variant="neon" onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4" />
                Add Your First Key
              </Button>
            </div>
          </Card>
        ) : (
          apiKeys.map((apiKey) => {
            const provider = providers.find(p => p.id === apiKey.provider);
            const isVisible = showKeys[apiKey.id];
            
            return (
              <Card key={apiKey.id} className="glass-panel animate-fade-in">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        provider?.color || "bg-gray-500"
                      )} />
                      
                      <div>
                        <h3 className="font-medium">{apiKey.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {provider?.name || apiKey.provider}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={apiKey.isValid ? "default" : "destructive"}>
                        {apiKey.isValidating ? (
                          "Validating..."
                        ) : apiKey.isValid ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Valid
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Invalid
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Input
                      value={isVisible ? apiKey.key : maskKey(apiKey.key)}
                      readOnly
                      className="font-mono text-sm bg-background/50"
                    />
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  {apiKey.models.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Available Models:</p>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.models.slice(0, 5).map((model) => (
                          <Badge key={model} variant="outline" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                        {apiKey.models.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{apiKey.models.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => onValidateKey(apiKey.id)}
                        disabled={apiKey.isValidating}
                      >
                        <Settings className="h-4 w-4" />
                        {apiKey.isValidating ? "Validating..." : "Validate"}
                      </Button>
                      
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={`https://${apiKey.provider}.com/docs`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Docs
                        </a>
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveKey(apiKey.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
