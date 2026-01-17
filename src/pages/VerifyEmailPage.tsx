import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, resendVerificationEmail } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Check if user came from email verification link
  useEffect(() => {
    const checkVerification = async () => {
      // If there's a token in the URL, Supabase will handle it automatically
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setIsVerified(true);
        toast({
          title: 'Email verified!',
          description: 'Your email has been verified successfully.',
        });
        setTimeout(() => navigate('/'), 2000);
      }
    };
    
    checkVerification();
  }, [navigate, toast, searchParams]);

  // Redirect if already verified
  useEffect(() => {
    if (user?.email_confirmed_at) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleResendEmail = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    try {
      const { error } = await resendVerificationEmail(user.email);
      if (error) {
        toast({
          title: 'Failed to resend',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Email sent!',
          description: 'Check your inbox for the verification link.',
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background max-w-[430px] mx-auto flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h2>
          <p className="text-muted-foreground">Redirecting you to the app...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <button 
          onClick={() => navigate('/auth')}
          className="touch-target w-10 h-10 flex items-center justify-center rounded-full bg-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Verify Email</h1>
      </div>

      <div className="px-6 py-8 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
          <p className="text-muted-foreground mb-2">
            We sent a verification link to
          </p>
          <p className="font-medium text-foreground mb-6">
            {user?.email || 'your email address'}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Click the link in the email to verify your account and access all features.
          </p>

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full h-12"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="w-full h-12"
            >
              Back to Sign In
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
