import AppLayout from '@/components/layout/AppLayout';
import { User, History, Settings, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfilePage = () => {
  return (
    <AppLayout>
      <div className="p-6">
        {/* Profile header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">Guest User</h1>
          <p className="text-muted-foreground text-sm">Sign in to save your scan history</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Total Scans</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-3xl font-bold text-success">0</p>
            <p className="text-sm text-muted-foreground">Healthy Plants</p>
          </div>
        </div>

        {/* Menu items */}
        <div className="space-y-3">
          <button className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-accent transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Scan History</p>
              <p className="text-sm text-muted-foreground">View your past diagnoses</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-accent transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Settings</p>
              <p className="text-sm text-muted-foreground">Language, notifications</p>
            </div>
          </button>
        </div>

        {/* Sign in button */}
        <Button className="w-full mt-8 touch-target" size="lg">
          <LogIn className="w-5 h-5 mr-2" />
          Sign In
        </Button>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
