export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  date: number; // Timestamp
  updatedAt: number;
  mood?: 'happy' | 'neutral' | 'sad' | 'excited' | 'anxious';
  tags?: string[];
}

export interface AIAnalysis {
  summary: string;
  sentiment: string;
  advice: string;
  keywords: string[];
}