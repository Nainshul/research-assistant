import { ThemeToggle } from '@/components/ThemeToggle';
import { Leaf, Globe } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground leading-tight tracking-tight">Crop-Doc</h1>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">AI Plant Doctor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Language Toggle - simplified for now */}
          <button 
            className="touch-target flex items-center justify-center w-9 h-9 rounded-full bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground transition-all duration-200"
            aria-label="Change language"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
