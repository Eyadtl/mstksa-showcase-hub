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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single<Profile>();

      if (error) {
        // If profile doesn't exist (PGRST116), create a default user object
        if (error.code === 'PGRST116') {
          return {
            id: authUser.id,
            email: authUser.email || '',
            role: 'user',
          };
        }
        
        // Log other errors but don't throw
        handleError(error, 'fetch user profile', { showToast: false });
        return {
          id: authUser.id,
          email: authUser.email || '',
          role: 'user',
        };
      }

      if (!profile) {
        return {
          id: authUser.id,
          email: authUser.email || '',
          role: 'user',
        };
      }

      return {
        id: profile.id,
        email: profile.email,
        role: profile.role,
      };
    } catch (error) {
      handleError(error, 'fetch user profile', { showToast: false });
      return null;
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
      // Check if profile exists
      const { error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .single();

      // If profile doesn't exist (PGRST116), create it
      if (fetchError && fetchError.code === 'PGRST116') {
        const newProfile: ProfileInsert = {
          email: authUser.email || '',
          role: 'user',
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile as any);

        if (insertError) {
          handleError(insertError, 'create profile for OAuth user', { showToast: false });
        } else {
          console.log('Profile created for OAuth user:', authUser.email);
        }
      }
    } catch (error) {
      handleError(error, 'ensure profile exists', { showToast: false });
    }
  };

  /**
   * Set up Supabase auth state change listener
   * This maintains the session and updates user state when auth state changes
   */
  useEffect(() => {
    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          handleError(error, 'initialize authentication', { showToast: false });
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Ensure profile exists (important for OAuth users)
          await ensureProfileExists(session.user);
          const userProfile = await fetchUserProfile(session.user);
          setUser(userProfile);
        }
      } catch (error) {
        handleError(error, 'initialize authentication', { showToast: false });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        try {
          if (session?.user) {
            // Ensure profile exists for OAuth users
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
              await ensureProfileExists(session.user);
            }
            
            const userProfile = await fetchUserProfile(session.user);
            setUser(userProfile);
          } else {
            setUser(null);
          }
        } catch (error) {
          handleError(error, 'handle auth state change', { showToast: false });
        } finally {
          setLoading(false);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
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
