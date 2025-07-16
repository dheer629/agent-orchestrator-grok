import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Sparkles, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  isLoading?: boolean;
  className?: string;
}

const exampleQueries = [
  "Analyze the impact of AI on healthcare outcomes",
  "Compare renewable energy strategies across different countries",
  "Evaluate the ethical implications of gene editing technology",
  "Assess the future of remote work in various industries"
];

export const QueryInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  isLoading = false,
  className 
}: QueryInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (value.trim() && !isLoading) {
      onSubmit(value.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExampleClick = (example: string) => {
    onChange(example);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card className={cn(
        "glass-panel border transition-smooth",
        isFocused ? "border-primary shadow-neon" : "border-border/50"
      )}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Query Input</h3>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyPress}
                placeholder="Enter your query for multi-agent analysis..."
                className={cn(
                  "min-h-[120px] resize-none bg-background/50 border-border/50 transition-smooth",
                  "focus:border-primary focus:shadow-neon",
                  "custom-scrollbar"
                )}
                disabled={isLoading}
              />
              
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="absolute top-2 right-2 opacity-60 hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Tip: Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Enter</kbd> to submit
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={!value.trim() || isLoading}
                variant="neon"
                size="sm"
                className="hover-lift"
              >
                <Send className="h-4 w-4" />
                {isLoading ? "Processing..." : "Analyze"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Example Queries */}
      {!value && (
        <Card className="glass-panel">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-accent" />
              <h4 className="text-sm font-medium">Example Queries</h4>
            </div>
            
            <div className="grid gap-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className={cn(
                    "text-left p-3 rounded-lg bg-background/30 border border-border/30",
                    "hover:bg-primary/10 hover:border-primary/50 transition-smooth",
                    "text-sm text-muted-foreground hover:text-foreground"
                  )}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};