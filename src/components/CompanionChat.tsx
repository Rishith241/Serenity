import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Sparkles, ShieldAlert, HeartHandshake } from 'lucide-react';
import { ChatMessage, MoodEntry } from '../types';
import { playChime } from '../utils/audio';

interface CompanionChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearChat: () => void;
  isLoading: boolean;
  latestMood?: MoodEntry;
  gratitudeCount: number;
}

const QUICK_STARTERS = [
  "I'm feeling a bit anxious today",
  "Help me unpack what I'm feeling",
  "Can you guide me through a grounding thought?",
  "I want to celebrate a small win",
];

export const CompanionChat: React.FC<CompanionChatProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  latestMood,
}) => {
  const [inputText, setInputText] = useState('');
  const [showCrisisInfo, setShowCrisisInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    playChime('tap');
    await onSendMessage(text);
  };

  const handleQuickPrompt = (prompt: string) => {
    playChime('tap');
    onSendMessage(prompt);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <section
      id="companion-chat-container"
      className="bg-white/[0.03] border border-white/5 rounded-[40px] flex flex-col overflow-hidden backdrop-blur-sm relative h-full min-h-[580px] shadow-2xl"
    >
      {/* Top Bar */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between z-10 bg-black/20">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
          <div>
            <h2 className="text-xs uppercase tracking-widest text-slate-300 font-medium">
              Empathetic Companion
            </h2>
            <p className="text-[10px] text-slate-500">
              Non-judgmental, grounded emotional support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="crisis-info-btn"
            onClick={() => setShowCrisisInfo(!showCrisisInfo)}
            title="Crisis & Support Helplines"
            className="px-2.5 py-1 rounded-full border border-white/10 text-[10px] text-slate-400 hover:text-teal-300 hover:bg-white/5 flex items-center gap-1 transition-colors"
          >
            <ShieldAlert size={11} />
            <span className="hidden sm:inline">Helpline Resources</span>
          </button>
          <button
            id="clear-chat-history-btn"
            onClick={() => {
              playChime('tap');
              onClearChat();
            }}
            title="Reset conversation"
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Helpline banner */}
      {showCrisisInfo && (
        <div className="px-6 py-3 bg-indigo-950/60 border-b border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-3 transition-all">
          <HeartHandshake size={18} className="text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-slate-100">
              Immediate Support is Always Available
            </p>
            <p className="text-[11px] text-indigo-200/80 leading-relaxed">
              If you or someone you know is in severe distress or crisis, compassionate counselors are available 24/7.
              Call or text <strong className="text-teal-300">988</strong> (US & Canada), text <strong className="text-teal-300">HOME to 741741</strong>, or visit <span className="underline">befrienders.org</span> globally.
            </p>
          </div>
        </div>
      )}

      {/* Date Capsule */}
      <div className="flex justify-center my-4">
        <span className="px-4 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-slate-500 uppercase tracking-widest">
          {todayFormatted}
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 px-6 py-2 space-y-5 overflow-y-auto pr-3 select-text">
        {latestMood && (
          <div className="flex justify-center">
            <div className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] text-teal-300 flex items-center gap-1.5">
              <Sparkles size={11} />
              Reflecting on today's logged state: <strong>{latestMood.mood}</strong>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                isUser ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-medium ${
                  isUser
                    ? 'bg-slate-700 text-slate-200 border border-slate-600'
                    : 'bg-teal-500/20 border border-teal-500/30 text-teal-300 font-semibold'
                }`}
              >
                {isUser ? 'Me' : 'H'}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600/25 border border-indigo-500/30 text-slate-100 rounded-tr-none'
                    : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 shrink-0 flex items-center justify-center text-[10px] text-teal-300 font-bold">
              H
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-400/80 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-teal-400/80 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-teal-400/80 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[11px] text-slate-500 ml-1">Holding space...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters */}
      <div className="px-6 py-2 overflow-x-auto flex gap-2 border-t border-white/5 bg-black/10">
        {QUICK_STARTERS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleQuickPrompt(prompt)}
            disabled={isLoading}
            className="text-[11px] px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-slate-400 hover:text-slate-200 whitespace-nowrap transition-colors disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 md:p-6 bg-black/40 border-t border-white/5">
        <form
          onSubmit={handleSubmit}
          className="flex gap-3 items-center bg-white/5 border border-white/10 rounded-full px-5 py-2.5 focus-within:border-teal-400/50 transition-colors"
        >
          <input
            id="chat-user-message-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Share what is on your mind..."
            className="bg-transparent border-none outline-none flex-1 text-sm text-slate-200 placeholder:text-slate-600"
          />
          <button
            id="send-chat-message-btn"
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-teal-400 disabled:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-900 transition-colors shrink-0"
            aria-label="Send message"
          >
            <Send size={14} className="translate-x-[0.5px]" />
          </button>
        </form>
      </div>
    </section>
  );
};
