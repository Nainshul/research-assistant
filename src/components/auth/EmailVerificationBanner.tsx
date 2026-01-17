import { useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const EmailVerificationBanner = () => {
  const { user, isEmailVerified } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // Only show if user is logged in but email not verified
  if (!user || isEmailVerified || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-warning/10 border-b border-warning"
      >
        <div className="flex items-center justify-between gap-2 p-3 max-w-[430px] mx-auto">
          <div className="flex items-center gap-2 flex-1">
            <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
            <p className="text-sm text-foreground">
              Please verify your email to access all features.
              <button
                onClick={() => navigate('/verify-email')}
                className="text-primary font-medium ml-1 hover:underline"
              >
                Verify now
              </button>
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailVerificationBanner;
