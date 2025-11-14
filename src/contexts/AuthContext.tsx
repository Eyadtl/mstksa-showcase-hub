import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, ProfileInsert } from '@/types/database';
import { handleError, withErrorHandling } from '@/lib/error-handling';

/**
 * User type combining Supabase auth user with profile data
 */
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

/**
 * Authentication context type definition
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Create the authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * Manages user authentication state and provides authentication methods
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch user profile data including role from the profiles table
   */
  const fetchUserProfile = async (authUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('Fetching profile for user:', authUser.email);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single<Profile>();
      
      const { data: profile, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist (PGRST116), return default user
        if (error.code === 'PGRST116') {
          console.log('Profile not found, returning default user');
          return {
            id: authUser.id,
            email: authUser.email || '',
            role: 'user',
          };
        }
        
        // For other errors, return default user
        console.log('Profile fetch error, returning default user');
        return {
          id: authUser.id,
          email: authUser.email || '',
          role: 'user',
        };
      }

      if (!profile) {
        console.log('No profile data, returning default user');
        return {
          id: authUser.id,
          email: authUser.email || '',
          role: 'user',
        };
      }

      console.log('Profile loaded successfully:', profile.email, profile.role);
      return {
        id: profile.id,
        email: profile.email,
        role: profile.role,
      };
    } catch (error) {
      console.error('Exception in fetchUserProfile:', error);
      // Return default user on any exception
      return {
        id: authUser.id,
        email: authUser.email || '',
        role: 'user',
      };
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = withErrorHandling(
    async (email: string, password: string): Promise<void> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Provide specific error messages for common auth errors
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before signing in.');
        }
        throw new Error(error.message || 'Failed to sign in. Please try again.');
      }

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user);
        setUser(userProfile);
      }
    },
    'sign in',
    { showToast: false } // Let the UI component handle the toast
  );

  /**
   * Sign up with email and password
   */
  const signUp = withErrorHandling(
    async (email: string, password: string): Promise<void> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // Provide specific error messages for common signup errors
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        if (error.message.includes('Password should be')) {
          throw new Error('Password must be at least 8 characters long.');
        }
        if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        }
        throw new Error(error.message || 'Failed to create account. Please try again.');
      }

      if (data.user) {
        // Create profile entry for the new user
        try {
          const newProfile: ProfileInsert = {
            email: data.user.email || email,
            role: 'user',
          };

          const { error: profileError } = await supabase
            .from('profiles')
            .insert(newProfile as any);

          if (profileError) {
            // Log but don't throw - profile will be created on first sign in
            handleError(profileError, 'create user profile', { showToast: false });
          }
        } catch (profileError) {
          // Log but don't throw - profile will be created on first sign in
          handleError(profileError, 'create user profile', { showToast: false });
        }

        const userProfile = await fetchUserProfile(data.user);
        setUser(userProfile);
      }
    },
    'sign up',
    { showToast: false } // Let the UI component handle the toast
  );

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = withErrorHandling(
    async (): Promise<void> => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        // Handle specific OAuth errors with clear guidance
        if (error.message.includes('popup_closed_by_user') || error.message.includes('popup closed')) {
          throw new Error('Sign in was cancelled. Please try again and complete the Google sign-in process.');
        }
        if (error.message.includes('access_denied')) {
          throw new Error('Access was denied. Please grant the required permissions to sign in with Google.');
        }
        if (error.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        throw new Error(error.message || 'Failed to sign in with Google. Please try again.');
      }

      // Note: The actual user state will be set by the auth state change listener
      // after the OAuth redirect completes
      console.log('OAuth redirect initiated:', data);
    },
    'sign in with Google',
    { showToast: false } // Let the UI component handle the toast
  );

  /**
   * Sign out the current user
   */
  const signOut = withErrorHandling(
    async (): Promise<void> => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message || 'Failed to sign out. Please try again.');
      }

      setUser(null);
    },
    'sign out',
    { showToast: false } // Let the UI component handle the toast
  );

  /**
   * Create profile for OAuth users if it doesn't exist
   */
  const ensureProfileExists = async (authUser: SupabaseUser): Promise<void> => {
    try {
      console.log('Checking if profile exists for:', authUser.email);
      
      // Check if profile exists
      const { error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .single();

      if (fetchError) {
        console.log('Profile check error:', fetchError.code, fetchError.message);
        
        // If profile doesn't exist (PGRST116), create it
        if (fetchError.code === 'PGRST116') {
          console.log('Profile does not exist, creating...');
          const newProfile: ProfileInsert = {
            email: authUser.email || '',
            role: 'user',
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile as any);

          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            console.log('Profile created successfully for:', authUser.email);
          }
        }
      } else {
        console.log('Profile already exists for:', authUser.email);
      }
    } catch (error) {
      console.error('Exception in ensureProfileExists:', error);
    }
  };

  /**
   * Set up Supabase auth state change listener
   * This maintains the session and updates user state when auth state changes
   */
  useEffect(() => {
    let mounted = true;

    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user && mounted) {
          console.log('Session found for user:', session.user.email);
          // Skip ensureProfileExists - profiles are created by database trigger
          const userProfile = await fetchUserProfile(session.user);
          console.log('User profile loaded:', userProfile);
          setUser(userProfile);
        } else {
          console.log('No session found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          console.log('Auth initialization complete');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        if (!mounted) {
          console.log('Component unmounted, skipping auth state change');
          return;
        }

        try {
          if (session?.user) {
            console.log('Processing auth state change for user:', session.user.email);
            
            // Skip ensureProfileExists - it's causing hangs
            // Profiles are created by database trigger on signup
            
            console.log('Fetching user profile...');
            const userProfile = await fetchUserProfile(session.user);
            console.log('Setting user state:', userProfile);
            setUser(userProfile);
          } else {
            console.log('No session, clearing user');
            setUser(null);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
        } finally {
          console.log('Setting loading to false');
          setLoading(false);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the authentication context
 * Throws an error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
