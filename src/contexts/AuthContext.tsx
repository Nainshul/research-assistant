import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: any;
  session: any;
  isLoading: boolean;
  isEmailVerified: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithProvider: (providerId: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateEmail: (newEmail: string) => Promise<{ error: Error | null }>;
  resendVerificationEmail: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser = {
  id: 'guest-user',
  email: 'guest@cropdoc.ai',
  user_metadata: {
    full_name: 'Crop-Doc Farmer'
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const signUp = async () => ({ error: null });
  const signIn = async () => ({ error: null });
  const signInWithProvider = async () => ({ error: null });
  const signOut = async () => {};
  const resetPassword = async () => ({ error: null });
  const updatePassword = async () => ({ error: null });
  const updateEmail = async () => ({ error: null });
  const resendVerificationEmail = async () => ({ error: null });

  return (
    <AuthContext.Provider value={{
      user: mockUser,
      session: { user: mockUser },
      isLoading: false,
      isEmailVerified: true,
      signUp,
      signIn,
      signInWithProvider,
      signOut,
      resetPassword,
      updatePassword,
      updateEmail,
      resendVerificationEmail,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // If AuthProvider is removed from App.tsx, but components still use useAuth,
    // we return the mock values directly to prevent crashes.
    return {
      user: mockUser,
      session: { user: mockUser },
      isLoading: false,
      isEmailVerified: true,
      signOut: async () => {},
    };
  }
  return context;
};

