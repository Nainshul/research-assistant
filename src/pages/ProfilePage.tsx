import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { User, History, Settings, LogIn, LogOut, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useScans } from '@/hooks/useScans';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut, isLoading } = useAuth();
  const { scans } = useScans();

  const handleSignOut = async () => {
    await signOut();
  };

  const healthyCount = scans.filter(s => s.disease_detected.toLowerCase().includes('healthy')).length;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Profile header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-primary" />
          </div>
          {user ? (
            <>
              <h1 className="text-xl font-bold text-foreground mb-1">
                {user.user_metadata?.full_name || 'Farmer'}
              </h1>
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {user.email}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-foreground mb-1">Guest User</h1>
              <p className="text-muted-foreground text-sm">Sign in to save your scan history</p>
            </>
          )}
        </motion.div>

        {/* Quick stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-3xl font-bold text-primary">{scans.length}</p>
            <p className="text-sm text-muted-foreground">Total Scans</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-3xl font-bold text-success">{healthyCount}</p>
            <p className="text-sm text-muted-foreground">Healthy Plants</p>
          </div>
        </motion.div>

        {/* Menu items */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <button 
            onClick={() => navigate('/history')}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-accent transition-colors"
          >
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
        </motion.div>

        {/* Sign in/out button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {user ? (
            <Button 
              variant="outline"
              className="w-full mt-8 touch-target" 
              size="lg"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          ) : (
            <Button 
              className="w-full mt-8 touch-target" 
              size="lg"
              onClick={() => navigate('/auth')}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
