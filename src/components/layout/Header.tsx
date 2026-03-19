import { ThemeToggle } from '@/components/ThemeToggle';
import { Leaf } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 border border-border/50">
            <img 
              src="/logo.png" 
              alt="Crop-Doc Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground leading-tight tracking-tight">Crop-Doc</h1>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">AI Plant Doctor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
