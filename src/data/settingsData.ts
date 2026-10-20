export interface GameSettings {
  flightSpeed: number; // Base speed: 15 to 55 (default: 28)
  speedPreset: 'SLOW' | 'NORMAL' | 'FAST' | 'TURBO';
  boostMultiplier: number; // 1.2 to 2.0 (default: 1.55)
  scorePerCorrect: number; // Default 100
  scorePenaltyWrong: number; // Default 0
  comboBonus: number; // Default 20
}

export const DEFAULT_SETTINGS: GameSettings = {
  flightSpeed: 28,
  speedPreset: 'NORMAL',
  boostMultiplier: 1.55,
  scorePerCorrect: 100,
  scorePenaltyWrong: 0,
  comboBonus: 20,
};

const SETTINGS_KEY = 'skyquiz_game_settings';

export function getGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Gagal menyimpan pengaturan ke localStorage', err);
  }
}
