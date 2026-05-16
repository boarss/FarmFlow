import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { auth } from '../lib/supabase';
import { Farmer } from '../types';

interface AuthContextType {
  user: SupabaseUser | null;
  farmer: Farmer | null;
  session: Session | null;
  loading: boolean;
  signInWithPhone: (phone: string) => Promise<{ success: boolean; error?: any }>;
  verifyOTP: (phone: string, token: string) => Promise<{ success: boolean; error?: any }>;
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
      const { db } = await import('../lib/supabase');
      const result = await db.getFarmer(userId);
      
      if (result.success && result.data) {
        setFarmer(result.data as Farmer);
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
      const { db } = await import('../lib/supabase');
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
    signOut,
    updateFarmerProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Made with Bob