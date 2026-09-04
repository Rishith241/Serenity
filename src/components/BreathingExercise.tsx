import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { BREATHING_CONFIGS } from '../utils/storage';
import { BreathingTechnique } from '../types';
import { playChime } from '../utils/audio';

interface BreathingExerciseProps {
  isCompact?: boolean;
}

type BreathPhase = 'idle' | 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'complete';

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ isCompact = false }) => {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique>('box');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(4);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isExpandedModal, setIsExpandedModal] = useState<boolean>(false);

  const config = BREATHING_CONFIGS[selectedTechnique];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resetExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setPhase('idle');
    setSecondsRemaining(config.inhale);
    setCycleCount(0);
  };

  const handleTechniqueChange = (tech: BreathingTechnique) => {
    playChime('tap');
    setSelectedTechnique(tech);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setPhase('idle');
    setSecondsRemaining(BREATHING_CONFIGS[tech].inhale);
  };

  const toggleActive = () => {
    if (isActive) {
      // Pause
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);
    } else {
      // Start or resume
      setIsActive(true);
      if (phase === 'idle') {
        startPhase('inhale', config.inhale);
      }
    }
  };

  const startPhase = (nextPhase: BreathPhase, duration: number) => {
    setPhase(nextPhase);
    setSecondsRemaining(duration);

    if (soundEnabled) {
      if (nextPhase === 'inhale') playChime('inhale');
      if (nextPhase === 'exhale') playChime('exhale');
    }
  };

  // Timer tick effect
  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Phase Transition Logic
        if (phase === 'inhale') {
          if (config.hold1 > 0) {
            startPhase('hold1', config.hold1);
          } else {
            startPhase('exhale', config.exhale);
          }
        } else if (phase === 'hold1') {
          startPhase('exhale', config.exhale);
        } else if (phase === 'exhale') {
          if (config.hold2 > 0) {
            startPhase('hold2', config.hold2);
          } else {
            // Completed 1 cycle
            setCycleCount((c) => c + 1);
            startPhase('inhale', config.inhale);
          }
        } else if (phase === 'hold2') {
          // Completed 1 cycle
          setCycleCount((c) => c + 1);
          startPhase('inhale', config.inhale);
        }

        return 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase, config, soundEnabled]);

  // Compute visual scale for concentric rings
  const getScaleClass = () => {
    if (!isActive || phase === 'idle') return 'scale-95';
    if (phase === 'inhale') return 'scale-125 transition-transform duration-[4000ms] ease-in-out';
    if (phase === 'hold1') return 'scale-125';
    if (phase === 'exhale') return 'scale-90 transition-transform duration-[4000ms] ease-in-out';
    if (phase === 'hold2') return 'scale-90';
    return 'scale-100';
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case 'inhale':
        return 'Inhale Slowly';
      case 'hold1':
      case 'hold2':
        return 'Hold Gently';
      case 'exhale':
        return 'Release Breath';
      default:
        return 'Ready';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return 'text-teal-300';
      case 'hold1':
      case 'hold2':
        return 'text-indigo-300';
      case 'exhale':
        return 'text-emerald-300';
      default:
        return 'text-slate-400';
    }
  };

  const content = (
    <div className="flex-1 bg-gradient-to-br from-teal-500/10 to-indigo-500/10 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-between relative overflow-hidden shadow-lg w-full">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500/5 to-transparent pointer-events-none" />

      {/* Top Header controls */}
      <div className="w-full flex items-center justify-between z-10">
        {/* Technique pills */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/10">
          {(Object.keys(BREATHING_CONFIGS) as BreathingTechnique[]).map((tech) => (
            <button
              key={tech}
              onClick={() => handleTechniqueChange(tech)}
              className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full transition-all ${
                selectedTechnique === tech
                  ? 'bg-teal-400 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tech === 'box' ? 'Box 4-4' : tech === 'relax' ? '4-7-8' : 'Calm 4-6'}
            </button>
          ))}
        </div>

        {/* Audio and expand controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playChime('tap');
              setSoundEnabled(!soundEnabled);
            }}
            title={soundEnabled ? 'Mute chimes' : 'Enable chimes'}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
          {!isCompact && (
            <button
              onClick={() => setIsExpandedModal(!isExpandedModal)}
              title={isExpandedModal ? 'Minimize' : 'Full view'}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              {isExpandedModal ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* Interactive Breath Circle Visualizer */}
      <div className="relative my-8 flex items-center justify-center">
        {/* Outer pulsating glow rings */}
        <div
          className={`w-40 h-40 md:w-48 md:h-48 rounded-full border border-teal-500/20 absolute transition-all duration-1000 ${getScaleClass()}`}
          style={{
            boxShadow: isActive ? '0 0 45px rgba(45,212,191,0.18)' : 'none',
          }}
        />
        <div
          className={`w-32 h-32 md:w-36 md:h-36 rounded-full border border-indigo-500/20 absolute transition-all duration-700 ${getScaleClass()}`}
        />
        <div
          className={`w-24 h-24 md:w-28 md:h-28 rounded-full bg-teal-500/10 border border-teal-400/30 flex flex-col items-center justify-center text-center backdrop-blur-sm z-10 transition-all duration-500 shadow-inner`}
        >
          <span className={`text-[9px] uppercase tracking-widest font-medium ${getPhaseColor()}`}>
            {getPhaseLabel()}
          </span>
          <span className="text-2xl md:text-3xl font-light text-white mt-0.5">
            {isActive ? `${secondsRemaining}s` : 'Start'}
          </span>
        </div>
      </div>

      {/* Guide subtitle */}
      <p className="text-center text-[11px] text-slate-400 max-w-[240px] leading-relaxed z-10">
        {config.purpose}
      </p>

      {/* Cycle counter & Playback bar */}
      <div className="w-full flex items-center justify-between pt-4 border-t border-white/5 z-10 mt-4">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest">
          Cycles completed: <span className="text-slate-300 font-semibold">{cycleCount}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={resetExercise}
            title="Reset"
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw size={12} />
          </button>
          <button
            id="toggle-breathing-active-btn"
            onClick={toggleActive}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isActive
                ? 'bg-white/10 border border-white/20 text-slate-200 hover:bg-white/20'
                : 'bg-teal-400 text-slate-950 hover:bg-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.3)]'
            }`}
          >
            {isActive ? (
              <>
                <Pause size={12} /> Pause
              </>
            ) : (
              <>
                <Play size={12} className="fill-current" /> Begin
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isExpandedModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <div className="w-full max-w-lg min-h-[500px] flex">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
