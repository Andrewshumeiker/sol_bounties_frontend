'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, me, clearToken } from '../../services/auth';
import { usePathname, useRouter } from 'next/navigation';

type User = {
  id: string;
  username?: string;
  walletAddress: string;
  badges?: { key: string; name: string }[];
  reputation?: {
    totalScore: number;
    completedBounties: number;
    acceptanceRate: number;
    totalEarningsSol: number;
    badgeCount: number;
    penaltyPoints: number;
    tier: string;
  };
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    refreshUser();
  }, []);

  async function refreshUser() {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await me(token);
      setUser(u);
    } catch (e) {
      console.error('Session expired', e);
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearToken();
    setUser(null);
    router.push('/');
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
