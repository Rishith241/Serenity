import React, { useState } from 'react';
import { X, Sparkles, Smile, Zap, Meh, CloudRain, Flame, Moon, Check } from 'lucide-react';
import { MoodType } from '../types';
import { MOOD_CONFIGS, COMMON_EMOTION_TAGS } from '../utils/storage';
import { playChime } from '../utils/audio';

interface MoodLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    mood: MoodType;
    moodScore: number;
    energyLevel: number;
    sleepQuality: number;
    tags: string[];
    note: string;
  }) => void;
  initialMood?: MoodType;
}

export const MoodLoggerModal: React.FC<MoodLoggerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMood = 'peaceful',
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodType>(initialMood);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Calm']);
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    playChime('tap');
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playChime('complete');
    onSave({
      mood: selectedMood,
      moodScore: MOOD_CONFIGS[selectedMood].score,
      energyLevel,
      sleepQuality,
      tags: selectedTags,
      note,
    });
    onClose();
  };

  const renderIcon = (moodKey: MoodType) => {
    const size = 18;
    switch (moodKey) {
      case 'peaceful':
        return <Sparkles size={size} />;
      case 'content':
        return <Smile size={size} />;
      case 'energized':
        return <Zap size={size} />;
      case 'neutral':
        return <Meh size={size} />;
      case 'anxious':
        return <CloudRain size={size} />;
      case 'stressed':
        return <Flame size={size} />;
      case 'down':
        return <Moon size={size} />;
    }
  };

  return (
    <div
      id="mood-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        id="mood-modal-container"
        className="w-full max-w-lg bg-[#0c1017] border border-white/10 rounded-3xl p-6 md:p-8 text-slate-200 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div>
            <span className="text-[10px] text-teal-400 font-medium uppercase tracking-[0.25em]">
              Daily Reflection
            </span>
            <h2 className="text-xl font-light text-slate-100 mt-0.5">How are you feeling right now?</h2>
          </div>
          <button
            id="close-mood-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6 mt-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-3">
              Core Emotion State
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((moodKey) => {
                const config = MOOD_CONFIGS[moodKey];
                const isSelected = selectedMood === moodKey;
                return (
                  <button
                    key={moodKey}
                    id={`mood-btn-${moodKey}`}
                    type="button"
                    onClick={() => {
                      playChime('tap');
                      setSelectedMood(moodKey);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col items-start justify-between h-20 ${
                      isSelected
                        ? 'border-teal-400/60 bg-teal-500/15 shadow-[0_0_15px_rgba(45,212,191,0.15)] text-white'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className="p-1.5 rounded-lg"
                      style={{
                        color: config.color,
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.08)' : config.accentBg,
                      }}
                    >
                      {renderIcon(moodKey)}
                    </div>
                    <span className="text-xs font-medium tracking-wide">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs uppercase tracking-wider text-slate-400">
                Emotional Nuance <span className="text-[10px] text-slate-500 lowercase">(pick up to 5)</span>
              </label>
              <span className="text-[11px] text-slate-500">{selectedTags.length}/5</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_EMOTION_TAGS.map((tag) => {
                const isChecked = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    id={`tag-btn-${tag.toLowerCase()}`}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      isChecked
                        ? 'bg-teal-500/20 border-teal-500/40 text-teal-300 font-medium'
                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {isChecked && <Check size={12} className="inline mr-1 -mt-0.5" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">Physical Energy</span>
                <span className="text-teal-400 font-medium">{energyLevel}/5</span>
              </div>
              <input
                id="energy-slider"
                type="range"
                min="1"
                max="5"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                <span>Depleted</span>
                <span>Balanced</span>
                <span>Radiant</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">Sleep Restfulness</span>
                <span className="text-indigo-400 font-medium">{sleepQuality}/5</span>
              </div>
              <input
                id="sleep-slider"
                type="range"
                min="1"
                max="5"
                value={sleepQuality}
                onChange={(e) => setSleepQuality(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                <span>Restless</span>
                <span>Adequate</span>
                <span>Deep</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="mood-note-input" className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
              Personal Reflection <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              id="mood-note-input"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What context or thoughts shaped your feeling today?"
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 resize-none transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              id="save-mood-submit-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_25px_rgba(45,212,191,0.5)]"
            >
              Save Check-in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
