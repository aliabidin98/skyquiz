import React, { useState, useRef, useEffect } from 'react';
import { Rocket } from 'lucide-react';

interface TouchControlsProps {
  onSteer: (x: number, y: number) => void;
  onBoost: (boosting: boolean) => void;
  visible: boolean;
  side?: 'left' | 'right' | 'both';
  accent?: 'sky' | 'amber' | 'purple';
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onSteer,
  onBoost,
  visible,
  side = 'both',
  accent = 'sky',
}) => {
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);

  const baseRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);

  // Maximum travel radius for the analog stick knob in pixels
  const MAX_RADIUS = 38;

  // Cleanup steering on unmount or when visibility is toggled off
  useEffect(() => {
    if (!visible) {
      setKnobPos({ x: 0, y: 0 });
      setIsDragging(false);
      onSteer(0, 0);
      onBoost(false);
    }
  }, [visible, onSteer, onBoost]);

  if (!visible) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!baseRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    pointerIdRef.current = e.pointerId;
    baseRef.current.setPointerCapture(e.pointerId);
    setIsDragging(true);

    updateStickPosition(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || pointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    updateStickPosition(e.clientX, e.clientY);
  };

  const updateStickPosition = (clientX: number, clientY: number) => {
    if (!baseRef.current) return;

    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let clampedX = dx;
    let clampedY = dy;

    if (distance > MAX_RADIUS) {
      clampedX = (dx / distance) * MAX_RADIUS;
      clampedY = (dy / distance) * MAX_RADIUS;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    // Normalized steer vector (-1 to 1)
    // dy is inverted so dragging stick UP produces positive Y (aircraft pitch up)
    const normX = Math.max(-1, Math.min(1, clampedX / MAX_RADIUS));
    const normY = Math.max(-1, Math.min(1, -clampedY / MAX_RADIUS));

    onSteer(normX, normY);
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current === e.pointerId) {
      e.preventDefault();
      try {
        baseRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if capture was lost
      }
      pointerIdRef.current = null;
      setIsDragging(false);
      setKnobPos({ x: 0, y: 0 });
      onSteer(0, 0);
    }
  };

  const accentStyles = {
    sky: {
      border: 'border-sky-400/50',
      glow: 'shadow-sky-500/20',
      knob: 'from-sky-400 via-sky-500 to-teal-500 border-sky-300',
      reticle: 'text-sky-400/40',
      activeRing: 'border-sky-400 ring-2 ring-sky-400/40',
      label: 'text-sky-300',
    },
    amber: {
      border: 'border-amber-400/50',
      glow: 'shadow-amber-500/20',
      knob: 'from-amber-400 via-amber-500 to-orange-500 border-amber-300',
      reticle: 'text-amber-400/40',
      activeRing: 'border-amber-400 ring-2 ring-amber-400/40',
      label: 'text-amber-300',
    },
    purple: {
      border: 'border-purple-400/50',
      glow: 'shadow-purple-500/20',
      knob: 'from-purple-400 via-purple-500 to-pink-500 border-purple-300',
      reticle: 'text-purple-400/40',
      activeRing: 'border-purple-400 ring-2 ring-purple-400/40',
      label: 'text-purple-300',
    },
  }[accent];

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none flex justify-between items-end p-3 sm:p-5">
      {/* 1. ANALOG FLIGHT STIK (Bottom-Left) */}
      {(side === 'left' || side === 'both') && (
        <div className="pointer-events-auto flex flex-col items-center gap-1.5 touch-none mb-1">
          <div
            ref={baseRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUpOrCancel}
            onPointerCancel={handlePointerUpOrCancel}
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900/80 backdrop-blur-md border-2 ${
              isDragging ? accentStyles.activeRing : accentStyles.border
            } shadow-2xl ${accentStyles.glow} flex items-center justify-center cursor-grab active:cursor-grabbing touch-none`}
            title="Stik Analog: Geser untuk mengemudikan pesawat"
          >
            {/* Crosshair & Reticle Lines */}
            <div className={`absolute inset-x-3 top-1/2 -translate-y-1/2 h-px bg-current ${accentStyles.reticle} pointer-events-none`} />
            <div className={`absolute inset-y-3 left-1/2 -translate-x-1/2 w-px bg-current ${accentStyles.reticle} pointer-events-none`} />

            {/* Inner guideline concentric circle */}
            <div className="absolute w-16 h-16 sm:w-18 sm:h-18 rounded-full border border-white/10 pointer-events-none" />

            {/* Direction hints */}
            <span className={`absolute top-1 text-[9px] font-black ${accentStyles.reticle} pointer-events-none`}>▲</span>
            <span className={`absolute bottom-1 text-[9px] font-black ${accentStyles.reticle} pointer-events-none`}>▼</span>
            <span className={`absolute left-1.5 text-[9px] font-black ${accentStyles.reticle} pointer-events-none`}>◀</span>
            <span className={`absolute right-1.5 text-[9px] font-black ${accentStyles.reticle} pointer-events-none`}>▶</span>

            {/* Draggable Analog Stick Knob */}
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr ${accentStyles.knob} border-2 shadow-xl flex items-center justify-center pointer-events-none transition-transform ${
                isDragging ? 'scale-105 duration-0' : 'duration-200 ease-out'
              }`}
              style={{
                transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
              }}
            >
              {/* Inner grip texture / tactile ring */}
              <div className="w-5 h-5 rounded-full bg-slate-950/40 border border-white/40 shadow-inner flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/70" />
              </div>
            </div>
          </div>

          <span className={`text-[10px] font-black uppercase tracking-wider ${accentStyles.label} bg-slate-950/70 px-2 py-0.5 rounded-full border border-slate-800`}>
            🕹️ Stik Analog
          </span>
        </div>
      )}

      {/* 2. TURBO BOOST BUTTON (Bottom-Right) */}
      {(side === 'right' || side === 'both') && (
        <div className="pointer-events-auto flex flex-col items-center gap-1.5 touch-none mb-1">
          <button
            type="button"
            aria-label="Turbo Boost"
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-400 text-white flex flex-col items-center justify-center gap-0.5 shadow-2xl border-2 border-amber-300/80 active:scale-90 transition-all cursor-pointer touch-none ${
              isBoosting ? 'ring-4 ring-amber-400/50 scale-95 shadow-amber-500/50' : ''
            }`}
            onPointerDown={(e) => {
              e.preventDefault();
              setIsBoosting(true);
              onBoost(true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setIsBoosting(false);
              onBoost(false);
            }}
            onPointerCancel={() => {
              setIsBoosting(false);
              onBoost(false);
            }}
          >
            <Rocket className="w-6 h-6 animate-pulse" />
            <span className="text-[9px] font-black tracking-widest uppercase">TURBO</span>
          </button>

          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-slate-950/70 px-2 py-0.5 rounded-full border border-slate-800">
            ⚡ Boost
          </span>
        </div>
      )}
    </div>
  );
};
