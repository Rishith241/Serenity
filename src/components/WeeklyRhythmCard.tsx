import React from 'react';
import { Sparkles, Calendar, Plus } from 'lucide-react';
import { MoodEntry } from '../types';
import { MOOD_CONFIGS } from '../utils/storage';

interface WeeklyRhythmCardProps {
  moods: MoodEntry[];
  onOpenMoodModal: () => void;
  onOpenBreathing: () => void;
}

export const WeeklyRhythmCard: React.FC<WeeklyRhythmCardProps> = ({
  moods,
  onOpenMoodModal,
  onOpenBreathing,
}) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const weekData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - idx));
    const dateStr = d.toISOString().split('T')[0];
    const entry = moods.find((m) => m.date === dateStr);
    const dayLabel = daysOfWeek[d.getDay()];
    const isToday = dateStr === today.toISOString().split('T')[0];

    const score = entry ? entry.moodScore : 0;
    const percentage = score ? Math.min(Math.max((score / 5) * 100, 25), 100) : 0;
    const moodConfig = entry ? MOOD_CONFIGS[entry.mood] : null;

    return {
      dateStr,
      dayLabel,
      isToday,
      entry,
      percentage,
      moodConfig,
    };
  });

  const calculateStreak = () => {
    let streak = 0;
    const checkDate = new Date();
    let dateStr = checkDate.toISOString().split('T')[0];
    let foundToday = moods.some((m) => m.date === dateStr);

    if (!foundToday) {
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = checkDate.toISOString().split('T')[0];
    }

    while (moods.some((m) => m.date === dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = checkDate.toISOString().split('T')[0];
    }
    return Math.max(streak, 1);
  };

  const streak = calculateStreak();
  const hasLoggedToday = moods.some((m) => m.date === today.toISOString().split('T')[0]);

  return (
    <section className="flex flex-col gap-6" id="weekly-rhythm-section">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between shadow-lg">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <h2 className="text-[11px] uppercase tracking-widest text-slate-400 font-medium">
                Weekly Rhythm
              </h2>
            </div>
            {!hasLoggedToday && (
              <button
                id="log-today-prompt-btn"
                onClick={onOpenMoodModal}
                className="text-[10px] text-teal-300 hover:text-teal-200 uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <Plus size={12} /> Log Today
              </button>
            )}
          </div>

          <div className="space-y-3.5">
            {weekData.map((day) => (
              <div key={day.dateStr} className="flex items-center justify-between text-xs">
                <span
                  className={`w-8 font-medium ${
                    day.isToday ? 'text-teal-300 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {day.dayLabel}
                </span>

                <div className="flex-1 mx-3 h-1.5 bg-slate-800/80 rounded-full overflow-hidden relative">
                  {day.entry ? (
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        day.isToday
                          ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]'
                          : day.percentage > 70
                          ? 'bg-teal-400/90'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${day.percentage}%` }}
                    />
                  ) : (
                    <div className="w-2 h-full bg-slate-700/40 rounded-full" />
                  )}
                </div>

                <span className="w-16 text-right text-[11px] text-slate-500 truncate">
                  {day.entry ? day.entry.mood : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 pt-5 border-t border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-normal text-slate-400 mb-1 flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400" />
              Consistency Streak
            </h3>
            <p className="text-2xl font-light text-slate-100">
              {streak} <span className="text-xs text-slate-500 tracking-wide font-normal">Days</span>
            </p>
          </div>
          <button
            id="open-mood-modal-action-btn"
            onClick={onOpenMoodModal}
            className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-white transition-all"
          >
            {hasLoggedToday ? 'Edit Today' : 'Log Mood'}
          </button>
        </div>
      </div>

      <div
        id="breathing-trigger-card"
        onClick={onOpenBreathing}
        className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-center items-center text-center cursor-pointer hover:bg-indigo-500/15 hover:border-indigo-500/30 transition-all duration-300 group shadow-lg"
      >
        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <span className="text-xs text-indigo-300 font-medium group-hover:text-indigo-200 transition-colors">
          Ready to breathe?
        </span>
        <p className="text-[10px] text-indigo-300/60 mt-1 tracking-wide">
          Tap to start guided grounding session
        </p>
      </div>
    </section>
  );
};
