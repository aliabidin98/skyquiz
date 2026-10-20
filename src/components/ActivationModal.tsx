import React, { useState } from 'react';
import { Plane, Key, Sparkles, CheckCircle2, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { LicenseType } from '../types/game';

interface ActivationModalProps {
  isOpen: boolean;
  onActivateFull: () => void;
  onChooseDemo: () => void;
  onClose?: () => void;
}

export const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen,
  onActivateFull,
  onChooseDemo,
  onClose,
}) => {
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCodeForm, setShowCodeForm] = useState(false);

  if (!isOpen) return null;

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === 'TBRSKY') {
      setErrorMsg(null);
      onActivateFull();
    } else {
      setErrorMsg('Kode aktivasi salah. Silakan masukkan kode yang valid.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in select-none">
      <div className="bg-slate-900 border border-sky-500/40 rounded-3xl max-w-lg w-full p-5 sm:p-7 text-white shadow-2xl relative my-auto">
        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 via-teal-400 to-amber-400 text-slate-950 shadow-xl shadow-sky-500/20 mb-3">
            <Plane className="w-8 h-8 transform -rotate-45" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Aktivasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-amber-300">SkyQuiz 3D</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Pilih jenis lisensi untuk mengakses media pembelajaran penerbangan 3D interaktif
          </p>
        </div>

        {!showCodeForm ? (
          <div className="space-y-3.5">
            {/* 1. Option: Aktivasi Full */}
            <div
              onClick={() => setShowCodeForm(true)}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-800 to-slate-800/80 hover:border-amber-400 border border-amber-500/40 transition-all cursor-pointer shadow-lg hover:shadow-amber-500/15 group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-slate-950 shrink-0 group-hover:scale-105 transition-transform shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                      Aktivasi Full Version
                    </h3>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-full">
                      Semua Fitur
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Buka seluruh fitur: <strong>1 Pemain</strong>, <strong>2 Pemain (Layar Dibagi 2)</strong>, serta <strong>Menu Pengaturan & Impor Soal Excel</strong>.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* 2. Option: Menu Demo */}
            <div
              onClick={onChooseDemo}
              className="p-4 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-400 transition-all cursor-pointer shadow-md hover:shadow-sky-500/10 group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-700/80 flex items-center justify-center text-sky-300 shrink-0 group-hover:scale-105 transition-transform">
                  <Plane className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white group-hover:text-sky-300 transition-colors">
                      Menu Demo (Gratis)
                    </h3>
                    <span className="text-[10px] font-bold text-sky-300 bg-sky-500/10 border border-sky-400/30 px-2 py-0.5 rounded-full">
                      Uji Coba
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Masuk langsung untuk mencoba <strong>Mode 1 Pemain</strong> (Mode 2 Pemain & Pengaturan terkunci).
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        ) : (
          /* Form Input Kode Akses Full */
          <form onSubmit={handleVerifyCode} className="space-y-4 animate-in fade-in">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs text-amber-200">
                Masukkan kode aktivasi untuk membuka lisensi Full Version.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Kode Aktivasi:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  placeholder="Ketik kode aktivasi..."
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 pr-11 text-sm text-center uppercase tracking-widest font-black text-white focus:outline-none transition-all ${
                    errorMsg
                      ? 'border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/30'
                      : 'border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan' : 'Lihat'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorMsg && (
                <p className="text-[11px] text-rose-400 mt-1.5 text-center font-semibold">
                  {errorMsg}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowCodeForm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 text-xs font-black transition-all shadow-lg shadow-amber-500/20 cursor-pointer uppercase tracking-wider"
              >
                Aktivasi Sekarang
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
