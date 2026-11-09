'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEMO_USERS } from './mock-data';
import { createClient, isSupabaseConfigured } from './supabase/client';
import { UserProfile, UserRole } from './types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'bantuwarga_auth_user_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile as UserProfile);
              setIsLoading(false);
              return;
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || 'Warga Terdaftar',
                role: (session.user.user_metadata?.role as UserRole) || 'warga',
                created_at: new Date().toISOString(),
              });
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Supabase auth session error', err);
        }
      }

      // Check localStorage for demo/stored user
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            // default to admin demo user for convenience during testing
            setUser(DEMO_USERS[0]);
          }
        } else {
          // Default initial demo user: Admin so all features and dashboard can be explored right away
          setUser(DEMO_USERS[0]);
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const signIn = async (email: string, password?: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured() && password) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const u: UserProfile = profile || {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: (data.user.user_metadata?.role as UserRole) || 'warga',
            created_at: new Date().toISOString(),
          };
          setUser(u);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err?.message || 'Gagal masuk' };
      }
    }

    // Fallback/Demo Auth
    const foundDemo = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const matchedUser: UserProfile = foundDemo || {
      id: 'usr-' + Date.now(),
      email,
      full_name: email.split('@')[0],
      role: email.toLowerCase().includes('admin') ? 'admin' : 'warga',
      created_at: new Date().toISOString(),
    };

    setUser(matchedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedUser));
    setIsLoading(false);
    return { success: true };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'warga',
            },
          },
        });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          const newUser: UserProfile = {
            id: data.user.id,
            email,
            full_name: fullName,
            role: 'warga',
            created_at: new Date().toISOString(),
          };
          setUser(newUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err?.message || 'Gagal mendaftar' };
      }
    }

    // Demo register
    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      email,
      full_name: fullName,
      role: 'warga',
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Signout error', err);
      }
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const switchDemoRole = (role: UserRole) => {
    const target = role === 'admin' ? DEMO_USERS[0] : DEMO_USERS[1];
    setUser(target);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(target));
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'petugas';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        switchDemoRole,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
