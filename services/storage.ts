import { User, JournalEntry } from '../types';
import { supabase } from './supabase';

// --- Auth Services ---

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.warn("Error checking session:", error.message);
    return null;
  }
  
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.user_metadata?.full_name || 'User',
    createdAt: new Date(session.user.created_at).getTime(),
  };
};

export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Login failed');
  }

  return {
    id: data.user.id,
    email: data.user.email || '',
    name: data.user.user_metadata?.full_name || 'User',
    createdAt: new Date(data.user.created_at).getTime(),
  };
};

export const signup = async (email: string, password: string, name: string): Promise<User> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Please check your email to confirm your account.');
  }

  return {
    id: data.user.id,
    email: data.user.email || '',
    name: name,
    createdAt: Date.now(),
  };
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

// --- Journal Services ---

export const getEntries = async (userId: string): Promise<JournalEntry[]> => {
  // We use .throwOnError() to ensure App.tsx catches the issue
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*') 
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Supabase Error fetching entries:', error);
    throw new Error(error.message);
  }

  if (!data) return [];

  return data.map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    title: item.title || '',
    content: item.content || '',
    // Handle potential string return for bigints from Supabase
    date: item.date ? Number(item.date) : Date.now(),
    updatedAt: item.updated_at ? Number(item.updated_at) : Date.now(),
    mood: item.mood,
    tags: item.tags || [],
  }));
};

export const saveEntry = async (entry: JournalEntry): Promise<JournalEntry> => {
  const dbEntry = {
    id: entry.id,
    user_id: entry.userId,
    title: entry.title,
    content: entry.content,
    date: entry.date,
    updated_at: Date.now(),
    mood: entry.mood,
    tags: entry.tags,
  };

  const { error } = await supabase
    .from('journal_entries')
    .upsert(dbEntry);

  if (error) {
    console.error('Supabase Error saving entry:', error);
    throw new Error(error.message);
  }

  return { ...entry, updatedAt: dbEntry.updated_at };
};

export const deleteEntry = async (entryId: string): Promise<void> => {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', entryId);

  if (error) {
    console.error('Supabase Error deleting entry:', error);
    throw new Error(error.message);
  }
};