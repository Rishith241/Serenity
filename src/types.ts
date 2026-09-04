export type MoodType = 'peaceful' | 'content' | 'neutral' | 'anxious' | 'down' | 'stressed' | 'energized';

export interface MoodConfig {
  label: string;
  color: string;
  accentBg: string;
  borderColor: string;
  iconName: string;
  score: number;
}

export interface MoodEntry {
  id: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  mood: MoodType;
  moodScore: number; // 1 to 5
  energyLevel: number; // 1 to 5
  sleepQuality?: number; // 1 to 5
  tags: string[];
  note?: string;
}

export interface GratitudeEntry {
  id: string;
  timestamp: string;
  date: string;
  text: string;
  category: 'Everyday' | 'People' | 'Moments' | 'Growth' | 'Nature';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export type BreathingTechnique = 'box' | 'calm' | 'relax';

export interface BreathingConfig {
  id: BreathingTechnique;
  name: string;
  subtitle: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  purpose: string;
}
