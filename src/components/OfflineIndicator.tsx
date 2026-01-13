import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, CloudOff, RefreshCw, Check } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const OfflineIndicator = () => {
  const { isOnline, pendingCount, isSyncing, syncPendingScans } = useOfflineSync();

  const handleManualSync = async () => {
    const result = await syncPendingScans();
    if (result.synced > 0) {
      toast.success(`Synced ${result.synced} scan(s) to cloud`);
    }
    if (result.failed > 0) {
      toast.error(`Failed to sync ${result.failed} scan(s)`);
    }
  };

  return (
    <>
      {/* Offline banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-warning text-warning-foreground px-4 py-2"
          >
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <WifiOff className="w-4 h-4" />
              <span>You're offline - Scans will be saved locally</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending scans indicator */}
      <AnimatePresence>
        {pendingCount > 0 && isOnline && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-20 left-4 right-4 z-40 bg-card border border-border rounded-lg shadow-lg p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CloudOff className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {pendingCount} scan{pendingCount > 1 ? 's' : ''} pending sync
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Saved while offline
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="gap-2"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Syncing
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online status indicator (subtle) */}
      <AnimatePresence>
        {isOnline && pendingCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-20 right-4 z-40"
          >
            <div className="flex items-center gap-1.5 bg-success/20 text-success px-2 py-1 rounded-full text-xs font-medium">
              <Wifi className="w-3 h-3" />
              Online
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OfflineIndicator;
