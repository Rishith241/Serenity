import { MoodEntry, GratitudeEntry, ChatMessage, MoodConfig, MoodType, BreathingConfig } from '../types';

export const MOOD_CONFIGS: Record<MoodType, MoodConfig> = {
  peaceful: {
    label: 'Peaceful',
    color: '#2dd4bf', // teal-400
    accentBg: 'rgba(45, 212, 191, 0.12)',
    borderColor: 'rgba(45, 212, 191, 0.3)',
    iconName: 'Sparkles',
    score: 5,
  },
  content: {
    label: 'Content',
    color: '#34d399', // emerald-400
    accentBg: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
    iconName: 'Smile',
    score: 4,
  },
  energized: {
    label: 'Energized',
    color: '#f59e0b', // amber-500
    accentBg: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    iconName: 'Zap',
    score: 4,
  },
  neutral: {
    label: 'Neutral',
    color: '#94a3b8', // slate-400
    accentBg: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.25)',
    iconName: 'Meh',
    score: 3,
  },
  anxious: {
    label: 'Anxious',
    color: '#818cf8', // indigo-400
    accentBg: 'rgba(129, 140, 248, 0.12)',
    borderColor: 'rgba(129, 140, 248, 0.3)',
    iconName: 'CloudRain',
    score: 2,
  },
  stressed: {
    label: 'Stressed',
    color: '#fb7185', // rose-400
    accentBg: 'rgba(251, 113, 133, 0.12)',
    borderColor: 'rgba(251, 113, 133, 0.3)',
    iconName: 'Flame',
    score: 2,
  },
  down: {
    label: 'Low / Weary',
    color: '#60a5fa', // blue-400
    accentBg: 'rgba(96, 165, 250, 0.12)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    iconName: 'Moon',
    score: 1,
  },
};

export const COMMON_EMOTION_TAGS = [
  'Grateful',
  'Calm',
  'Focused',
  'Overwhelmed',
  'Tired',
  'Hopeful',
  'Reflective',
  'Productive',
  'Lonely',
  'Restless',
  'Supported',
  'Unwind',
];

export const BREATHING_CONFIGS: Record<string, BreathingConfig> = {
  box: {
    id: 'box',
    name: 'Box Breathing',
    subtitle: 'Focus & Reset (4-4-4-4)',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    purpose: 'Standard tactical reset to lower cortisol and sharpen clarity.',
  },
  relax: {
    id: 'relax',
    name: '4-7-8 Relaxing',
    subtitle: 'Deep Calm & Sleep',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    purpose: 'Stimulates the vagus nerve to slow heart rate and induce tranquility.',
  },
  calm: {
    id: 'calm',
    name: 'Calm Flow',
    subtitle: 'Gentle Pacing (4-6)',
    inhale: 4,
    hold1: 0,
    exhale: 6,
    hold2: 0,
    purpose: 'Smooth parasympathetic activation without breath holding.',
  },
};

export const GRATITUDE_PROMPTS = [
  'A small everyday comfort you appreciated today...',
  'Someone who offered a kind word or supportive presence...',
  'Something in nature, sound, or weather that brought you peace...',
  'A personal challenge that taught you something valuable...',
  'A sensory moment you paused to enjoy (a warm tea, soft blanket, sunlight)...',
  'A quiet win or step forward you took this week...',
];

const STORAGE_KEYS = {
  MOODS: 'mht_mood_logs_v1',
  GRATITUDE: 'mht_gratitude_v1',
  CHAT: 'mht_chat_history_v1',
};

function getInitialMoodLogs(): MoodEntry[] {
  const now = new Date();
  const logs: MoodEntry[] = [];
  const sampleMoods: Array<{ daysAgo: number; mood: MoodType; score: number; energy: number; tags: string[]; note: string }> = [
    { daysAgo: 0, mood: 'peaceful', score: 5, energy: 4, tags: ['Calm', 'Reflective'], note: 'Had a quiet morning walk and made fresh herbal tea.' },
    { daysAgo: 1, mood: 'content', score: 4, energy: 4, tags: ['Productive', 'Focused'], note: 'Focused study session at the library without distractions.' },
    { daysAgo: 2, mood: 'anxious', score: 2, energy: 3, tags: ['Overwhelmed', 'Restless'], note: 'Felt deadline pressure in the afternoon, did breathing exercises.' },
    { daysAgo: 3, mood: 'content', score: 4, energy: 3, tags: ['Grateful', 'Supported'], note: 'Shared lunch with a good friend who listened closely.' },
    { daysAgo: 4, mood: 'peaceful', score: 5, energy: 5, tags: ['Calm', 'Hopeful'], note: 'Early evening meditation with gentle rain outside.' },
    { daysAgo: 5, mood: 'neutral', score: 3, energy: 3, tags: ['Tired', 'Unwind'], note: 'Ordinary busy day, rested with a favorite book.' },
    { daysAgo: 6, mood: 'content', score: 4, energy: 4, tags: ['Productive', 'Grateful'], note: 'Finished the weekly chores and felt a sense of relief.' },
  ];

  sampleMoods.forEach(({ daysAgo, mood, score, energy, tags, note }) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    logs.push({
      id: 'mood-' + d.getTime() + '-' + daysAgo,
      timestamp: d.toISOString(),
      date: d.toISOString().split('T')[0],
      mood,
      moodScore: score,
      energyLevel: energy,
      sleepQuality: 4,
      tags,
      note,
    });
  });

  return logs;
}

