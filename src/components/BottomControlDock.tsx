import React, { useState } from 'react';
import { Volume2, VolumeX, MousePointer, Gamepad2, HelpCircle, ChevronDown, ChevronUp, Gauge, LogOut } from 'lucide-react';
import { AircraftType } from '../game/aircraft';

interface BottomControlDockProps {
  speed: number;
  isMuted: boolean;
  onToggleMute: () => void;
  mouseControl: boolean;
  onToggleMouseControl: () => void;
  touchControlsVisible: boolean;
  onToggleTouchControls: () => void;
  currentAircraftType?: AircraftType;
  onSelectAircraftType?: (type: AircraftType) => void;
  onExitGame: () => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  speed,
  isMuted,
  onToggleMute,
  mouseControl,
  onToggleMouseControl,
  touchControlsVisible,
  onToggleTouchControls,
  onExitGame,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center max-w-[220px] sm:max-w-md md:max-w-2xl w-full transition-transform duration-300 select-none pointer-events-none">
        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="pointer-events-auto mb-1 px-2.5 py-0.5 bg-slate-900/90 hover:bg-slate-800 text-sky-200 hover:text-white rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1 shadow-lg border border-sky-500/30 transition-all cursor-pointer backdrop-blur-sm"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3" />
              <span>HUD</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              <span>Tutup HUD</span>
            </>
          )}
        </button>

        {/* Main Dock Container */}
        <div
          className={`pointer-events-auto w-full bg-slate-900/90 text-white rounded-2xl shadow-2xl border border-sky-500/25 px-2.5 sm:px-4 py-1.5 sm:py-2 backdrop-blur-md flex items-center justify-between gap-1.5 sm:gap-2 transition-all duration-300 ${
            isCollapsed ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
        >
          {/* Left: Speedometer & Flight Keys */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <Gauge className="w-4 h-4 text-sky-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">Kecepatan</span>
                <span className="text-sm font-black text-sky-200 leading-none">{speed} km/h</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800/50 px-2.5 py-1.5 rounded-xl">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-sky-300 font-mono text-[10px]">A</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-sky-300 font-mono text-[10px]">D</kbd>
              <span>/</span>
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-sky-300 font-mono text-[10px]">W</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-sky-300 font-mono text-[10px]">S</kbd>
              <span className="ml-1 text-slate-400">Kemudi</span>
              <span className="mx-1.5 text-slate-600">|</span>
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-amber-300 font-mono text-[10px]">SPASI</kbd>
              <span className="ml-1 text-slate-400">Turbo</span>
            </div>
          </div>

          {/* Right: Controls (Model wahana disembunyikan saat terbang) */}
          <div className="flex items-center gap-2">

            {/* Mouse Steer Toggle */}
            <button
              type="button"
              onClick={onToggleMouseControl}
              title={mouseControl ? 'Kendali Mouse Aktif' : 'Aktifkan Kemudi Mouse'}
              className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                mouseControl
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700/60'
              }`}
            >
              <MousePointer className="w-4 h-4" />
              <span className="hidden sm:inline">Mouse</span>
            </button>

            {/* Touch D-Pad Toggle */}
            <button
              type="button"
              onClick={onToggleTouchControls}
              title={touchControlsVisible ? 'Sembunyikan Tombol Layar' : 'Tampilkan Tombol Layar'}
              className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                touchControlsVisible
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700/60'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Tombol</span>
            </button>

            {/* Sound Mute Toggle */}
            <button
              type="button"
              onClick={onToggleMute}
              title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            </button>

            {/* Help / Guide */}
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              title="Panduan Bermain"
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
            </button>

            {/* Exit to Menu */}
            <button
              type="button"
              onClick={onExitGame}
              title="Ganti Topik / Keluar"
              className="p-2 bg-rose-500/20 hover:bg-rose-500/40 rounded-xl text-rose-300 hover:text-white border border-rose-500/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-950/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-none">
          <div className="bg-slate-900 border border-sky-500/40 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl">
            <h3 className="text-xl font-black text-sky-400 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              Panduan Pilot Siswa
            </h3>
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>
                1. <strong>Terbang Menjelajah:</strong> Pesawatmu meluncur otomatis melewati pemandangan 3D (pantai, kota, pelangi, antariksa, antartika).
              </p>
              <p>
                2. <strong>Tembus Gerbang:</strong> Arahkan pesawatmu menembus salah satu gerbang portal bulat (A, B, C, D) di depan.
              </p>
              <p>
                3. <strong>Jawab Soal:</strong> Saat gerbang ditembus, menu pertanyaan akan terbuka untukmu menjawab soal kuis secara interaktif!
              </p>
              <p>
                4. <strong>Lintasan Baru:</strong> Setelah menjawab, pesawat akan langsung berpindah ke lintasan pemandangan baru berikutnya!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg cursor-pointer"
            >
              Mengerti & Lanjutkan
            </button>
          </div>
        </div>
      )}
    </>
  );
};
