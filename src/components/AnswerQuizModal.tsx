import React, { useState } from 'react';
import { Question } from '../types/game';
import { EnvironmentTheme, THEME_CONFIGS } from '../game/environment';
import { soundEngine } from '../game/audio';
import { HelpCircle, ArrowRight, Compass, Sparkles, CheckCircle2 } from 'lucide-react';

interface AnswerQuizModalProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  gateLetter: string;
  nextTheme: EnvironmentTheme;
  onAnswerSubmitted: (isCorrect: boolean, selectedIndex: number, scoreGained: number) => void;
  onProceedToNextTrack: () => void;
  compact?: boolean; // For split screen mode: embeds inside player's half without covering whole screen
  accent?: 'sky' | 'amber';
  scorePerCorrect?: number;
}

export const AnswerQuizModal: React.FC<AnswerQuizModalProps> = ({
  question,
  questionIndex,
  totalQuestions,
  gateLetter,
  nextTheme,
  onAnswerSubmitted,
  onProceedToNextTrack,
  compact = false,
  accent = 'sky',
  scorePerCorrect = 100,
}) => {
  const letters = ['A', 'B', 'C', 'D'];
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const nextTrackName = THEME_CONFIGS[nextTheme]?.name || 'Lintasan Berikutnya';

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;

    setSelectedOptionIndex(index);
    setIsAnswered(true);

    const isCorrect = index === question.correctIndex;
    const scoreGained = isCorrect ? scorePerCorrect : 0;

    soundEngine.playCorrectSound();
    onAnswerSubmitted(isCorrect, index, scoreGained);
  };

  const accentBorder = accent === 'amber' ? 'border-amber-400/50' : 'border-sky-500/50';
  const accentGlow = accent === 'amber' ? 'shadow-amber-500/20' : 'shadow-sky-500/20';
  const accentText = accent === 'amber' ? 'text-amber-400' : 'text-sky-400';
  const accentBg = accent === 'amber' ? 'bg-amber-500/20' : 'bg-sky-500/20';

  // Container styling:
  // If compact (Split Screen 2P): absolute inset-0 stays strictly inside the player's 50% split pane!
  // If solo mode: fixed inset-0 centered modal.
  const containerClass = compact
    ? 'absolute inset-0 z-40 flex items-center justify-center p-2.5 sm:p-3.5 bg-slate-950/90 backdrop-blur-md animate-in fade-in select-none overflow-y-auto'
    : 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 select-none overflow-y-auto';

  const cardClass = compact
    ? `w-full max-w-sm sm:max-w-md p-3 sm:p-4 max-h-[96%] flex flex-col rounded-2xl text-white shadow-2xl border transition-all my-auto overflow-y-auto bg-slate-900/98 ${accentBorder} ${accentGlow}`
    : `w-full max-w-2xl p-5 md:p-7 max-h-[92vh] flex flex-col rounded-3xl text-white shadow-2xl border transition-all my-auto overflow-y-auto bg-slate-900/95 ${accentBorder} ${accentGlow}`;

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2.5 mb-2.5 pb-2.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`${compact ? 'w-8 h-8 rounded-lg' : 'w-11 h-11 rounded-2xl'} ${accentBg} border ${accentBorder} flex items-center justify-center ${accentText} shadow-md shrink-0`}>
              <HelpCircle className={compact ? 'w-4 h-4' : 'w-6 h-6'} />
            </div>
            <div className="min-w-0">
              <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${accentText} block truncate`}>
                Soal Ujian • #{questionIndex + 1} dari {totalQuestions}
              </span>
              <h3 className={`${compact ? 'text-xs sm:text-sm' : 'text-lg sm:text-xl'} font-black text-white leading-tight truncate`}>
                {!isAnswered
                  ? `Gerbang ${gateLetter} Ditembus! Jawab Soal`
                  : '✓ Jawaban Anda Tersimpan'}
              </h3>
            </div>
          </div>

          {/* Status Indicator */}
          {isAnswered && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-bold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tersimpan</span>
            </div>
          )}
        </div>

        {/* 1. Panel Soal (Question Display - Full text with word wrap, never cut off) */}
        <div className={`bg-slate-800/90 rounded-xl ${compact ? 'p-2.5 mb-2.5' : 'p-4 sm:p-5 mb-4'} border border-slate-700/80 shadow-inner shrink-0`}>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-sky-300 uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Pertanyaan:</span>
          </div>
          <p className={`${compact ? 'text-xs sm:text-sm font-semibold' : 'text-sm sm:text-base md:text-lg font-bold'} text-white leading-relaxed break-words whitespace-normal`}>
            {question.question}
          </p>
        </div>

        {/* 2. Pilihan Jawaban - Langsung dijawab di split screen tanpa menutupi pemain lain */}
        <div className="space-y-1.5 mb-3 flex-1 overflow-y-auto pr-0.5">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {!isAnswered ? 'Pilih salah satu jawaban:' : 'Pilihan yang Anda simpan:'}
          </p>

          <div className={`grid ${compact ? 'grid-cols-1 gap-2' : 'grid-cols-1 sm:grid-cols-2 gap-2.5'}`}>
            {question.options.map((option, idx) => {
              const isSelected = selectedOptionIndex === idx;

              let btnStyle = 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-white cursor-pointer hover:border-sky-400 active:scale-[0.99]';
              let badge = null;

              if (isAnswered) {
                if (isSelected) {
                  // Only highlight the chosen option without revealing if right or wrong
                  btnStyle = `${accentBg} ${accentBorder} text-white ring-2 ring-sky-400/50 font-bold shadow-lg`;
                  badge = (
                    <span className="text-[9px] sm:text-[10px] bg-sky-500 text-slate-950 px-1.5 py-0.5 rounded font-black tracking-wide shrink-0">
                      PILIHANMU ✓
                    </span>
                  );
                } else {
                  btnStyle = 'bg-slate-800/30 border-slate-800 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={letters[idx]}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full ${compact ? 'p-2 sm:p-2.5 rounded-xl min-h-[2.75rem]' : 'p-3 sm:p-3.5 rounded-2xl min-h-[3.5rem]'} border text-left flex items-start justify-between gap-2 transition-all shadow-md ${btnStyle}`}
                >
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <span
                      className={`${compact ? 'w-6 h-6 text-xs' : 'w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm'} rounded-lg flex items-center justify-center font-black shrink-0 mt-0.5 shadow-sm ${
                        isAnswered && isSelected
                          ? 'bg-sky-400 text-slate-950 font-black'
                          : 'bg-slate-900 text-sky-300 border border-slate-700'
                      }`}
                    >
                      {letters[idx]}
                    </span>
                    <span className={`${compact ? 'text-xs' : 'text-xs sm:text-sm'} leading-relaxed break-words whitespace-normal text-slate-100 flex-1 pt-0.5`}>
                      {option}
                    </span>
                  </div>
                  {badge && <div className="shrink-0 mt-0.5">{badge}</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Footer & Action Button */}
        {isAnswered && (
          <div className="pt-2.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 animate-in fade-in duration-300">
            <div className="flex items-center gap-1.5 text-[11px] text-sky-300">
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="truncate">
                Lintasan: <strong className="text-white">{nextTrackName}</strong>
              </span>
            </div>

            <button
              type="button"
              autoFocus
              onClick={onProceedToNextTrack}
              className={`w-full sm:w-auto ${compact ? 'px-4 py-2 text-xs' : 'px-6 py-2.5 text-xs sm:text-sm'} rounded-xl bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 hover:from-sky-300 hover:to-emerald-300 text-slate-950 font-black flex items-center justify-center gap-1.5 shadow-xl shadow-sky-500/25 active:scale-95 transition-all cursor-pointer uppercase tracking-wider`}
            >
              <span>Lanjut Lintasan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
