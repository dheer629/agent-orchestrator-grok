import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Copy, 
  Share, 
  FileText, 
  BarChart3, 
  Network,
  Sparkles,
  Clock,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentResult {
  agentId: string;
  agentName: string;
  content: string;
  confidence: number;
  processingTime: number;
  model: string;
}

interface SynthesizedResult {
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  confidence: number;
  sources: string[];
}

interface ResultsDisplayProps {
  query: string;
  agentResults: AgentResult[];
  synthesizedResult?: SynthesizedResult;
  isComplete: boolean;
  totalTime: number;
  onExport: (format: string) => void;
  onShare: () => void;
  className?: string;
}

export const ResultsDisplay = ({
  query,
  agentResults,
  synthesizedResult,
  isComplete,
  totalTime,
  onExport,
  onShare,
  className
}: ResultsDisplayProps) => {
  const [activeTab, setActiveTab] = useState("synthesis");
  const [copiedContent, setCopiedContent] = useState<string | null>(null);

  const handleCopy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedContent(type);
      setTimeout(() => setCopiedContent(null), 2000);
    } catch (err) {
      console.error("Failed to copy content:", err);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-success";
    if (confidence >= 60) return "text-warning";
    return "text-destructive";
  };

  const avgConfidence = agentResults.length > 0 
    ? agentResults.reduce((sum, r) => sum + r.confidence, 0) / agentResults.length 
    : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="glass-panel">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-glow mb-2">Analysis Results</h2>
              <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
                <strong>Query:</strong> {query}
              </p>
            </div>
            
            {isComplete && (
              <div className="flex items-center gap-2 ml-4">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm font-medium text-success">Complete</span>
              </div>
            )}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background/30 rounded-lg">
              <div className="text-lg font-bold text-primary">{agentResults.length}</div>
              <div className="text-xs text-muted-foreground">Agents</div>
            </div>
            
            <div className="text-center p-3 bg-background/30 rounded-lg">
              <div className={cn("text-lg font-bold", getConfidenceColor(avgConfidence))}>
                {avgConfidence.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Confidence</div>
            </div>
            
            <div className="text-center p-3 bg-background/30 rounded-lg">
              <div className="text-lg font-bold text-accent">{totalTime.toFixed(1)}s</div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
            
            <div className="text-center p-3 bg-background/30 rounded-lg">
              <div className="text-lg font-bold text-foreground">
                {synthesizedResult ? synthesizedResult.keyInsights.length : 0}
              </div>
              <div className="text-xs text-muted-foreground">Key Insights</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="neon" size="sm" onClick={() => onExport("pdf")}>
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
        
        <Button variant="glass" size="sm" onClick={() => onExport("json")}>
          <FileText className="h-4 w-4" />
          Export JSON
        </Button>
        
        <Button variant="glass" size="sm" onClick={onShare}>
          <Share className="h-4 w-4" />
          Share Results
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleCopy(
            synthesizedResult?.summary || "No synthesis available", 
            "synthesis"
          )}
        >
          <Copy className="h-4 w-4" />
          {copiedContent === "synthesis" ? "Copied!" : "Copy Summary"}
        </Button>
      </div>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="synthesis" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Synthesis
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Agent Results
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* Synthesized Results */}
        <TabsContent value="synthesis" className="space-y-4">
          {synthesizedResult ? (
            <>
              <Card className="glass-panel">
                <div className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Executive Summary
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {synthesizedResult.summary}
                  </p>
                </div>
              </Card>

              <Card className="glass-panel">
                <div className="p-6">
                  <h3 className="font-semibold mb-4">Key Insights</h3>
                  <ul className="space-y-3">
                    {synthesizedResult.keyInsights.map((insight, index) => (
                      <li key={index} className="flex gap-3">
                        <Badge variant="outline" className="shrink-0 mt-0.5">
                          {index + 1}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <Card className="glass-panel">
                <div className="p-6">
                  <h3 className="font-semibold mb-4">Recommendations</h3>
                  <ul className="space-y-3">
                    {synthesizedResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span className="text-sm text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </>
          ) : (
            <Card className="glass-panel">
              <div className="p-8 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Synthesis In Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Waiting for all agents to complete their analysis...
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Individual Agent Results */}
        <TabsContent value="agents" className="space-y-4">
          {agentResults.length > 0 ? (
            agentResults.map((result, index) => (
              <Card key={result.agentId} className="glass-panel animate-fade-in">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <h3 className="font-semibold">{result.agentName}</h3>
                        <p className="text-xs text-muted-foreground">{result.model}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-muted-foreground">
                          {result.processingTime.toFixed(1)}s
                        </span>
                      </div>
                      
                      <div className={cn("font-medium", getConfidenceColor(result.confidence))}>
                        {result.confidence}% confidence
                      </div>
                    </div>
                  </div>

                  <div className="bg-background/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {result.content}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopy(result.content, result.agentId)}
                    >
                      <Copy className="h-4 w-4" />
                      {copiedContent === result.agentId ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="glass-panel">
              <div className="p-8 text-center">
                <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No Agent Results Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Agent results will appear here as they complete their analysis.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card className="glass-panel">
            <div className="p-6">
              <h3 className="font-semibold mb-4">Performance Analysis</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Agent Performance</h4>
                  <div className="space-y-2">
                    {agentResults.map((result) => (
                      <div key={result.agentId} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                        <span className="text-sm">{result.agentName}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {result.processingTime.toFixed(1)}s
                          </span>
                          <span className={getConfidenceColor(result.confidence)}>
                            {result.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {synthesizedResult && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Source Attribution</h4>
                    <div className="flex flex-wrap gap-2">
                      {synthesizedResult.sources.map((source, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};