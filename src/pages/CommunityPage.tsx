import AppLayout from '@/components/layout/AppLayout';
import { MessageCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CommunityPage = () => {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <MessageCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Community Forum</h1>
        <p className="text-muted-foreground mb-6 max-w-xs">
          Connect with other farmers and agricultural experts to discuss crop health
        </p>
        
        <div className="bg-accent/50 rounded-xl p-4 flex items-center gap-3 max-w-xs">
          <Lock className="w-5 h-5 text-accent-foreground flex-shrink-0" />
          <p className="text-sm text-accent-foreground text-left">
            Sign in to join the community and ask experts for help
          </p>
        </div>
        
        <Button className="mt-6 touch-target" size="lg">
          Coming Soon
        </Button>
      </div>
    </AppLayout>
  );
};

export default CommunityPage;
