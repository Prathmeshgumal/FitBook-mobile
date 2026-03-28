import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Gym } from '../api/gyms';
import { getMyGym } from '../api/gyms';

interface GymContextValue {
  gym: Gym | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setGym: (gym: Gym | null) => void;
}

const GymContext = createContext<GymContextValue>({
  gym: null,
  loading: false,
  refresh: async () => {},
  setGym: () => {},
});

export const GymProvider = ({ children }: { children: React.ReactNode }) => {
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyGym();
      setGym(data);
    } catch {
      setGym(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <GymContext.Provider value={{ gym, loading, refresh, setGym }}>
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => useContext(GymContext);
