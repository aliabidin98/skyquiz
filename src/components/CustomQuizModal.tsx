import React, { useState, useRef } from 'react';
import { QuizTopic, Question } from '../types/game';
import { saveCustomTopic } from '../data/quizData';
import { getGameSettings, saveGameSettings, GameSettings, DEFAULT_SETTINGS } from '../data/settingsData';
import {
  Plus,
  Trash2,
  X,
  Sparkles,
  Download,
  Upload,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Gauge,
  Trophy,
  Sliders,
  RotateCcw,
  Zap,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface CustomQuizModalProps {
  onClose: () => void;
  onSaved: (topic: QuizTopic) => void;
}

export const CustomQuizModal: React.FC<CustomQuizModalProps> = ({ onClose, onSaved }) => {
  const [activeTab, setActiveTab] = useState<'QUESTIONS' | 'SETTINGS'>('QUESTIONS');

  // Question Management State
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'custom-1',
      question: 'Berapakah hasil dari 25 x 4?',
      options: ['80', '100', '120', '150'],
      correctIndex: 1,
      explanation: '25 dikali 4 sama dengan 100.',
    },
    {
      id: 'custom-2',
      question: 'Planet terdekat dengan Matahari dalam tata surya adalah?',
      options: ['Venus', 'Bumi', 'Merkurius', 'Mars'],
      correctIndex: 2,
      explanation: 'Merkurius adalah planet terdekat dari Matahari.',
    },
  ]);

  // Speed and Score Settings State
  const [settings, setSettings] = useState<GameSettings>(() => getGameSettings());
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string | null>(null);

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}-${prev.length + 1}`,
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index].question = text;
      return updated;
    });
  };

  const updateOption = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options[optIndex] = text;
      return updated;
    });
  };

  const updateCorrectIndex = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].correctIndex = optIndex;
      return updated;
    });
  };

  // Unduh Template Excel (.xlsx)
  const handleDownloadExcelTemplate = () => {
    const templateData = [
      {
        'No': 1,
        'Pertanyaan': 'Berapakah hasil dari 15 x 6?',
        'Pilihan A': '70',
        'Pilihan B': '85',
        'Pilihan C': '90',
        'Pilihan D': '95',
        'Kunci Jawaban (A/B/C/D)': 'C',
      },
      {
        'No': 2,
        'Pertanyaan': 'Organ tubuh manusia yang berfungsi memompa darah adalah?',
        'Pilihan A': 'Paru-paru',
        'Pilihan B': 'Jantung',
        'Pilihan C': 'Hati',
        'Pilihan D': 'Ginjal',
        'Kunci Jawaban (A/B/C/D)': 'B',
      },
      {
        'No': 3,
        'Pertanyaan': 'Ibukota negara Indonesia saat ini adalah?',
        'Pilihan A': 'Jakarta',
        'Pilihan B': 'Surabaya',
        'Pilihan C': 'Medan',
        'Pilihan D': 'Bandung',
        'Kunci Jawaban (A/B/C/D)': 'A',
      },
      {
        'No': 4,
        'Pertanyaan': 'What is the opposite of "Fast"?',
        'Pilihan A': 'Quick',
        'Pilihan B': 'Slow',
        'Pilihan C': 'Loud',
        'Pilihan D': 'Heavy',
        'Kunci Jawaban (A/B/C/D)': 'B',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 50 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 26 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Soal_Kuis');
    XLSX.writeFile(workbook, 'Template_Soal_SkyQuiz.xlsx');

    setImportStatus('Template Excel berhasil diunduh! Silakan isi lalu impor.');
    setTimeout(() => setImportStatus(null), 4000);
  };

  // Unduh Template CSV (.csv)
  const handleDownloadCsvTemplate = () => {
    const csvContent =
      'No,Pertanyaan,Pilihan A,Pilihan B,Pilihan C,Pilihan D,Kunci Jawaban (A/B/C/D)\n' +
      '1,Berapakah hasil dari 15 x 6?,70,85,90,95,C\n' +
      '2,Organ tubuh pemompa darah?,Paru-paru,Jantung,Hati,Ginjal,B\n' +
      '3,Ibukota Indonesia?,Jakarta,Surabaya,Medan,Bandung,A\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Soal_SkyQuiz.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setImportStatus('Template CSV berhasil diunduh!');
    setTimeout(() => setImportStatus(null), 4000);
  };

  // Parsing Berkas Excel / CSV
  const processUploadedFile = (file: File) => {
    setErrorMessage(null);
    setImportStatus(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!jsonData || jsonData.length === 0) {
          setErrorMessage('Berkas Excel kosong atau format tidak sesuai.');
          return;
        }

        const parsedQuestions: Question[] = [];

        jsonData.forEach((row, index) => {
          const keys = Object.keys(row);

          const qKey = keys.find((k) => /pertanyaan|soal|question/i.test(k));
          const optAKey = keys.find((k) => /pilihan\s*a|opsi\s*a|opt\s*a|^a$/i.test(k));
          const optBKey = keys.find((k) => /pilihan\s*b|opsi\s*b|opt\s*b|^b$/i.test(k));
          const optCKey = keys.find((k) => /pilihan\s*c|opsi\s*c|opt\s*c|^c$/i.test(k));
          const optDKey = keys.find((k) => /pilihan\s*d|opsi\s*d|opt\s*d|^d$/i.test(k));
          const keyAnswerKey = keys.find((k) => /kunci|jawaban|correct|answer/i.test(k));

          const questionText = qKey ? String(row[qKey]).trim() : '';
          const optA = optAKey ? String(row[optAKey]).trim() : '';
          const optB = optBKey ? String(row[optBKey]).trim() : '';
          const optC = optCKey ? String(row[optCKey]).trim() : '';
          const optD = optDKey ? String(row[optDKey]).trim() : '';
          const rawAnswer = keyAnswerKey ? String(row[keyAnswerKey]).trim().toUpperCase() : 'A';

          if (!questionText || !optA || !optB) {
            return;
          }

          let correctIdx = 0;
          if (rawAnswer === 'B' || rawAnswer === '1') correctIdx = 1;
          else if (rawAnswer === 'C' || rawAnswer === '2') correctIdx = 2;
          else if (rawAnswer === 'D' || rawAnswer === '3') correctIdx = 3;

          parsedQuestions.push({
            id: `import-${Date.now()}-${index}`,
            question: questionText,
            options: [optA, optB, optC || '-', optD || '-'],
            correctIndex: correctIdx,
            explanation: `Kunci Jawaban: ${['A', 'B', 'C', 'D'][correctIdx]}`,
          });
        });

        if (parsedQuestions.length === 0) {
          setErrorMessage(
            'Tidak ada soal yang valid ditemukan. Pastikan kolom: Pertanyaan, Pilihan A, Pilihan B, Pilihan C, Pilihan D, Kunci Jawaban'
          );
          return;
        }

        setQuestions(parsedQuestions);
        setImportStatus(`Berhasil mengimpor ${parsedQuestions.length} soal dari Excel!`);
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err) {
        console.error(err);
        setErrorMessage('Gagal memproses berkas. Pastikan file berformat Excel (.xlsx, .xls) atau CSV.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Speed Preset Selector
  const handleSelectSpeedPreset = (preset: 'SLOW' | 'NORMAL' | 'FAST' | 'TURBO') => {
    const speeds = {
      SLOW: 20,
      NORMAL: 28,
      FAST: 36,
      TURBO: 48,
    };
    setSettings((prev) => ({
      ...prev,
      speedPreset: preset,
      flightSpeed: speeds[preset],
    }));
  };

  // Save Settings Handlers
  const handleSaveSettings = () => {
    saveGameSettings(settings);
    setSettingsSavedMessage('Pengaturan kecepatan & skor berhasil disimpan!');
    setTimeout(() => setSettingsSavedMessage(null), 3000);
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    saveGameSettings(DEFAULT_SETTINGS);
    setSettingsSavedMessage('Pengaturan dikembalikan ke nilai bawaan.');
    setTimeout(() => setSettingsSavedMessage(null), 3000);
  };

  const handleSaveAndLaunch = (e: React.FormEvent) => {
    e.preventDefault();

    // Also persist game settings
    saveGameSettings(settings);

    const validQuestions = questions.filter(
      (q) => q.question.trim() !== '' && q.options.some((o) => o.trim() !== '')
    );

    if (validQuestions.length === 0) {
      setErrorMessage('Minimal harus ada 1 soal yang lengkap.');
      return;
    }

    const newTopic: QuizTopic = {
      id: `custom-topic-${Date.now()}`,
      title: 'Soal Kuis Ujian',
      description: 'Kuis kustom yang disimpan dari Menu Pengaturan',
      icon: 'Plane',
      theme: 'beach',
      questions: validQuestions,
    };

    saveCustomTopic(newTopic);
    onSaved(newTopic);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-slate-900 border border-sky-500/40 rounded-3xl max-w-3xl w-full p-4 sm:p-6 text-white shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-teal-400 to-amber-400 flex items-center justify-center text-slate-950 shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Menu Pengaturan Game</h2>
              <p className="text-xs text-slate-400">Atur Bank Soal Ujian, Excel, serta Kecepatan Terbang & Skor</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('QUESTIONS')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'QUESTIONS'
                ? 'bg-sky-500 text-slate-950 shadow-md font-black shadow-sky-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/80'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bank Soal & Excel ({questions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'SETTINGS'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/80'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Pengaturan Kecepatan & Skor</span>
          </button>
        </div>

        {/* TAB 1: BANK SOAL & EXCEL */}
        {activeTab === 'QUESTIONS' && (
          <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-3 custom-scrollbar">
            {/* Excel Download & Upload Dock */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-3.5 rounded-2xl border transition-all ${
                isDragOver
                  ? 'bg-sky-500/20 border-sky-400 ring-2 ring-sky-400/40'
                  : 'bg-slate-800/70 border-slate-700/90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4" />
                    Impor & Unduh Template Excel:
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Tarik berkas Excel/CSV ke sini, atau gunakan tombol di samping:
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadExcelTemplate}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-950 text-sky-300 hover:text-white rounded-xl border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Unduh format tabel Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Template Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCsvTemplate}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-950 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Unduh format teks CSV"
                  >
                    <span>.CSV</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Impor File</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback Messages */}
            {importStatus && (
              <div className="p-2.5 bg-emerald-950/70 border border-emerald-400/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{importStatus}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-2.5 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Questions List Header */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Daftar Soal Aktif ({questions.length})
              </span>

              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Soal</span>
              </button>
            </div>

            {/* Question Cards List */}
            <div className="space-y-3">
              {questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-md">
                      Pertanyaan #{qIndex + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Pilih radio untuk jawaban benar:</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          title="Hapus soal ini"
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder={`Tulis pertanyaan #${qIndex + 1}...`}
                    value={q.question}
                    onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-semibold placeholder-slate-500"
                  />

                  {/* 4 Choices */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map((letter, optIndex) => (
                      <div
                        key={letter}
                        className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all ${
                          q.correctIndex === optIndex
                            ? 'bg-emerald-950/70 border-emerald-400 ring-1 ring-emerald-400/40 text-emerald-200'
                            : 'bg-slate-900/60 border-slate-700/80 text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctIndex === optIndex}
                          onChange={() => updateCorrectIndex(qIndex, optIndex)}
                          className="accent-emerald-400 w-4 h-4 cursor-pointer ml-1"
                          title="Klik untuk menandai pilihan ini sebagai jawaban benar"
                        />
                        <span className="text-xs font-black text-sky-400">{letter}.</span>
                        <input
                          type="text"
                          required
                          placeholder={`Pilihan ${letter}`}
                          value={q.options[optIndex]}
                          onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                          className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-500 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PENGATURAN KECEPATAN & SKOR */}
        {activeTab === 'SETTINGS' && (
          <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-4 custom-scrollbar">
            {settingsSavedMessage && (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-400/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{settingsSavedMessage}</span>
              </div>
            )}

            {/* 1. Pengaturan Kecepatan Pesawat */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Pengaturan Kecepatan Terbang</h3>
                    <p className="text-[11px] text-slate-400">Atur laju jelajah dan sensitivitas wahana pesawat</p>
                  </div>
                </div>

                <div className="px-3 py-1 bg-sky-500/15 border border-sky-400/40 rounded-full text-xs font-black text-sky-300">
                  {settings.flightSpeed} km/jam
                </div>
              </div>

              {/* Speed Preset Buttons */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Preset Kecepatan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'SLOW', label: '🐢 Santai', speed: 20 },
                      { id: 'NORMAL', label: '✈️ Standar', speed: 28 },
                      { id: 'FAST', label: '⚡ Cepat', speed: 36 },
                      { id: 'TURBO', label: '🚀 Turbo', speed: 48 },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectSpeedPreset(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        settings.speedPreset === p.id && settings.flightSpeed === p.speed
                          ? 'bg-sky-500 text-slate-950 border-sky-400 font-black shadow-md'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xs font-bold block">{p.label}</span>
                      <span className="text-[10px] opacity-80">{p.speed} km/jam</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Kecepatan Custom:</span>
                  <span className="font-mono font-bold text-sky-400">{settings.flightSpeed} km/jam</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="55"
                  step="1"
                  value={settings.flightSpeed}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSettings((prev) => ({
                      ...prev,
                      flightSpeed: val,
                      speedPreset:
                        val <= 22 ? 'SLOW' : val <= 32 ? 'NORMAL' : val <= 42 ? 'FAST' : 'TURBO',
                    }));
                  }}
                  className="w-full accent-sky-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>15 km/jam (Sangat Santai)</span>
                  <span>35 km/jam</span>
                  <span>55 km/jam (Sangat Cepat)</span>
                </div>
              </div>

              {/* Turbo Boost Multiplier */}
              <div className="pt-2 border-t border-slate-700/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Kelipatan Akselerasi Turbo Boost:
                  </span>
                  <span className="font-bold text-amber-300">{settings.boostMultiplier}x</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1.3, 1.55, 1.75, 2.0].map((mult) => (
                    <button
                      key={mult}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, boostMultiplier: mult }))}
                      className={`py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        settings.boostMultiplier === mult
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {mult}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Pengaturan Skor & Penilaian */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Pengaturan Skor & Penilaian</h3>
                  <p className="text-[11px] text-slate-400">Atur pembagian poin jawaban benar, penalti, dan bonus streak</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Poin Jawaban Benar */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1.5">
                  <label className="block text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Poin Jawaban Benar:
                  </label>
                  <select
                    value={settings.scorePerCorrect}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, scorePerCorrect: Number(e.target.value) }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold cursor-pointer focus:outline-none focus:border-emerald-400"
                  >
                    <option value="50">+50 Poin</option>
                    <option value="100">+100 Poin (Default)</option>
                    <option value="150">+150 Poin</option>
                    <option value="200">+200 Poin</option>
                    <option value="500">+500 Poin</option>
                  </select>
                </div>

                {/* Penalti Jawaban Salah */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1.5">
                  <label className="block text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                    Penalti Jawaban Salah:
                  </label>
                  <select
                    value={settings.scorePenaltyWrong}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, scorePenaltyWrong: Number(e.target.value) }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold cursor-pointer focus:outline-none focus:border-rose-400"
                  >
                    <option value="0">0 (Tanpa Pengurangan)</option>
                    <option value="10">-10 Poin</option>
                    <option value="25">-25 Poin</option>
                    <option value="50">-50 Poin</option>
                  </select>
                </div>

                {/* Bonus Combo Streak */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1.5">
                  <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Bonus Combo Streak:
                  </label>
                  <select
                    value={settings.comboBonus}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, comboBonus: Number(e.target.value) }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold cursor-pointer focus:outline-none focus:border-amber-400"
                  >
                    <option value="0">Tanpa Bonus Combo</option>
                    <option value="10">+10 Poin / Streak</option>
                    <option value="20">+20 Poin / Streak (Default)</option>
                    <option value="50">+50 Poin / Streak</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons for Settings */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Pengaturan</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0 mt-2">
          <span className="text-[11px] text-slate-400">
            {activeTab === 'QUESTIONS'
              ? `Total ${questions.length} soal siap dimainkan`
              : `Kecepatan: ${settings.flightSpeed} km/j • Skor: +${settings.scorePerCorrect}`}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSaveAndLaunch}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 hover:from-sky-300 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-sky-500/25 cursor-pointer uppercase tracking-wider active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simpan & Terapkan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
