import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using mock mode.');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Auth helpers
export const auth = {
  // Send OTP to phone number
  sendOTP: async (phone: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, error };
    }
  },

  // Verify OTP
  verifyOTP: async (phone: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, error };
    }
  },

  // Get current session
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  // Get current user
  getUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Storage helpers
export const storage = {
  // Upload crop photo
  uploadCropPhoto: async (file: File, farmerId: string) => {
    try {
      const filename = `${farmerId}/${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('crop-photos')
        .upload(filename, file, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      // Get signed URL
      const { data: urlData } = await supabase.storage
        .from('crop-photos')
        .createSignedUrl(filename, 3600); // 1 hour expiry

      return { success: true, url: urlData?.signedUrl, path: data.path };
    } catch (error) {
      console.error('Error uploading photo:', error);
      return { success: false, error };
    }
  },

  // Get signed URL for existing file
  getSignedUrl: async (bucket: string, path: string, expiresIn = 3600) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return { success: true, url: data.signedUrl };
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return { success: false, error };
    }
  },
};

// Database helpers
export const db = {
  // Farmers
  getFarmer: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting farmer:', error);
      return { success: false, error };
    }
  },

  createFarmer: async (farmer: any) => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .insert(farmer)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating farmer:', error);
      return { success: false, error };
    }
  },

  updateFarmer: async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating farmer:', error);
      return { success: false, error };
    }
  },

  // Crops
  getCrops: async (farmerId: string) => {
    try {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting crops:', error);
      return { success: false, error };
    }
  },

  createCrop: async (crop: any) => {
    try {
      const { data, error } = await supabase
        .from('crops')
        .insert(crop)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating crop:', error);
      return { success: false, error };
    }
  },

  // Disease Scans
  createDiseaseScan: async (scan: any) => {
    try {
      const { data, error } = await supabase
        .from('disease_scans')
        .insert(scan)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating disease scan:', error);
      return { success: false, error };
    }
  },

  getDiseaseScans: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('disease_scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting disease scans:', error);
      return { success: false, error };
    }
  },

  // Market Prices
  getMarketPrices: async (crop?: string, state?: string) => {
    try {
      let query = supabase
        .from('market_prices')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (crop) query = query.eq('crop', crop);
      if (state) query = query.eq('state', state);

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting market prices:', error);
      return { success: false, error };
    }
  },

  // Farm Activities
  createActivity: async (activity: any) => {
    try {
      const { data, error } = await supabase
        .from('farm_activities')
        .insert(activity)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating activity:', error);
      return { success: false, error };
    }
  },

  getActivities: async (farmerId: string) => {
    try {
      const { data, error } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('date', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting activities:', error);
      return { success: false, error };
    }
  },
};

// Realtime subscriptions
export const realtime = {
  // Subscribe to price alerts
  subscribeToPriceAlerts: (crops: string[], callback: (payload: any) => void) => {
    const channel = supabase
      .channel('price-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'price_alerts',
          filter: `crop=in.(${crops.join(',')})`,
        },
        callback
      )
      .subscribe();

    return channel;
  },

  // Unsubscribe from channel
  unsubscribe: (channel: any) => {
    supabase.removeChannel(channel);
  },
};

export default supabase;

// Made with Bob
