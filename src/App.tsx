import { useEffect, useRef, useState } from 'react';
import { QuizTopic, Question, AnswerRecord, GameState, FlightDifficulty, LicenseType, GameMode } from './types/game';
import { DEFAULT_QUIZ_TOPIC, getActiveQuestions, saveActiveQuestions } from './data/quizData';
import { getGameSettings } from './data/settingsData';
import { FlightEngine } from './game/flightEngine';
import { soundEngine } from './game/audio';
import { EnvironmentTheme, THEME_CONFIGS } from './game/environment';
import { AircraftType } from './game/aircraft';
import { LandingPage } from './components/LandingPage';
import { ActivationModal } from './components/ActivationModal';
import { TwoPlayersScreen } from './components/TwoPlayersScreen';
import { QuestionOverlay } from './components/QuestionOverlay';
import { TouchControls } from './components/TouchControls';
import { BottomControlDock } from './components/BottomControlDock';
import { ReportModal } from './components/ReportModal';
import { CustomQuizModal } from './components/CustomQuizModal';
import { AnswerQuizModal } from './components/AnswerQuizModal';
import { Compass, ArrowLeft } from 'lucide-react';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<FlightEngine | null>(null);

  // License State (Full vs Demo)
  const [licenseType, setLicenseType] = useState<LicenseType>(() => {
    return (localStorage.getItem('skyquiz_license') as LicenseType) || 'DEMO';
  });
  const [showActivationModal, setShowActivationModal] = useState<boolean>(() => {
    return !localStorage.getItem('skyquiz_license');
  });

  // Settings / Question Manager Modal
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Game Lifecycle States
  const [gameState, setGameState] = useState<GameState>('START');
  const [gameMode, setGameMode] = useState<GameMode>('SINGLE');

  // Solo Player Configuration
  const [soloPlayerName, setSoloPlayerName] = useState<string>('Penerbang');
  const [difficulty, setDifficulty] = useState<FlightDifficulty>('EASY');
  const [selectedAircraftType, setSelectedAircraftType] = useState<AircraftType>('PROPELLER');

  // Two Players Configuration (Split Screen)
  const [twoPlayersConfig, setTwoPlayersConfig] = useState<{
    p1Name: string;
    p2Name: string;
    p1Plane: AircraftType;
    p2Plane: AircraftType;
  }>({
    p1Name: 'Pemain 1',
    p2Name: 'Pemain 2',
    p1Plane: 'JET',
    p2Plane: 'PROPELLER',
  });

  // Questions State
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(() => getActiveQuestions());

  // Solo Flight Stats
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(110);
  const [trackNotification, setTrackNotification] = useState<string | null>(null);

  // Active Quiz Modal in Solo Mode (Answer evaluation is hidden)
  const [activeQuizModal, setActiveQuizModal] = useState<{
    question: Question;
    questionIndex: number;
    totalQuestions: number;
    gateLetter: string;
    nextTheme: EnvironmentTheme;
  } | null>(null);

  // Solo Modals & Controls State
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [mouseControl, setMouseControl] = useState<boolean>(false);
  const [touchControlsVisible, setTouchControlsVisible] = useState<boolean>(true);

  // Handlers for License Activation
  const handleActivateFull = () => {
    setLicenseType('FULL');
    localStorage.setItem('skyquiz_license', 'FULL');
    setShowActivationModal(false);
  };

  const handleChooseDemo = () => {
    setLicenseType('DEMO');
    localStorage.setItem('skyquiz_license', 'DEMO');
    setShowActivationModal(false);
  };

  // Launch Solo Game langsung tanpa prompt nama
  const handleStartSoloGame = (playerName: string = 'Penerbang') => {
    setSoloPlayerName(playerName);
    setGameMode('SINGLE');

    if (!canvasMountRef.current) return;

    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setRecords([]);
    setActiveQuizModal(null);
    setTrackNotification(THEME_CONFIGS.beach.name);
    setTimeout(() => setTrackNotification(null), 3500);
    setGameState('PLAYING');

    const topicConfig: QuizTopic = {
      ...DEFAULT_QUIZ_TOPIC,
      questions: activeQuestions,
    };

    const currentSettings = getGameSettings();

    const engine = new FlightEngine(
      canvasMountRef.current,
      topicConfig,
      difficulty,
      selectedAircraftType,
      {
        onQuestionStart: (q, idx, total) => {
          setCurrentQuestion(q);
          setQuestionIndex(idx);
          setTotalQuestions(total);
          setActiveQuizModal(null);
        },
        onGatePierced: (q, idx, total, gateLetter, nextTheme) => {
          setActiveQuizModal({
            question: q,
            questionIndex: idx,
            totalQuestions: total,
            gateLetter,
            nextTheme,
          });
        },
        onGameComplete: (recs, finalScore, highestCombo) => {
          setRecords(recs);
          setScore(finalScore);
          setMaxCombo(highestCombo);
          setActiveQuizModal(null);
          setGameState('GAME_OVER');
        },
        onSpeedUpdate: (spd) => {
          setSpeed(spd);
        },
        onTrackChanged: (newTheme) => {
          const name = THEME_CONFIGS[newTheme]?.name || 'Lintasan Baru';
          setTrackNotification(`🌐 Memasuki ${name}`);
          setTimeout(() => setTrackNotification(null), 3500);
        },
      },
      'ALL',
      currentSettings.flightSpeed,
      currentSettings.boostMultiplier
    );

    engine.start();
    engineRef.current = engine;
  };

  // Launch Two Players Game (Split Screen) langsung tanpa prompt nama
  const handleStartTwoPlayersGame = (
    p1Name: string = 'Pemain 1',
    p2Name: string = 'Pemain 2',
    p1Plane: AircraftType = 'JET',
    p2Plane: AircraftType = 'PROPELLER'
  ) => {
    setTwoPlayersConfig({ p1Name, p2Name, p1Plane, p2Plane });
    setGameMode('TWO_PLAYERS');
    setGameState('PLAYING');
  };

  // Answer Submission in Solo Mode
  const handleAnswerSubmitted = (isCorrect: boolean, selectedIndex: number, scoreGained: number) => {
    const currentSettings = getGameSettings();
    let nextCombo = combo;

    if (isCorrect) {
      const bonus = combo * currentSettings.comboBonus;
      setScore((prev) => prev + scoreGained + bonus);
      nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
    } else {
      setScore((prev) => Math.max(0, prev - currentSettings.scorePenaltyWrong));
      nextCombo = 0;
      setCombo(0);
    }

    if (engineRef.current) {
      engineRef.current.recordAnswer(isCorrect, selectedIndex, scoreGained);
    }
  };

  const handleProceedToNextTrack = () => {
    setActiveQuizModal(null);
    if (engineRef.current) {
      engineRef.current.proceedToNextTrack();
    }
  };

  const handlePlayAgainSolo = () => {
    setGameState('PLAYING');
    setActiveQuizModal(null);
    handleStartSoloGame(soloPlayerName);
  };

  const handleBackToMenu = () => {
    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }
    setGameState('START');
    setActiveQuizModal(null);
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleMouseControl = () => {
    if (engineRef.current) {
      const active = engineRef.current.toggleMouseControl();
      setMouseControl(active);
    }
  };

  const handleSelectAircraftType = (type: AircraftType) => {
    setSelectedAircraftType(type);
    if (engineRef.current) {
      engineRef.current.setAircraftModel(type);
    }
  };

  const handleSteerTouch = (x: number, y: number) => {
    if (engineRef.current) {
      engineRef.current.setDirectSteering(x, y);
    }
  };

  const handleBoostTouch = (boosting: boolean) => {
    if (engineRef.current) {
      engineRef.current.setBoosting(boosting);
    }
  };

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. ACTIVATION POPUP (Muncul di awal sebelum landing page) */}
      <ActivationModal
        isOpen={showActivationModal}
        onActivateFull={handleActivateFull}
        onChooseDemo={handleChooseDemo}
        onClose={() => setShowActivationModal(false)}
      />

      {/* 2. LANDING PAGE (1 Pemain, 2 Pemain Layar Dibagi 2, Pengaturan) */}
      {gameState === 'START' && (
        <div className="absolute inset-0 z-20 overflow-y-auto">
          <LandingPage
            licenseType={licenseType}
            questions={activeQuestions}
            difficulty={difficulty}
            onSelectDifficulty={setDifficulty}
            selectedAircraftType={selectedAircraftType}
            onSelectAircraftType={handleSelectAircraftType}
            onOpenActivationModal={() => setShowActivationModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            onStartSinglePlayer={handleStartSoloGame}
            onStartTwoPlayers={handleStartTwoPlayersGame}
          />
        </div>
      )}

      {/* 3. TWO PLAYERS SPLIT SCREEN (Layar Dibagi 2, Soal Acak Tiap Pemain) */}
      {gameState === 'PLAYING' && gameMode === 'TWO_PLAYERS' && (
        <TwoPlayersScreen
          questions={activeQuestions}
          difficulty={difficulty}
          player1Name={twoPlayersConfig.p1Name}
          player2Name={twoPlayersConfig.p2Name}
          player1Aircraft={twoPlayersConfig.p1Plane}
          player2Aircraft={twoPlayersConfig.p2Plane}
          onExit={handleBackToMenu}
        />
      )}

      {/* 4. SINGLE PLAYER FLIGHT MODE */}
      <div
        ref={canvasMountRef}
        className={`absolute inset-0 w-full h-full z-0 transition-opacity duration-300 ${
          gameState === 'PLAYING' && gameMode === 'SINGLE'
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {gameState === 'PLAYING' && gameMode === 'SINGLE' && (
        <>
          {/* Top HUD */}
          <QuestionOverlay
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            topicTitle="Penerbangan Solo"
            score={score}
            combo={combo}
          />

          {/* Exit to Menu Button */}
          <div className="absolute top-20 right-4 z-30">
            <button
              type="button"
              onClick={handleBackToMenu}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-sky-300 border border-sky-400/40 text-xs font-black shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-md active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Menu Utama</span>
            </button>
          </div>

          {/* Track Entrance Notification */}
          {trackNotification && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-slate-900/90 text-sky-200 border border-sky-400/50 px-5 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>{trackNotification}</span>
              </div>
            </div>
          )}

          {/* Touch Controls: Virtual Analog Flight Stick & Boost */}
          <TouchControls
            visible={touchControlsVisible && !activeQuizModal}
            onSteer={handleSteerTouch}
            onBoost={handleBoostTouch}
            side="both"
            accent="sky"
          />

          {/* Bottom Dock - Center HUD */}
          <BottomControlDock
            speed={speed}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            mouseControl={mouseControl}
            onToggleMouseControl={handleToggleMouseControl}
            touchControlsVisible={touchControlsVisible}
            onToggleTouchControls={() => setTouchControlsVisible(!touchControlsVisible)}
            currentAircraftType={selectedAircraftType}
            onSelectAircraftType={handleSelectAircraftType}
            onExitGame={handleBackToMenu}
          />

          {/* Answering Menu (When plane pierces the round gate - answers hidden) */}
          {activeQuizModal && (
            <AnswerQuizModal
              question={activeQuizModal.question}
              questionIndex={activeQuizModal.questionIndex}
              totalQuestions={activeQuizModal.totalQuestions}
              gateLetter={activeQuizModal.gateLetter}
              nextTheme={activeQuizModal.nextTheme}
              scorePerCorrect={getGameSettings().scorePerCorrect}
              onAnswerSubmitted={handleAnswerSubmitted}
              onProceedToNextTrack={handleProceedToNextTrack}
            />
          )}
        </>
      )}

      {/* 5. Solo Game Over Report Modal (Answers hidden) */}
      {gameState === 'GAME_OVER' && gameMode === 'SINGLE' && (
        <ReportModal
          records={records}
          finalScore={score}
          maxCombo={maxCombo}
          topicTitle={`Penerbangan ${soloPlayerName}`}
          onPlayAgain={handlePlayAgainSolo}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {/* 6. Settings Modal (Edit Soal, Tambah Soal, Unduh Template & Impor Excel, Pengaturan Kecepatan & Skor) */}
      {showSettingsModal && (
        <CustomQuizModal
          onClose={() => setShowSettingsModal(false)}
          onSaved={(newTopic) => {
            setShowSettingsModal(false);
            setActiveQuestions(newTopic.questions);
            saveActiveQuestions(newTopic.questions);
          }}
        />
      )}
    </div>
  );
}
