import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { User, Settings, Mail, Bell, Shield, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const navigate = useNavigate();

  const farmerInfo = {
    name: 'Crop-Doc Farmer',
    email: 'guest@cropdoc.ai'
  };

  return (
    <AppLayout>
      <div className="p-4 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Account</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Info */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center p-6 bg-card rounded-3xl border border-border shadow-sm relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-4 border-background shadow-xl">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              {farmerInfo.name}
            </h2>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {farmerInfo.email}
            </p>
          </motion.div>

          {/* Menu items */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <button 
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:bg-accent/50 transition-all shadow-sm active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-foreground text-sm">Settings</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Preferences</p>
              </div>
            </button>

            <button 
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:bg-accent/50 transition-all shadow-sm active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-foreground text-sm">Notifications</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Updates & Alerts</p>
              </div>
            </button>

            <button 
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:bg-accent/50 transition-all shadow-sm active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-foreground text-sm">Privacy</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Data & Security</p>
              </div>
            </button>

            <button 
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:bg-accent/50 transition-all shadow-sm active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-foreground text-sm">About App</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Version 1.0.0</p>
              </div>
            </button>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;

