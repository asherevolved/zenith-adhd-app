import { createClient } from '@supabase/supabase-js'
import type { Task, Habit, JournalEntry } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define table-specific CRUD functions here to keep components clean

// Tasks
export const getTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Task[];
};

export const addTask = async (task: Omit<Task, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('tasks').insert([task]).select();
    if (error) throw error;
    return data[0] as Task;
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0] as Task;
};

export const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
};

// Habits
export const getHabits = async () => {
    const { data, error } = await supabase.from('habits').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Habit[];
};

export const addHabit = async (habit: Omit<Habit, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('habits').insert([habit]).select();
    if (error) throw error;
    return data[0] as Habit;
};

export const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const { data, error } = await supabase.from('habits').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0] as Habit;
};

export const deleteHabit = async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) throw error;
};

// Journal Entries
export const getJournalEntries = async () => {
    const { data, error } = await supabase.from('journal_entries').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data as JournalEntry[];
};

export const addJournalEntry = async (entry: Omit<JournalEntry, 'id'>) => {
    const { data, error } = await supabase.from('journal_entries').insert([entry]).select();
    if (error) throw error;
    return data[0] as JournalEntry;
};
