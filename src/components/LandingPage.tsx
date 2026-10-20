import React, { useState } from 'react';
import { FlightDifficulty, LicenseType, Question } from '../types/game';
import { AircraftType, AIRCRAFT_MODELS } from '../game/aircraft';
import { AirplaneCanvasPreview } from './AirplaneCanvasPreview';
import { Footer } from './Footer';
import {
  Plane,
  Swords,
  Settings,
  Play,
  Rocket,
  Compass,
  Sparkles,
  Lock,
  Key,
  User,
  CheckCircle2,
  X,
  Gauge,
  Flame,
  Shield,
  RotateCw,
} from 'lucide-react';

interface LandingPageProps {
  licenseType: LicenseType;
  questions: Question[];
  difficulty: FlightDifficulty;
  onSelectDifficulty: (d: FlightDifficulty) => void;
  selectedAircraftType: AircraftType;
  onSelectAircraftType: (type: AircraftType) => void;
  onOpenActivationModal: () => void;
  onOpenSettings: () => void;
  onStartSinglePlayer: (playerName?: string) => void;
  onStartTwoPlayers: (p1Name: string, p2Name: string, p1Plane: AircraftType, p2Plane: AircraftType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  licenseType,
  selectedAircraftType,
  onSelectAircraftType,
  onOpenActivationModal,
  onOpenSettings,
  onStartSinglePlayer,
  onStartTwoPlayers,
}) => {
  // Modal Pemilihan Wahana untuk Mode 2 Pemain
  const [showTwoPlayersVehicleModal, setShowTwoPlayersVehicleModal] = useState<boolean>(false);
  const [p1Vehicle, setP1Vehicle] = useState<AircraftType>('JET');
  const [p2Vehicle, setP2Vehicle] = useState<AircraftType>('PROPELLER');

  const renderVehicleIcon = (type: AircraftType, className = 'w-4 h-4') => {
    switch (type) {
      case 'JET':
        return <Rocket className={`${className} text-sky-400`} />;
      case 'HELICOPTER':
        return <Compass className={`${className} text-amber-400`} />;
      case 'SPACESHIP':
        return <Sparkles className={`${className} text-purple-400`} />;
      default:
        return <Plane className={`${className} text-rose-400`} />;
    }
  };

  // Aircraft Stats metadata for 3D showcase
  const getAircraftStats = (type: AircraftType) => {
    switch (type) {
      case 'JET':
        return {
          speedLabel: '98%',
          speedVal: 98,
          maneuverLabel: '90%',
          maneuverVal: 90,
          stabilityLabel: '82%',
          stabilityVal: 82,
          feature: 'Twin Jet Afterburners & Kecepatan Tinggi',
        };
      case 'HELICOPTER':
        return {
          speedLabel: '75%',
          speedVal: 75,
          maneuverLabel: '95%',
          maneuverVal: 95,
          stabilityLabel: '96%',
          stabilityVal: 96,
          feature: 'Baling-Baling Ganda & Kontrol Presisi Ekstrem',
        };
      case 'SPACESHIP':
        return {
          speedLabel: '95%',
          speedVal: 95,
          maneuverLabel: '88%',
          maneuverVal: 88,
          stabilityLabel: '92%',
          stabilityVal: 92,
          feature: 'Mesin Propulsi Ion & Aerodinamika Futuristik',
        };
      default: // PROPELLER
        return {
          speedLabel: '80%',
          speedVal: 80,
          maneuverLabel: '86%',
          maneuverVal: 86,
          stabilityLabel: '88%',
          stabilityVal: 88,
          feature: 'Baling-Baling Depan Klasik & Handling Seimbang',
        };
    }
  };

  const currentStats = getAircraftStats(selectedAircraftType);
  const currentModelInfo = AIRCRAFT_MODELS.find((m) => m.id === selectedAircraftType) || AIRCRAFT_MODELS[0];

  // Langsung terbang 1 pemain dengan wahana pilihan tanpa memasukkan nama
  const handleLaunchSoloDirect = () => {
    onStartSinglePlayer('Penerbang');
  };

  // Klik 2 pemain: buka modal pilih wahana jika sudah full version, atau aktivasi jika demo
  const handleOpenTwoPlayersSetup = () => {
    if (licenseType === 'DEMO') {
      onOpenActivationModal();
    } else {
      setShowTwoPlayersVehicleModal(true);
    }
  };

  const handleLaunchTwoPlayersConfirm = () => {
    setShowTwoPlayersVehicleModal(false);
    onStartTwoPlayers('Pemain 1', 'Pemain 2', p1Vehicle, p2Vehicle);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between font-sans select-none relative overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="w-full border-b border-sky-500/20 bg-slate-900/80 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 via-teal-400 to-amber-400 flex items-center justify-center text-slate-950 shadow-md shadow-sky-500/20">
            <Plane className="w-5 h-5 transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight text-white">SkyQuiz 3D</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full">
                Simulator Edukasi
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Simulasi Penerbangan 3D & Kuis Pembelajaran Interaktif
            </p>
          </div>
        </div>

        {/* License status pill & activation */}
        <div className="flex items-center gap-2">
          {licenseType === 'FULL' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Version Aktif</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenActivationModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Aktivasi Full Version"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Mode Demo • Aktivasi Full</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 flex flex-col justify-center space-y-6">
        {/* Intro Badge & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulasi Penerbangan 3D & Bank Soal Ujian Terintegrasi</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Petualangan Terbang & Belajar di{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-amber-300">
              Angkasa Bebas
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed">
            Kendalikan pesawat dengan stik analog responsif, tembus gerbang bulat di setiap lintasan, dan jawab soal ujian tanpa jeda.
          </p>
        </div>

        {/* 3D VEHICLE SHOWCASE SECTION (Ditampilkan Kembali di Halaman Utama) */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-sky-950/40 to-slate-900/95 border border-sky-500/35 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
          {/* Header Showcase */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-sky-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
                <RotateCw className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
                  Wahana Penerbangan 3D
                </h2>
                <p className="text-[11px] text-slate-400">
                  Pratinjau model 3D interaktif • Putar bebas & pilih wahana untuk terbang Solo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-300 bg-sky-500/15 border border-sky-400/30 px-3 py-1 rounded-full">
              <span>🖱️ Usap / Geser untuk Memutar 3D</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Left: 3D Interactive Canvas Preview */}
            <div className="lg:col-span-7 h-56 sm:h-64 md:h-72 w-full rounded-2xl bg-gradient-to-b from-sky-950/60 via-slate-900/90 to-slate-950 border border-sky-500/30 relative overflow-hidden flex items-center justify-center shadow-inner group">
              <AirplaneCanvasPreview aircraftType={selectedAircraftType} className="w-full h-full" />

              {/* Overlay Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-sky-400/40 px-3 py-1 rounded-xl text-xs font-black text-white shadow-lg">
                {renderVehicleIcon(selectedAircraftType, 'w-4 h-4')}
                <span>{currentModelInfo.name}</span>
              </div>

              <div className="absolute bottom-2.5 right-3 text-[10px] text-slate-400 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                <span>3D Real-time Model</span>
              </div>
            </div>

            {/* Right: Aircraft Selector Grid & Live Specs */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5">
              {/* Aircraft Switcher Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Pilih Model Wahana (1 Pemain):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {AIRCRAFT_MODELS.map((model) => {
                    const isSelected = selectedAircraftType === model.id;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => onSelectAircraftType(model.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-sky-500 to-teal-400 text-slate-950 border-white font-black shadow-lg shadow-sky-500/30 scale-[1.02]'
                            : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-sky-500/60 hover:bg-slate-800/80'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-xl shrink-0 ${
                            isSelected ? 'bg-slate-950 text-sky-400' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {renderVehicleIcon(model.id, 'w-4 h-4')}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold truncate block">
                            {model.name.replace('Pesawat ', '')}
                          </span>
                          <span
                            className={`text-[10px] truncate block ${
                              isSelected ? 'text-slate-900 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            {model.id === 'PROPELLER'
                              ? 'Klasik'
                              : model.id === 'JET'
                              ? 'Supersonik'
                              : model.id === 'HELICOPTER'
                              ? 'Taktis'
                              : 'Futuristik'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Stats Bars */}
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Gauge className="w-3.5 h-3.5 text-sky-400" />
                      Kecepatan & Daya Dorong
                    </span>
                    <span className="text-sky-300 font-mono">{currentStats.speedLabel}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-teal-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${currentStats.speedVal}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      Kelincahan Bermanuver
                    </span>
                    <span className="text-amber-300 font-mono">{currentStats.maneuverLabel}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${currentStats.maneuverVal}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      Kestabilan Meluncur
                    </span>
                    <span className="text-emerald-300 font-mono">{currentStats.stabilityLabel}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${currentStats.stabilityVal}%` }}
                    />
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-300 border-t border-slate-800 flex items-center gap-1">
                  <span className="text-amber-400">⚡</span>
                  <span className="truncate">{currentStats.feature}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Main Action Cards (1 Pemain, 2 Pemain, Pengaturan) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Mode 1 Pemain - Langsung terbang dengan wahana yang dipilih tanpa masukkan nama */}
          <div
            onClick={handleLaunchSoloDirect}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-sky-500/15 via-slate-900/90 to-slate-900 border border-sky-500/40 hover:border-sky-400 hover:shadow-2xl hover:shadow-sky-500/20 transition-all cursor-pointer group active:scale-[0.99] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 bg-sky-500/20 border border-sky-400/40 px-2.5 py-0.5 rounded-full">
                  Langsung Terbang
                </span>
              </div>

              <h3 className="text-xl font-black text-white group-hover:text-sky-300 transition-colors">
                1 Pemain (Solo)
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Langsung meluncur terbang solo di angkasa dengan wahana pilihanmu, kendali stik analog, dan jawab kuis tanpa jeda.
              </p>
            </div>

            <div className="pt-5 flex items-center justify-between text-xs font-bold text-sky-400">
              <span className="font-black text-white group-hover:text-sky-300">
                Terbang dengan {currentModelInfo.name.replace('Pesawat ', '')}!
              </span>
              <Play className="w-4 h-4 fill-sky-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Mode 2 Pemain (Split Screen) - Memberikan opsi memilih wahana tiap pemain sebelum mulai */}
          <div
            onClick={handleOpenTwoPlayersSetup}
            className={`p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer group active:scale-[0.99] flex flex-col justify-between ${
              licenseType === 'DEMO'
                ? 'bg-slate-900/60 border-slate-800 opacity-80 hover:opacity-100 hover:border-amber-500/40'
                : 'bg-gradient-to-br from-purple-500/15 via-slate-900/90 to-slate-900 border-purple-500/40 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-400 to-pink-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
                  <Swords className="w-6 h-6" />
                </div>
                {licenseType === 'DEMO' ? (
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Perlu Full
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 border border-purple-400/40 px-2.5 py-0.5 rounded-full">
                    Pilih Wahana & Balapan
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors">
                2 Pemain (Split Screen)
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Pilih wahana favorit masing-masing pemain, adu cepat di layar terbagi 2 dengan soal acak dan jawab mandiri di layarmu.
              </p>
            </div>

            <div className="pt-5 flex items-center justify-between text-xs font-bold text-purple-400">
              <span className="font-black text-white group-hover:text-purple-300">
                {licenseType === 'DEMO' ? 'Buka Kunci Fitur' : 'Pilih Wahana & Mulai 2P'}
              </span>
              {licenseType === 'DEMO' ? (
                <Lock className="w-4 h-4 text-amber-400" />
              ) : (
                <Play className="w-4 h-4 fill-purple-400 group-hover:translate-x-1 transition-transform" />
              )}
            </div>
          </div>

          {/* 3. Menu Pengaturan (Edit Soal, Excel, Kecepatan & Skor) */}
          <div
            onClick={() => {
              if (licenseType === 'DEMO') {
                onOpenActivationModal();
              } else {
                onOpenSettings();
              }
            }}
            className={`p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer group active:scale-[0.99] flex flex-col justify-between ${
              licenseType === 'DEMO'
                ? 'bg-slate-900/60 border-slate-800 opacity-80 hover:opacity-100 hover:border-amber-500/40'
                : 'bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-slate-900 border-amber-500/40 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
                  <Settings className="w-6 h-6" />
                </div>
                {licenseType === 'DEMO' ? (
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Perlu Full
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                    Kustomisasi
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                Menu Pengaturan
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Kelola bank soal ujian, impor & unduh template Excel, serta atur kecepatan terbang pesawat dan penilaian skor.
              </p>
            </div>

            <div className="pt-5 flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="font-black text-white group-hover:text-amber-300">
                {licenseType === 'DEMO' ? 'Buka Kunci Pengaturan' : 'Buka Pengaturan & Skor'}
              </span>
              <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* MODAL PEMILIHAN WAHANA 2 PEMAIN (SEBELUM MULAI) */}
      {showTwoPlayersVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in select-none overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl max-w-2xl w-full p-4 sm:p-6 text-white shadow-2xl space-y-4 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-400 shadow">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Pilih Wahana 2 Pemain</h3>
                  <p className="text-xs text-slate-400">Tentukan pesawat untuk Pemain 1 dan Pemain 2 sebelum balapan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTwoPlayersVehicleModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dua Kolom Pemilihan Wahana */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kolom Pemain 1 (Sisi Kiri) */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-sky-400/40 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-md border border-sky-400/30">
                    Pemain 1 (Kiri)
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">🎮 W/A/S/D + Shift / Stik</span>
                </div>

                {/* 3D Preview Pemain 1 */}
                <div className="h-32 rounded-xl bg-gradient-to-b from-sky-950/40 to-slate-900/90 border border-sky-500/20 relative overflow-hidden flex items-center justify-center shadow-inner">
                  <AirplaneCanvasPreview aircraftType={p1Vehicle} className="w-full h-full" />
                  <div className="absolute bottom-1 right-1.5 text-[9px] text-sky-300/80 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                    P1 3D
                  </div>
                </div>

                {/* Pilihan 4 Wahana Pemain 1 */}
                <div className="grid grid-cols-2 gap-1.5">
                  {AIRCRAFT_MODELS.map((m) => {
                    const isSelected = p1Vehicle === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setP1Vehicle(m.id)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-500 text-slate-950 border-sky-300 font-black shadow-md scale-[1.02]'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="p-1 rounded-lg bg-slate-950/50 shrink-0">
                          {renderVehicleIcon(m.id)}
                        </div>
                        <span className="text-[11px] font-bold truncate block">{m.name.replace('Pesawat ', '')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kolom Pemain 2 (Sisi Kanan) */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-amber-400/40 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                    Pemain 2 (Kanan)
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">🎮 Panah + Spasi / Stik</span>
                </div>

                {/* 3D Preview Pemain 2 */}
                <div className="h-32 rounded-xl bg-gradient-to-b from-amber-950/40 to-slate-900/90 border border-amber-500/20 relative overflow-hidden flex items-center justify-center shadow-inner">
                  <AirplaneCanvasPreview aircraftType={p2Vehicle} className="w-full h-full" />
                  <div className="absolute bottom-1 right-1.5 text-[9px] text-amber-300/80 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                    P2 3D
                  </div>
                </div>

                {/* Pilihan 4 Wahana Pemain 2 */}
                <div className="grid grid-cols-2 gap-1.5">
                  {AIRCRAFT_MODELS.map((m) => {
                    const isSelected = p2Vehicle === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setP2Vehicle(m.id)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md scale-[1.02]'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="p-1 rounded-lg bg-slate-950/50 shrink-0">
                          {renderVehicleIcon(m.id)}
                        </div>
                        <span className="text-[11px] font-bold truncate block">{m.name.replace('Pesawat ', '')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Notice split screen */}
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 text-center font-medium">
              ✨ Soal diacak mandiri untuk tiap pemain, jawab langsung di layar masing-masing tanpa menutup layar lawan!
            </div>

            {/* Launch Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLaunchTwoPlayersConfirm}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 hover:from-purple-400 hover:to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-500/25 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
              >
                <Swords className="w-4 h-4 fill-slate-950" />
                <span>Mulai Balapan 2 Pemain Sekarang!</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
