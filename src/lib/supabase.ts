import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Custom auth functions for users table
export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
}

export const signOut = async () => {
  return supabase.auth.signOut();
}

export const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
}