import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Gym } from '../api/gyms';
import { getMyGym } from '../api/gyms';

interface GymContextValue {
  gym: Gym | null;
  loading: boolean;
  refreshCount: number;
  refresh: () => Promise<Gym | null>;
  setGym: (gym: Gym | null) => void;
}

const GymContext = createContext<GymContextValue>({
  gym: null,
  loading: false,
  refreshCount: 0,
  refresh: async () => null,
  setGym: () => {},
});

export const GymProvider = ({ children }: { children: React.ReactNode }) => {
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const refresh = useCallback(async (): Promise<Gym | null> => {
    setLoading(true);
    try {
      const data = await getMyGym();
      setGym(data);
      return data;
    } catch {
      setGym(null);
      return null;
    } finally {
      setRefreshCount(c => c + 1);
      setLoading(false);
    }
  }, []);

  return (
    <GymContext.Provider value={{ gym, loading, refreshCount, refresh, setGym }}>
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => useContext(GymContext);
