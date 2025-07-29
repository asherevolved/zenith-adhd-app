export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate: string;
  priority: 'Urgent' | 'Medium' | 'Low';
  status: 'Today' | 'Upcoming' | 'Someday';
  isCompleted: boolean;
};

export type Habit = {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completions: Record<string, boolean>; // e.g., { '2023-10-27': true }
};

export type JournalEntry = {
  id: string;
  content: string;
  mood: 'Anxious' | 'Guilty' | 'Hopeful' | 'Neutral';
  reframedContent?: string;
  createdAt: string;
};

export type AppSettings = {
  defaultTimerMode: '25/5' | '50/10' | 'Custom';
  geminiVoice: 'Calm' | 'Friendly' | 'Mentor';
  notificationFrequency: 'Normal' | 'High';
  journalRetention: '7' | '30' | 'Forever';
  enableMotion: boolean;
};
