import { Button } from "@/components/ui/button";
import { Brain, Settings, Key, Menu } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenKeyManager: () => void;
}

export const Header = ({ onToggleSidebar, onOpenSettings, onOpenKeyManager }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md shadow-subtle">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-medium">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-xl font-bold text-gradient-primary">
                MakeItHeavy
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Multi-Agent AI Framework</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="elegant" size="sm" onClick={onOpenKeyManager} className="shadow-subtle">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">API Keys</span>
          </Button>
          
          <Button variant="elegant" size="sm" onClick={onOpenSettings} className="shadow-subtle">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Settings</span>
          </Button>
        </div>
      </div>
    </header>
  );
};