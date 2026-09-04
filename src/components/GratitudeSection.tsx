import React, { useState } from 'react';
import { Heart, Plus, Sparkles, Trash2, Tag } from 'lucide-react';
import { GratitudeEntry } from '../types';
import { GRATITUDE_PROMPTS } from '../utils/storage';
import { playChime } from '../utils/audio';

interface GratitudeSectionProps {
  entries: GratitudeEntry[];
  onAddEntry: (text: string, category: GratitudeEntry['category']) => void;
  onDeleteEntry: (id: string) => void;
}

const CATEGORIES: GratitudeEntry['category'][] = ['Everyday', 'People', 'Moments', 'Growth', 'Nature'];

export const GratitudeSection: React.FC<GratitudeSectionProps> = ({
  entries,
  onAddEntry,
  onDeleteEntry,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GratitudeEntry['category']>('Everyday');
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  const handleNextPrompt = () => {
    playChime('tap');
    setActivePromptIndex((prev) => (prev + 1) % GRATITUDE_PROMPTS.length);
  };

  const handleApplyPrompt = () => {
    setInputText(GRATITUDE_PROMPTS[activePromptIndex]);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    playChime('complete');
    onAddEntry(inputText.trim(), selectedCategory);
    setInputText('');
    setIsAdding(false);
  };

  const formatRelativeDate = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';

    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col shadow-lg" id="gratitude-jar-container">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart size={14} className="text-teal-400" />
          <h2 className="text-[11px] uppercase tracking-widest text-slate-400 font-medium">
            Gratitude Jar
          </h2>
        </div>
        <button
          id="add-gratitude-toggle-btn"
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs text-teal-300 hover:text-teal-200 flex items-center gap-1 transition-colors"
        >
          <Plus size={14} />
          {isAdding ? 'Close' : 'Add Note'}
        </button>
      </div>

      <div className="mb-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
        <button
          onClick={handleNextPrompt}
          title="Cycle prompt"
          className="p-1 rounded-md bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 mt-0.5 transition-colors"
        >
          <Sparkles size={13} />
        </button>
        <div className="flex-1">
          <p
            onClick={handleApplyPrompt}
            className="text-[11px] text-slate-400 italic cursor-pointer hover:text-slate-200 transition-colors leading-relaxed"
          >
            "{GRATITUDE_PROMPTS[activePromptIndex]}"
          </p>
          <span className="text-[9px] text-slate-600 uppercase tracking-widest mt-1 block">
            Tap text to use prompt
          </span>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-2xl bg-black/40 border border-teal-500/30 space-y-3">
          <textarea
            id="gratitude-text-input"
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="I am grateful for..."
            autoFocus
            className="w-full bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-600 resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
            <div className="flex gap-1.5 overflow-x-auto py-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    selectedCategory === cat
                      ? 'bg-teal-500/20 border-teal-400/40 text-teal-300'
                      : 'border-white/5 bg-white/[0.02] text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              id="submit-gratitude-entry-btn"
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-1 rounded-full bg-teal-400 hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-[11px] font-semibold transition-all shadow-[0_0_12px_rgba(45,212,191,0.2)]"
            >
              Record
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 select-none">
        {entries.length === 0 ? (
          <div className="p-6 text-center text-slate-600 text-xs italic">
            Your gratitude jar is waiting for your first spark of reflection.
          </div>
        ) : (
          entries.map((item, idx) => {
            const opacityClass = idx === 0 ? 'opacity-100' : idx === 1 ? 'opacity-80' : 'opacity-60 hover:opacity-100';
            return (
              <div
                key={item.id}
                id={`gratitude-item-${item.id}`}
                className={`p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-200 group relative ${opacityClass}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-xs italic text-slate-300 leading-relaxed">
                    "{item.text}"
                  </p>
                  <button
                    onClick={() => {
                      playChime('tap');
                      onDeleteEntry(item.id);
                    }}
                    title="Remove entry"
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-opacity p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.03]">
                  <span className="text-[10px] text-slate-500 font-normal">
                    {formatRelativeDate(item.date)}
                  </span>
                  <span className="text-[9px] text-teal-400/80 bg-teal-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Tag size={9} />
                    {item.category}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
