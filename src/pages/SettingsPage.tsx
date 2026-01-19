import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { ArrowLeft, Save, Loader2, Globe, Mail, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ProfileData {
  full_name: string;
  phone: string;
  location_district: string;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isEmailVerified, updateEmail, updatePassword } = useAuth();
  const { language, setLanguage, t, languages } = useLanguage();
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    phone: '',
    location_district: '',
  });
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchProfile();
      setNewEmail(user.email || '');
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, location_district')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          location_district: data.location_district || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(t('failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name || null,
          phone: profile.phone || null,
          location_district: profile.location_district || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(t('profileUpdated'));
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('failedToUpdate'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || newEmail === user?.email) return;

    setIsChangingEmail(true);
    try {
      const { error } = await updateEmail(newEmail);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verification email sent to your new address. Please confirm both emails to complete the change.');
      }
    } catch (error) {
      toast.error('Failed to update email');
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  // Check if user signed in with OAuth
  const isOAuthUser = user?.app_metadata?.provider && user.app_metadata.provider !== 'email';

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('settings')}</h1>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Email Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <Label className="text-base font-semibold">Email Address</Label>
            </div>
            
            {/* Current email status */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Current:</span>
              <span className="text-sm font-medium">{user?.email}</span>
              {isEmailVerified ? (
                <span className="flex items-center gap-1 text-xs text-success ml-auto">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-warning ml-auto">
                  <AlertCircle className="w-3 h-3" />
                  Unverified
                </span>
              )}
            </div>

            {/* Email change form */}
            {isOAuthUser ? (
              <p className="text-sm text-muted-foreground">
                Email is managed by your {user?.app_metadata?.provider} account and cannot be changed here.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="new_email">New Email Address</Label>
                  <Input
                    id="new_email"
                    type="email"
                    placeholder="Enter new email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailChange}
                  disabled={isChangingEmail || newEmail === user?.email || !newEmail}
                >
                  {isChangingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending verification...
                    </>
                  ) : (
                    'Change Email'
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  You'll need to verify both your old and new email addresses to complete the change.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Password Section */}
          {!isOAuthUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <Label className="text-base font-semibold">Change Password</Label>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || !newPassword || !confirmPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long.
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Language Selector */}
          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t('language')}
            </Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.nativeName}</span>
                      <span className="text-muted-foreground text-sm">({lang.name})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{t('selectLanguage')}</p>
          </div>

          <Separator />

          {/* Profile fields */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t('fullName')}</Label>
              <Input
                id="full_name"
                placeholder={t('enterFullName')}
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('phoneNumber')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('enterPhone')}
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_district">{t('locationDistrict')}</Label>
              <Input
                id="location_district"
                placeholder={t('enterLocation')}
                value={profile.location_district}
                onChange={(e) => setProfile({ ...profile, location_district: e.target.value })}
              />
            </div>
          </div>

          <Button 
            className="w-full touch-target" 
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {t('save')}
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
