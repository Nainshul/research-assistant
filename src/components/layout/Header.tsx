import { Leaf, Globe } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground leading-tight">Crop-Doc</h1>
            <p className="text-xs text-muted-foreground">AI Plant Doctor</p>
          </div>
        </div>

        {/* Language Toggle - simplified for now */}
        <button 
          className="touch-target flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-accent transition-colors"
          aria-label="Change language"
        >
          <Globe className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};

export default Header;
