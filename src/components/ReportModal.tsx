import React from 'react';
import { AnswerRecord } from '../types/game';
import { Trophy, Star, CheckCircle2, RotateCcw, Home, Printer, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportModalProps {
  records: AnswerRecord[];
  finalScore: number;
  maxCombo: number;
  topicTitle: string;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  records,
  finalScore,
  maxCombo,
  topicTitle,
  onPlayAgain,
  onBackToMenu,
}) => {
  const total = records.length;
  const correctCount = records.filter((r) => r.isCorrect).length;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  // Star calculation
  let stars = 1;
  if (accuracy >= 80) stars = 3;
  else if (accuracy >= 50) stars = 2;

  React.useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [stars]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto select-none">
      <div className="bg-slate-900 border border-sky-500/40 rounded-3xl max-w-lg w-full p-5 sm:p-7 text-white shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        {/* Header Ribbon */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-xl mb-2.5">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-amber-200 to-emerald-300">
            Penerbangan Selesai!
          </h2>
          <p className="text-xs text-sky-200/80 mt-1 font-semibold">{topicTitle}</p>

          {/* Stars */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-6 h-6 transition-all ${
                  starIdx <= stars
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Skor Akhir</span>
            <span className="text-2xl font-black text-amber-400">{finalScore.toLocaleString()}</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Soal Diselesaikan</span>
            <span className="text-2xl font-black text-sky-300">{total} Soal</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Akurasi</span>
            <span className="text-xl font-black text-emerald-400">{accuracy}%</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Max Combo</span>
            <span className="text-xl font-black text-purple-300">{maxCombo}x</span>
          </div>
        </div>

        {/* Completion notice (Hiding question-by-question keys) */}
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200 leading-relaxed">
            <strong className="block text-emerald-300 font-bold mb-0.5">
              Seluruh Jawaban Tersimpan
            </strong>
            Anda telah berhasil menyelesaikan lintasan penerbangan dan menjawab semua pertanyaan kuis dengan baik.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-800">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rapor</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToMenu}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Menu Utama</span>
            </button>

            <button
              type="button"
              onClick={onPlayAgain}
              className="px-5 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg hover:shadow-sky-500/25 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Terbang Lagi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
