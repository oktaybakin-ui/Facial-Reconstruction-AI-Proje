import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string;
  tc_kimlik_no: string;
  specialty: string;
  institution_name: string;
  institution_email: string;
  phone: string;
  role: string;
  is_verified: boolean;
  institution_id_card_url?: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function isUserVerified(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.is_verified ?? false;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

