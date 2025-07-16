import { Button } from "@/components/ui/button";
import { Brain, Settings, Key, Menu } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenKeyManager: () => void;
}

export const Header = ({ onToggleSidebar, onOpenSettings, onOpenKeyManager }: HeaderProps) => {
  return (
    <header className="glass-panel border-b border-border/50 h-16 flex items-center justify-between px-6 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary neon-glow" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                MakeItHeavy
              </h1>
              <p className="text-xs text-muted-foreground">Multi-Agent AI Framework</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="glass" size="sm" onClick={onOpenKeyManager}>
          <Key className="h-4 w-4" />
          <span className="hidden sm:inline">API Keys</span>
        </Button>
        
        <Button variant="glass" size="sm" onClick={onOpenSettings}>
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </div>
    </header>
  );
};