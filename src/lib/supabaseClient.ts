import type { Task, Habit, JournalEntry } from '@/types';

// Using mock functions as Supabase has been removed.

// Tasks
export const getTasks = async (): Promise<Task[]> => {
    console.log("Fetching mock tasks");
    return Promise.resolve([]);
};

export const addTask = async (task: Omit<Task, 'id' | 'created_at'>): Promise<Task> => {
     const newTask = { ...task, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    console.log("Adding mock task", newTask);
    return Promise.resolve(newTask);
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    console.log("Updating mock task", id, updates);
    // This is a mock response, so it may not perfectly reflect the update.
    return Promise.resolve({ id, title: 'Updated Task', notes: '', dueDate: '', priority: 'Medium', status: 'Today', isCompleted: false, subtasks: [], ...updates });
};

export const deleteTask = async (id: string): Promise<void> => {
    console.log("Deleting mock task", id);
    return Promise.resolve();
};

// Habits
export const getHabits = async (): Promise<Habit[]> => {
    console.log("Fetching mock habits");
    return Promise.resolve([]);
};

export const addHabit = async (habit: Omit<Habit, 'id' | 'created_at'>): Promise<Habit> => {
    const newHabit = { ...habit, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    console.log("Adding mock habit", newHabit);
    return Promise.resolve(newHabit);
};

export const updateHabit = async (id: string, updates: Partial<Habit>): Promise<Habit> => {
    console.log("Updating mock habit", id, updates);
    // This is a mock response, so it may not perfectly reflect the update.
    return Promise.resolve({ id, name: 'Updated Habit', streak: 0, completions: {}, ...updates });
};

export const deleteHabit = async (id: string): Promise<void> => {
    console.log("Deleting mock habit", id);
    return Promise.resolve();
};

// Journal Entries
export const getJournalEntries = async (): Promise<JournalEntry[]> => {
    console.log("Fetching mock journal entries");
    return Promise.resolve([]);
};

export const addJournalEntry = async (entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    console.log("Adding mock journal entry", newEntry);
    return Promise.resolve(newEntry as JournalEntry);
};
