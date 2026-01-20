import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  updateEmail as firebaseUpdateEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  unlink,
  AuthProvider as FirebaseAuthProvider,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isEmailVerified: boolean;
  linkedProviders: string[];
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithProvider: (providerId: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateEmail: (newEmail: string) => Promise<{ error: Error | null }>;
  resendVerificationEmail: () => Promise<{ error: Error | null }>;
  linkProvider: (providerId: string) => Promise<{ error: Error | null }>;
  unlinkProvider: (providerId: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isEmailVerified = user?.emailVerified ?? false;

  // Get linked identity providers
  const linkedProviders = user?.providerData?.map(userInfo => userInfo.providerId) || [];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Ideally update profile with fullName here if needed, but Firebase simple auth flow doesn't require it immediately
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithProvider = async (providerId: string) => {
    try {
      let provider: FirebaseAuthProvider;
      if (providerId === 'google') {
        provider = new GoogleAuthProvider();
      } else {
        throw new Error(`Provider ${providerId} not implemented`);
      }
      await signInWithPopup(auth, provider);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) return { error: new Error('No user') };
    try {
      await firebaseUpdatePassword(user, newPassword);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateEmail = async (newEmail: string) => {
    if (!user) return { error: new Error('No user') };
    try {
      await firebaseUpdateEmail(user, newEmail);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resendVerificationEmail = async () => {
    if (!user) return { error: new Error('No user') };
    try {
      await sendEmailVerification(user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const linkProvider = async (providerId: string) => {
    if (!user) return { error: new Error('No user') };
    try {
      let provider: FirebaseAuthProvider;
      if (providerId === 'google') {
        provider = new GoogleAuthProvider();
      } else {
        throw new Error(`Provider ${providerId} not implemented`);
      }
      await linkWithPopup(user, provider);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const unlinkProvider = async (providerId: string) => {
    if (!user) return { error: new Error('No user') };
    try {
      await unlink(user, providerId);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isEmailVerified,
      linkedProviders,
      signUp,
      signIn,
      signInWithProvider,
      signOut,
      resetPassword,
      updatePassword,
      updateEmail,
      resendVerificationEmail,
      linkProvider,
      unlinkProvider,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
