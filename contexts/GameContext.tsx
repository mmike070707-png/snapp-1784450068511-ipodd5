import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@moonshiner_game_state';

interface GameState {
  coins: number;
  breweryLevels: Record<string, number>;
  trailerLevels: Record<string, number>;
  activityCooldowns: Record<string, number>; // ms timestamp when ready again
  totalEarned: number;
  totalSpent: number;
}

interface GameContextValue extends GameState {
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  upgradeItem: (section: 'brewery' | 'trailer', id: string, cost: number) => boolean;
  setActivityCooldown: (id: string, cooldownMs: number) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

const INITIAL_STATE: GameState = {
  coins: 150,
  breweryLevels: { still: 1, fermenter: 1, aging: 1, bottler: 1 },
  trailerLevels: { size: 1, furniture: 1, power: 1 },
  activityCooldowns: {},
  totalEarned: 150,
  totalSpent: 0,
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const saved: GameState = JSON.parse(raw);
        setState(prev => ({ ...prev, ...saved }));
      } catch {}
    });
  }, []);

  // Debounced save whenever state changes
  const saveState = useCallback((nextState: GameState) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }, 400);
  }, []);

  const setAndSave = useCallback((updater: (s: GameState) => GameState) => {
    setState(s => {
      const next = updater(s);
      saveState(next);
      return next;
    });
  }, [saveState]);

  const addCoins = useCallback((amount: number) => {
    setAndSave(s => ({
      ...s,
      coins: s.coins + amount,
      totalEarned: s.totalEarned + amount,
    }));
  }, [setAndSave]);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setAndSave(s => {
      if (s.coins >= amount) {
        success = true;
        return { ...s, coins: s.coins - amount, totalSpent: s.totalSpent + amount };
      }
      return s;
    });
    return success;
  }, [setAndSave]);

  const upgradeItem = useCallback((section: 'brewery' | 'trailer', id: string, cost: number): boolean => {
    let success = false;
    setAndSave(s => {
      if (s.coins < cost) return s;
      const levelsKey = section === 'brewery' ? 'breweryLevels' : 'trailerLevels';
      const currentLevel = s[levelsKey][id] ?? 1;
      if (currentLevel >= 5) return s;
      success = true;
      return {
        ...s,
        coins: s.coins - cost,
        totalSpent: s.totalSpent + cost,
        [levelsKey]: { ...s[levelsKey], [id]: currentLevel + 1 },
      };
    });
    return success;
  }, [setAndSave]);

  const setActivityCooldown = useCallback((id: string, cooldownMs: number) => {
    setAndSave(s => ({
      ...s,
      activityCooldowns: { ...s.activityCooldowns, [id]: Date.now() + cooldownMs },
    }));
  }, [setAndSave]);

  const value: GameContextValue = {
    ...state,
    addCoins,
    spendCoins,
    upgradeItem,
    setActivityCooldown,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
