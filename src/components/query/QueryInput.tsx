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
    <div className={cn("space-y-6", className)}>
      <Card className={cn(
        "surface-elevated border-0 transition-smooth",
        isFocused && "shadow-premium border-primary/20"
      )}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-medium">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Query Input</h3>
              <p className="text-sm text-muted-foreground">Enter your query for comprehensive multi-agent analysis</p>
            </div>
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
                  "min-h-[140px] resize-none bg-background border-border/50 transition-smooth text-base leading-relaxed",
                  "focus:border-primary focus:shadow-glow focus:ring-1 focus:ring-primary/20",
                  "custom-scrollbar"
                )}
                disabled={isLoading}
              />
              
              {value && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClear}
                  className="absolute top-3 right-3 opacity-60 hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span>💡 Tip: Press</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border/50">
                  Ctrl+Enter
                </kbd>
                <span>to submit</span>
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={!value.trim() || isLoading}
                variant="premium"
                size="lg"
                className="shadow-large"
              >
                <Send className="h-4 w-4" />
                {isLoading ? "Processing..." : "Analyze Query"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Example Queries */}
      {!value && (
        <Card className="surface-interactive border-0">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <FileText className="h-4 w-4 text-accent" />
              </div>
              <h4 className="font-medium">Example Queries</h4>
            </div>
            
            <div className="grid gap-3">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className={cn(
                    "text-left p-4 rounded-lg bg-background border border-border/30 transition-smooth",
                    "hover:bg-primary/5 hover:border-primary/30 hover-lift-gentle",
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