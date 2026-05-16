import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Farmer } from '../types';

interface AuthState {
  user: SupabaseUser | null;
  farmer: Farmer | null;
  isAuthenticated: boolean;
  isOnboarding: boolean;
  setUser: (user: SupabaseUser | null) => void;
  setFarmer: (farmer: Farmer | null) => void;
  setOnboarding: (isOnboarding: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      farmer: null,
      isAuthenticated: false,
      isOnboarding: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      setFarmer: (farmer) => set({ farmer }),
      
      setOnboarding: (isOnboarding) => set({ isOnboarding }),
      
      clearAuth: () => set({ 
        user: null, 
        farmer: null, 
        isAuthenticated: false,
        isOnboarding: false 
      }),
    }),
    {
      name: 'farmflow-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isOnboarding: state.isOnboarding,
      }),
    }
  )
);

// Made with Bob