function getInitialGratitude(): GratitudeEntry[] {
  const now = new Date();
  return [
    {
      id: 'grat-1',
      timestamp: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      date: now.toISOString().split('T')[0],
      text: 'The warm coffee this morning in my favorite ceramic mug while looking at the sunrise.',
      category: 'Everyday',
    },
    {
      id: 'grat-2',
      timestamp: new Date(now.getTime() - 26 * 3600 * 1000).toISOString(),
      date: new Date(now.getTime() - 26 * 3600 * 1000).toISOString().split('T')[0],
      text: 'A kind message from a friend checking in when I was feeling low.',
      category: 'People',
    },
    {
      id: 'grat-3',
      timestamp: new Date(now.getTime() - 50 * 3600 * 1000).toISOString(),
      date: new Date(now.getTime() - 50 * 3600 * 1000).toISOString().split('T')[0],
      text: 'Completing a challenging project milestone and taking a full evening to rest guilt-free.',
      category: 'Growth',
    },
    {
      id: 'grat-4',
      timestamp: new Date(now.getTime() - 74 * 3600 * 1000).toISOString(),
      date: new Date(now.getTime() - 74 * 3600 * 1000).toISOString().split('T')[0],
      text: 'The cool crisp evening air on my terrace after sunset.',
      category: 'Nature',
    },
  ];
}

function getInitialChatMessages(): ChatMessage[] {
  return [
    {
      id: 'chat-welcome',
      role: 'model',
      content: "Hello. I am Haven, your dedicated space for calm reflection and gentle support. Whether you want to unload heavy thoughts, reflect on what you're grateful for, or just catch your breath, I am here with you.",
      timestamp: new Date().toISOString(),
    },
  ];
}

export const Storage = {
  getMoods(): MoodEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOODS);
      if (data) return JSON.parse(data);
      const initial = getInitialMoodLogs();
      localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(initial));
      return initial;
    } catch {
      return getInitialMoodLogs();
    }
  },

  saveMood(entry: Omit<MoodEntry, 'id' | 'timestamp'>): MoodEntry {
    const moods = Storage.getMoods();
    const newEntry: MoodEntry = {
      ...entry,
      id: 'mood-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...moods.filter((m) => m.date !== newEntry.date)];
    try {
      localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
    return newEntry;
  },

  deleteMood(id: string): MoodEntry[] {
    const moods = Storage.getMoods().filter((m) => m.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(moods));
    } catch {
      // Storage fallback
    }
    return moods;
  },

  getGratitude(): GratitudeEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GRATITUDE);
      if (data) return JSON.parse(data);
      const initial = getInitialGratitude();
      localStorage.setItem(STORAGE_KEYS.GRATITUDE, JSON.stringify(initial));
      return initial;
    } catch {
      return getInitialGratitude();
    }
  },

  saveGratitude(text: string, category: GratitudeEntry['category']): GratitudeEntry {
    const list = Storage.getGratitude();
    const newEntry: GratitudeEntry = {
      id: 'grat-' + Date.now(),
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      text: text.trim(),
      category,
    };
    const updated = [newEntry, ...list];
    try {
      localStorage.setItem(STORAGE_KEYS.GRATITUDE, JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
    return newEntry;
  },

  deleteGratitude(id: string): GratitudeEntry[] {
    const list = Storage.getGratitude().filter((g) => g.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.GRATITUDE, JSON.stringify(list));
    } catch {
      // Storage fallback
    }
    return list;
  },

  getChatHistory(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT);
      if (data) return JSON.parse(data);
      const initial = getInitialChatMessages();
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(initial));
      return initial;
    } catch {
      return getInitialChatMessages();
    }
  },

  saveChatHistory(messages: ChatMessage[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(messages));
    } catch {
      // Storage fallback
    }
  },

  clearChatHistory(): ChatMessage[] {
    const initial = getInitialChatMessages();
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(initial));
    } catch {
      // Storage fallback
    }
    return initial;
  },
};
