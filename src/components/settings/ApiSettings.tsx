import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Check, X, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ApiSettingsProps {
  onApiUrlChange: (url: string) => void;
  currentApiUrl: string;
}

export function ApiSettings({ onApiUrlChange, currentApiUrl }: ApiSettingsProps) {
  const [apiUrl, setApiUrl] = useState(currentApiUrl);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const { toast } = useToast();

  const handleTestConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus('unknown');

    try {
      apiClient.setBaseUrl(apiUrl);
      await apiClient.healthCheck();
      setConnectionStatus('connected');
      onApiUrlChange(apiUrl);
      
      toast({
        title: "Connection Successful",
        description: "Successfully connected to the Python API.",
      });
    } catch (error) {
      setConnectionStatus('error');
      console.error('Connection failed:', error);
      
      toast({
        title: "Connection Failed",
        description: "Could not connect to the Python API. Make sure it's running.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" />Connected</Badge>;
      case 'error':
        return <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" />Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Settings className="h-5 w-5" />
        <div>
          <CardTitle>Python API Settings</CardTitle>
          <CardDescription>
            Configure connection to your Python OpenRouter orchestrator backend
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-url">API Base URL</Label>
          <Input
            id="api-url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000"
            className="font-mono"
          />
          <p className="text-sm text-muted-foreground">
            The base URL where your Python orchestrator API is running
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            {getStatusBadge()}
          </div>
          
          <Button 
            onClick={handleTestConnection}
            disabled={isConnecting || !apiUrl.trim()}
            size="sm"
          >
            {isConnecting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Test Connection
          </Button>
        </div>

        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">Expected API Endpoints:</p>
          <ul className="text-xs space-y-1 font-mono">
            <li>• POST /orchestrate/start</li>
            <li>• GET /orchestrate/status/[taskId]</li>
            <li>• GET /orchestrate/results/[taskId]</li>
            <li>• POST /orchestrate/stop/[taskId]</li>
            <li>• POST /validate-key</li>
            <li>• GET /health</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}