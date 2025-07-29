export type Subtask = {
  id: string;
  title: string;
  isCompleted: boolean;
};

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate: string;
  priority: 'Urgent' | 'Medium' | 'Low';
  status: 'Today' | 'Upcoming' | 'Someday';
  isCompleted: boolean;
  subtasks: Subtask[];
  reminder?: number; // minutes
  created_at?: string;
};

export type Habit = {
  id: string;
  name: string;
  streak: number;
  completions: Record<string, boolean>; // e.g., { '2024-10-27': true }
  created_at?: string;
};

export type JournalEntry = {
  id: string;
  content: string;
  createdAt: string;
};

export type AppSettings = {
  defaultTimerMode: '25/5' | '50/10' | 'Custom';
  geminiVoice: 'Calm' | 'Friendly' | 'Mentor';
  notificationFrequency: 'Normal' | 'High';
  journalRetention: '7' | '30' | 'Forever';
  enableMotion: boolean;
};
