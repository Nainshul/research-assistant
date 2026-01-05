import { Home, MessageCircle, User, Camera } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Camera, label: 'Scan', path: '/scan' },
  { icon: MessageCircle, label: 'Community', path: '/community' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-[430px] mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const isScan = item.path === '/scan';

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "touch-target flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all",
                isScan && "relative -mt-6",
                isActive && !isScan && "text-primary",
                !isActive && !isScan && "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              {isScan ? (
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground scale-110" 
                    : "bg-primary/90 text-primary-foreground hover:bg-primary"
                )}>
                  <Icon className="w-7 h-7" />
                </div>
              ) : (
                <Icon className="w-6 h-6" />
              )}
              <span className={cn(
                "text-xs font-medium",
                isScan && "mt-1"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  );
};

export default BottomNav;
