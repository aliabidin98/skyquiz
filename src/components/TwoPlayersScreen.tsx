import React, { useEffect, useRef, useState } from 'react';
import { Question, QuizTopic, FlightDifficulty } from '../types/game';
import { AircraftType } from '../game/aircraft';
import { FlightEngine } from '../game/flightEngine';
import { AnswerQuizModal } from './AnswerQuizModal';
import { TouchControls } from './TouchControls';
import { Trophy, ArrowLeft, Swords, Home } from 'lucide-react';
import { EnvironmentTheme } from '../game/environment';
import { getGameSettings } from '../data/settingsData';
import confetti from 'canvas-confetti';

interface TwoPlayersScreenProps {
  questions: Question[];
  difficulty: FlightDifficulty;
  player1Name: string;
  player2Name: string;
  player1Aircraft: AircraftType;
  player2Aircraft: AircraftType;
  onExit: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const TwoPlayersScreen: React.FC<TwoPlayersScreenProps> = ({
  questions,
  difficulty,
  player1Name,
  player2Name,
  player1Aircraft,
  player2Aircraft,
  onExit,
}) => {
  const mountP1Ref = useRef<HTMLDivElement>(null);
  const mountP2Ref = useRef<HTMLDivElement>(null);

  const engineP1Ref = useRef<FlightEngine | null>(null);
  const engineP2Ref = useRef<FlightEngine | null>(null);

  const [settings] = useState(() => getGameSettings());

  // Shuffled questions for each player
  const [p1Questions] = useState<Question[]>(() => shuffleArray(questions));
  const [p2Questions] = useState<Question[]>(() => shuffleArray(questions));

  // Player 1 States
  const [p1Score, setP1Score] = useState(0);
  const [p1Combo, setP1Combo] = useState(0);
  const [p1QIndex, setP1QIndex] = useState(0);
  const [p1Finished, setP1Finished] = useState(false);
  const [p1ActiveModal, setP1ActiveModal] = useState<{
    question: Question;
    questionIndex: number;
    gateLetter: string;
    nextTheme: EnvironmentTheme;
  } | null>(null);

  // Player 2 States
  const [p2Score, setP2Score] = useState(0);
  const [p2Combo, setP2Combo] = useState(0);
  const [p2QIndex, setP2QIndex] = useState(0);
  const [p2Finished, setP2Finished] = useState(false);
  const [p2ActiveModal, setP2ActiveModal] = useState<{
    question: Question;
    questionIndex: number;
    gateLetter: string;
    nextTheme: EnvironmentTheme;
  } | null>(null);

  const [gameOver, setGameOver] = useState(false);

  // Launch both engines
  useEffect(() => {
    if (!mountP1Ref.current || !mountP2Ref.current) return;

    // 1. Setup Engine Player 1 (WASD + Analog Stik Kiri)
    const topicP1: QuizTopic = {
      id: 'p1-quiz',
      title: 'Soal Ujian P1',
      description: '',
      icon: 'Plane',
      theme: 'beach',
      questions: p1Questions,
    };

    const engine1 = new FlightEngine(
      mountP1Ref.current,
      topicP1,
      difficulty,
      player1Aircraft,
      {
        onQuestionStart: (_q, idx) => {
          setP1QIndex(idx);
          setP1ActiveModal(null);
        },
        onGatePierced: (q, idx, _tot, gateLetter, nextTheme) => {
          setP1ActiveModal({
            question: q,
            questionIndex: idx,
            gateLetter,
            nextTheme,
          });
        },
        onGameComplete: (_recs, finalScore) => {
          setP1Score(finalScore);
          setP1Finished(true);
          setP1ActiveModal(null);
        },
        onSpeedUpdate: () => {},
        onTrackChanged: () => {},
      },
      'WASD',
      settings.flightSpeed,
      settings.boostMultiplier
    );
    engine1.start();
    engineP1Ref.current = engine1;

    // 2. Setup Engine Player 2 (Panah + Analog Stik Kanan)
    const topicP2: QuizTopic = {
      id: 'p2-quiz',
      title: 'Soal Ujian P2',
      description: '',
      icon: 'Rocket',
      theme: 'space',
      questions: p2Questions,
    };

    const engine2 = new FlightEngine(
      mountP2Ref.current,
      topicP2,
      difficulty,
      player2Aircraft,
      {
        onQuestionStart: (_q, idx) => {
          setP2QIndex(idx);
          setP2ActiveModal(null);
        },
        onGatePierced: (q, idx, _tot, gateLetter, nextTheme) => {
          setP2ActiveModal({
            question: q,
            questionIndex: idx,
            gateLetter,
            nextTheme,
          });
        },
        onGameComplete: (_recs, finalScore) => {
          setP2Score(finalScore);
          setP2Finished(true);
          setP2ActiveModal(null);
        },
        onSpeedUpdate: () => {},
        onTrackChanged: () => {},
      },
      'ARROWS',
      settings.flightSpeed,
      settings.boostMultiplier
    );
    engine2.start();
    engineP2Ref.current = engine2;

    return () => {
      if (engineP1Ref.current) engineP1Ref.current.dispose();
      if (engineP2Ref.current) engineP2Ref.current.dispose();
    };
  }, []);

  // Check Game Over condition
  useEffect(() => {
    if (p1Finished && p2Finished && !gameOver) {
      setGameOver(true);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  }, [p1Finished, p2Finished, gameOver]);

  // Handle Answers P1
  const handleP1Answer = (isCorrect: boolean, selectedIndex: number, scoreGained: number) => {
    if (engineP1Ref.current) {
      engineP1Ref.current.recordAnswer(isCorrect, selectedIndex, scoreGained);
    }
    if (isCorrect) {
      const bonus = p1Combo * settings.comboBonus;
      setP1Score((s) => s + scoreGained + bonus);
      setP1Combo((c) => c + 1);
    } else {
      setP1Score((s) => Math.max(0, s - settings.scorePenaltyWrong));
      setP1Combo(0);
    }
  };

  const handleP1Proceed = () => {
    setP1ActiveModal(null);
    if (engineP1Ref.current) {
      engineP1Ref.current.proceedToNextTrack();
    }
  };

  // Handle Answers P2
  const handleP2Answer = (isCorrect: boolean, selectedIndex: number, scoreGained: number) => {
    if (engineP2Ref.current) {
      engineP2Ref.current.recordAnswer(isCorrect, selectedIndex, scoreGained);
    }
    if (isCorrect) {
      const bonus = p2Combo * settings.comboBonus;
      setP2Score((s) => s + scoreGained + bonus);
      setP2Combo((c) => c + 1);
    } else {
      setP2Score((s) => Math.max(0, s - settings.scorePenaltyWrong));
      setP2Combo(0);
    }
  };

  const handleP2Proceed = () => {
    setP2ActiveModal(null);
    if (engineP2Ref.current) {
      engineP2Ref.current.proceedToNextTrack();
    }
  };

  // Touch steer for P1
  const handleP1SteerTouch = (x: number, y: number) => {
    if (engineP1Ref.current) engineP1Ref.current.setDirectSteering(x, y);
  };
  const handleP1BoostTouch = (b: boolean) => {
    if (engineP1Ref.current) engineP1Ref.current.setBoosting(b);
  };

  // Touch steer for P2
  const handleP2SteerTouch = (x: number, y: number) => {
    if (engineP2Ref.current) engineP2Ref.current.setDirectSteering(x, y);
  };
  const handleP2BoostTouch = (b: boolean) => {
    if (engineP2Ref.current) engineP2Ref.current.setBoosting(b);
  };

  const winner =
    p1Score > p2Score
      ? player1Name || 'Pemain 1'
      : p2Score > p1Score
      ? player2Name || 'Pemain 2'
      : 'Hasil Seri!';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col select-none font-sans">
      {/* Top VS Header Bar */}
      <div className="h-14 bg-slate-900/95 border-b border-sky-500/30 flex items-center justify-between px-3 sm:px-6 z-30 shrink-0 shadow-lg backdrop-blur-md">
        {/* Left: Player 1 Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400 flex items-center justify-center font-black text-sky-300 text-xs shadow">
            P1
          </div>
          <div>
            <span className="font-extrabold text-xs sm:text-sm text-white block leading-none">
              {player1Name || 'Pemain 1'}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-sky-300 mt-0.5">
              <span>Skor: <strong className="text-amber-300 font-bold">{p1Score}</strong></span>
              {p1Combo > 1 && <span className="text-amber-400">🔥 {p1Combo}x</span>}
              <span className="text-slate-400">({p1QIndex + 1}/{p1Questions.length})</span>
            </div>
          </div>
        </div>

        {/* Center: VS Badge & Exit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500/20 via-purple-500/20 to-amber-500/20 border border-sky-400/40">
            <Swords className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-black text-white tracking-wider">SPLIT SCREEN 2P</span>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Keluar ke Menu"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>

        {/* Right: Player 2 Info */}
        <div className="flex items-center gap-2.5 text-right">
          <div>
            <span className="font-extrabold text-xs sm:text-sm text-white block leading-none">
              {player2Name || 'Pemain 2'}
            </span>
            <div className="flex items-center justify-end gap-2 text-[10px] text-amber-300 mt-0.5">
              <span className="text-slate-400">({p2QIndex + 1}/{p2Questions.length})</span>
              {p2Combo > 1 && <span className="text-amber-400">🔥 {p2Combo}x</span>}
              <span>Skor: <strong className="text-amber-300 font-bold">{p2Score}</strong></span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center font-black text-amber-300 text-xs shadow">
            P2
          </div>
        </div>
      </div>

      {/* Main Split Viewports (50% - 50%) */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* Left Half: Player 1 Viewport */}
        <div className="relative flex-1 h-1/2 md:h-full border-b md:border-b-0 md:border-r-2 border-sky-500/40 overflow-hidden">
          {/* Three.js Canvas Mount P1 */}
          <div ref={mountP1Ref} className="absolute inset-0 w-full h-full" />

          {/* Controls Hint Badge P1 */}
          <div className="absolute top-2 left-2 z-20 pointer-events-none bg-slate-900/80 border border-sky-400/30 px-2 py-0.5 rounded-lg text-[10px] text-sky-200">
            🎮 <strong>P1:</strong> W/A/S/D + Shift / Stik Analog
          </div>

          {/* Analog Stik & Boost Controls for P1 */}
          <TouchControls
            visible={!p1ActiveModal}
            onSteer={handleP1SteerTouch}
            onBoost={handleP1BoostTouch}
            side="both"
            accent="sky"
          />

          {/* Active Quiz Modal for P1 - Embedded directly in P1's split section without covering whole screen */}
          {p1ActiveModal && (
            <AnswerQuizModal
              compact
              accent="sky"
              scorePerCorrect={settings.scorePerCorrect}
              question={p1ActiveModal.question}
              questionIndex={p1ActiveModal.questionIndex}
              totalQuestions={p1Questions.length}
              gateLetter={p1ActiveModal.gateLetter}
              nextTheme={p1ActiveModal.nextTheme}
              onAnswerSubmitted={handleP1Answer}
              onProceedToNextTrack={handleP1Proceed}
            />
          )}

          {p1Finished && (
            <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="text-center p-4 rounded-2xl bg-slate-900 border border-sky-400/50">
                <span className="text-xs text-sky-300 font-bold block mb-1">P1 Selesai Terbang!</span>
                <span className="text-xl font-black text-amber-400">{p1Score} Poin</span>
                <p className="text-[11px] text-slate-400 mt-1">Menunggu Pemain 2 menyelesaikan penerbangan...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Half: Player 2 Viewport */}
        <div className="relative flex-1 h-1/2 md:h-full overflow-hidden">
          {/* Three.js Canvas Mount P2 */}
          <div ref={mountP2Ref} className="absolute inset-0 w-full h-full" />

          {/* Controls Hint Badge P2 */}
          <div className="absolute top-2 left-2 z-20 pointer-events-none bg-slate-900/80 border border-amber-400/30 px-2 py-0.5 rounded-lg text-[10px] text-amber-200">
            🎮 <strong>P2:</strong> Panah ↑/↓/←/→ + Spasi / Stik Analog
          </div>

          {/* Analog Stik & Boost Controls for P2 */}
          <TouchControls
            visible={!p2ActiveModal}
            onSteer={handleP2SteerTouch}
            onBoost={handleP2BoostTouch}
            side="both"
            accent="amber"
          />

          {/* Active Quiz Modal for P2 - Embedded directly in P2's split section without covering whole screen */}
          {p2ActiveModal && (
            <AnswerQuizModal
              compact
              accent="amber"
              scorePerCorrect={settings.scorePerCorrect}
              question={p2ActiveModal.question}
              questionIndex={p2ActiveModal.questionIndex}
              totalQuestions={p2Questions.length}
              gateLetter={p2ActiveModal.gateLetter}
              nextTheme={p2ActiveModal.nextTheme}
              onAnswerSubmitted={handleP2Answer}
              onProceedToNextTrack={handleP2Proceed}
            />
          )}

          {p2Finished && (
            <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="text-center p-4 rounded-2xl bg-slate-900 border border-amber-400/50">
                <span className="text-xs text-amber-300 font-bold block mb-1">P2 Selesai Terbang!</span>
                <span className="text-xl font-black text-amber-400">{p2Score} Poin</span>
                <p className="text-[11px] text-slate-400 mt-1">Menunggu Pemain 1 menyelesaikan penerbangan...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Over Podium Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 text-white text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center mx-auto shadow-xl">
              <Trophy className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs uppercase font-black tracking-widest text-amber-300 block">
                Hasil Balapan 2 Pemain
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                {winner === 'Hasil Seri!' ? '🤝 Pertandingan Berakhir Seri!' : `🏆 Pemenang: ${winner}!`}
              </h3>
            </div>

            {/* Score Comparison Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className={`p-3.5 rounded-2xl border ${p1Score >= p2Score ? 'bg-sky-500/15 border-sky-400/60 ring-2 ring-sky-400/30' : 'bg-slate-800/60 border-slate-700'}`}>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Pemain 1</span>
                <h4 className="text-sm font-black text-white truncate">{player1Name || 'Pemain 1'}</h4>
                <span className="text-2xl font-black text-sky-300 block mt-1">{p1Score}</span>
                <span className="text-[10px] text-slate-400">Poin Akhir</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${p2Score >= p1Score ? 'bg-amber-500/15 border-amber-400/60 ring-2 ring-amber-400/30' : 'bg-slate-800/60 border-slate-700'}`}>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Pemain 2</span>
                <h4 className="text-sm font-black text-white truncate">{player2Name || 'Pemain 2'}</h4>
                <span className="text-2xl font-black text-amber-300 block mt-1">{p2Score}</span>
                <span className="text-[10px] text-slate-400">Poin Akhir</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onExit}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Menu Utama</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
