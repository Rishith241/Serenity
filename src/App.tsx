import { useState, useEffect } from 'react';
import { Sparkles, Wind } from 'lucide-react';
import { MoodEntry, GratitudeEntry, ChatMessage, MoodType } from './types';
import { Storage, MOOD_CONFIGS } from './utils/storage';
import { WeeklyRhythmCard } from './components/WeeklyRhythmCard';
import { GratitudeSection } from './components/GratitudeSection';
import { BreathingExercise } from './components/BreathingExercise';
import { CompanionChat } from './components/CompanionChat';
import { MoodLoggerModal } from './components/MoodLoggerModal';
import { playChime } from './utils/audio';

export default function App() {
  // State for logs, gratitude entries, chat history
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Modals & Navigation
  const [isMoodModalOpen, setIsMoodModalOpen] = useState<boolean>(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'all' | 'chat' | 'rhythm' | 'gratitude' | 'breathe'>('all');

  // Load initial data on mount
  useEffect(() => {
    setMoods(Storage.getMoods());
    setGratitudeEntries(Storage.getGratitude());
    setMessages(Storage.getChatHistory());
  }, []);

  // Today's mood helper
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMood = moods.find((m) => m.date === todayStr) || moods[0];
  const todayConfig = todayMood ? MOOD_CONFIGS[todayMood.mood] : MOOD_CONFIGS.peaceful;

  // Handlers for Mood
  const handleSaveMood = (data: {
    mood: MoodType;
    moodScore: number;
    energyLevel: number;
    sleepQuality: number;
    tags: string[];
    note: string;
  }) => {
    Storage.saveMood({
      date: todayStr,
      ...data,
    });
    setMoods(Storage.getMoods());

    // Send a gentle system context to the chat
    const companionPrompt = `I just logged my feeling today as "${data.mood}" with tags: ${data.tags.join(', ')}.${data.note ? ` Note: "${data.note}"` : ''}`;
    handleSendMessage(companionPrompt);
  };

  // Handlers for Gratitude
  const handleAddGratitude = (text: string, category: GratitudeEntry['category']) => {
    const newEntry = Storage.saveGratitude(text, category);
    setGratitudeEntries(Storage.getGratitude());

    // Update chat context gently
    if (messages.length > 0) {
      const companionPrompt = `I just added something I'm grateful for: "${newEntry.text}"`;
      handleSendMessage(companionPrompt);
    }
  };

  const handleDeleteGratitude = (id: string) => {
    const updated = Storage.deleteGratitude(id);
    setGratitudeEntries(updated);
  };

  // Chat message sending with server-side proxy to Gemini 3.8 Flash
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    Storage.saveChatHistory(updatedMessages);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            recentMood: todayMood?.mood,
            gratitudeCount: gratitudeEntries.length,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: 'msg-' + Date.now() + '-model',
        role: 'model',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, modelMsg];
      setMessages(finalMessages);
      Storage.saveChatHistory(finalMessages);
      playChime('complete');
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: 'msg-' + Date.now() + '-fallback',
        role: 'model',
        content:
          "I'm here with you. Take a slow, quiet breath. You are doing the best you can in this moment, and that is more than enough.",
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...updatedMessages, fallbackMsg];
      setMessages(finalMessages);
      Storage.saveChatHistory(finalMessages);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearChat = () => {
    const cleared = Storage.clearChatHistory();
    setMessages(cleared);
  };

  return (
    <div
      id="app-root-container"
      className="min-h-screen w-full bg-[#05070A] text-slate-300 font-sans flex flex-col overflow-x-hidden relative selection:bg-teal-500/30 selection:text-teal-200"
    >
      {/* Immersive UI Ambient Background Blurs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-900/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-900/15 rounded-full blur-[160px]" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[130px]" />
      </div>

      {/* Top Application Header */}
      <header
        id="app-main-header"
        className="z-10 flex flex-wrap justify-between items-center px-6 md:px-10 pt-6 pb-4 border-b border-white/[0.04] bg-black/20 backdrop-blur-sm"
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-light tracking-widest text-slate-100 uppercase">
              Serenity
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-0.5">
              Mental Health & Reflection Companion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 mt-3 sm:mt-0">
          {/* Current Mood Display Pill */}
          <button
            id="header-current-mood-btn"
            onClick={() => setIsMoodModalOpen(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-teal-400/40 transition-all text-left group cursor-pointer"
          >
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Current Mood</span>
              <span
                className="text-xs font-medium tracking-wide flex items-center gap-1.5 transition-colors"
                style={{ color: todayConfig.color }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: todayConfig.color }}
                />
                {todayMood ? todayConfig.label : 'Log Feeling'}
              </span>
            </div>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs group-hover:scale-105 transition-transform"
              style={{ backgroundColor: todayConfig.accentBg, color: todayConfig.color }}
            >
              <Sparkles size={14} />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher (Visible on small screens) */}
      <div className="lg:hidden flex border-b border-white/5 bg-black/40 px-4 py-2 overflow-x-auto gap-2 z-10">
        {[
          { id: 'all', label: 'Overview' },
          { id: 'chat', label: 'Reflective Companion' },
          { id: 'rhythm', label: 'Weekly Rhythm' },
          { id: 'gratitude', label: 'Gratitude Jar' },
          { id: 'breathe', label: 'Breathwork' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveMobileTab(tab.id as any)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              activeMobileTab === tab.id
                ? 'bg-teal-400/20 border border-teal-400/40 text-teal-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Layout (12-column bento matching the Immersive UI theme) */}
      <main className="z-10 flex-1 px-4 sm:px-6 lg:px-10 py-6 md:py-8 max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Weekly Rhythm & Quick Breath Trigger (col-span-3) */}
          <div
            className={`col-span-12 lg:col-span-3 flex flex-col gap-6 ${
              activeMobileTab !== 'all' && activeMobileTab !== 'rhythm' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <WeeklyRhythmCard
              moods={moods}
              onOpenMoodModal={() => setIsMoodModalOpen(true)}
              onOpenBreathing={() => {
                setActiveMobileTab('breathe');
                const breatheElem = document.getElementById('breathing-container-card');
                breatheElem?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>

          {/* CENTER COLUMN: Empathetic AI Companion Chat (col-span-6) */}
          <div
            className={`col-span-12 lg:col-span-6 ${
              activeMobileTab !== 'all' && activeMobileTab !== 'chat' ? 'hidden lg:block' : 'block'
            }`}
          >
            <CompanionChat
              messages={messages}
              onSendMessage={(text) => handleSendMessage(text)}
              onClearChat={handleClearChat}
              isLoading={isChatLoading}
              latestMood={todayMood}
              gratitudeCount={gratitudeEntries.length}
            />
          </div>

          {/* RIGHT COLUMN: Gratitude Jar & Guided Breath Pacer (col-span-3) */}
          <div
            className={`col-span-12 lg:col-span-3 flex flex-col gap-6 ${
              activeMobileTab !== 'all' &&
              activeMobileTab !== 'gratitude' &&
              activeMobileTab !== 'breathe'
                ? 'hidden lg:flex'
                : 'flex'
            }`}
          >
            {/* Gratitude Section */}
            <div
              className={`${
                activeMobileTab === 'breathe' ? 'hidden lg:block' : 'block'
              }`}
            >
              <GratitudeSection
                entries={gratitudeEntries}
                onAddEntry={handleAddGratitude}
                onDeleteEntry={handleDeleteGratitude}
              />
            </div>

            {/* Guided Breathing Pacer */}
            <div
              id="breathing-container-card"
              className={`${
                activeMobileTab === 'gratitude' ? 'hidden lg:block' : 'block'
              }`}
            >
              <BreathingExercise />
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="z-10 py-4 px-6 border-t border-white/[0.03] text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1600px] w-full mx-auto">
        <div className="flex items-center gap-2">
          <span>Serenity Companion</span>
          <span>•</span>
          <span className="text-teal-400/80">Privacy-First Client Storage</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMoodModalOpen(true)}
            className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Wind size={12} className="text-teal-400" />
            Check In
          </button>
        </div>
      </footer>

      {/* Modals */}
      <MoodLoggerModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        onSave={handleSaveMood}
        initialMood={todayMood ? todayMood.mood : 'peaceful'}
      />
    </div>
  );
}
