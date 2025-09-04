import { useTheme } from '@/components/ui/theme-provider';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import ThreeJSAnimation from './ThreeJSAnimation';

export default function Header() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header animate-slide-in-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4 group">
            <div>
              <ThreeJSAnimation type="logo" />
            </div>
            <div className="transition-all duration-300 group-hover:transform group-hover:scale-105">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                UnifyDesk
              </h1>
              <p className="text-xs text-muted-foreground font-medium tracking-wide">
                Your Unified Workspace
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="relative modern-button h-10 w-10 rounded-full border-2 border-yellow-200 dark:border-yellow-600 hover:border-yellow-400 dark:hover:border-yellow-400 transition-all duration-300 hover:scale-110 hover:shadow-lg bg-white/50 dark:bg-gray-800/50"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-yellow-600" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-yellow-400" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
