import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { auth, db } from '../lib/supabase';
import { Farmer } from '../types';

interface AuthContextType {
  user: SupabaseUser | null;
  farmer: Farmer | null;
  session: Session | null;
  loading: boolean;
  // Phone authentication
  signInWithPhone: (phone: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  verifyOTP: (phone: string, token: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  // Email/Password authentication
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  resetPassword: (email: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  // Common methods
  signOut: () => Promise<void>;
  updateFarmerProfile: (updates: Partial<Farmer>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const currentSession = await auth.getSession();
        setSession(currentSession);
        
        if (currentSession?.user) {
          setUser(currentSession.user);
          await loadFarmerProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await loadFarmerProfile(currentSession.user.id);
        } else {
          setFarmer(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadFarmerProfile = async (userId: string) => {
    try {
      const result = await db.getFarmer(userId);
      
      if (result.success && result.data) {
        const data = result.data as any;
        setFarmer({
          ...data,
          farmerId: data.id,
          createdAt: data.created_at,
          farmSize: data.farm_size
        } as Farmer);
      }
    } catch (error) {
      console.error('Error loading farmer profile:', error);
    }
  };

  const signInWithPhone = async (phone: string) => {
    try {
      const result = await auth.sendOTP(phone);
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error };
    }
  };

  const verifyOTP = async (phone: string, token: string) => {
    try {
      const result = await auth.verifyOTP(phone, token);
      return result;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      const result = await auth.signUpWithEmail(email, password, { name });
      return result;
    } catch (error) {
      console.error('Error signing up with email:', error);
      return { success: false, error };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await auth.signInWithEmail(email, password);
      return result;
    } catch (error) {
      console.error('Error signing in with email:', error);
      return { success: false, error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await auth.resetPassword(email);
      return result;
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const result = await auth.updatePassword(newPassword);
      return result;
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setFarmer(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateFarmerProfile = async (updates: Partial<Farmer>) => {
    if (!farmer) return;

    try {
      const result = await db.updateFarmer(farmer.id, updates);
      
      if (result.success && result.data) {
        setFarmer(result.data as Farmer);
      }
    } catch (error) {
      console.error('Error updating farmer profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    farmer,
    session,
    loading,
    signInWithPhone,
    verifyOTP,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    updatePassword,
    signOut,
    updateFarmerProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Made with Bob