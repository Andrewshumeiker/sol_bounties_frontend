'use client';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../components/providers/AuthProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { getToken } from '../services/auth';

type Bounty = {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  badgeKey: string;
  creatorId: string;
  status: string;
};

export default function BountiesPage() {
  const { user } = useAuth();
  const { connected } = useWallet();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    fetchBounties();
  }, []);

  async function fetchBounties() {
    try {
      const data = await api<Bounty[]>('bounties');
      // Only show published bounties
      setBounties(data.filter(b => b.status === 'PUBLISHED'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(bountyId: string) {
    if (!user) return;
    try {
      setApplying(bountyId);
      const token = getToken();
      await api(`bounties/${bountyId}/apply`, {
        method: 'POST',
        body: { content: 'Commander, I am ready to undertake this mission.' },
        token
      });
      alert('Application transmitted successfully!');
      fetchBounties();
    } catch (e: any) {
      alert(e.message || 'Transmission failed');
    } finally {
      setApplying(null);
    }
  }

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-black tracking-widest text-xl">SCANNING FOR OPEN MISSIONS...</div>;

  return (
    <div className="space-y-10">
      <header className="relative py-10 overflow-hidden rounded-3xl bg-black/40 border border-white/5 px-8">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
            Explore <span className="text-primary italic">Live Bounties</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Contribute to the Solana ecosystem, solve challenges, and earn exclusive soulbound badges that prove your digital prowess.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-none" />
      </header>
      
      {!connected && (
        <div className="p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl flex items-center justify-between gap-6 backdrop-blur-sm">
          <div>
            <h4 className="text-orange-200 font-bold mb-1">Restricted Access</h4>
            <p className="text-orange-200/60 text-sm">Synchronize your wallet to apply for active missions.</p>
          </div>
          <WalletMultiButton />
        </div>
      )}

      <div className="grid gap-6">
        {bounties.map(b => (
          <div key={b.id} className="group relative bg-black/40 p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 hover:border-primary/20 hover:bg-black/60 transition-all duration-300 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all duration-500" />
            
            <div className="flex-1">
               <div className="flex items-center gap-3 mb-3">
                  <span className="bg-primary/10 text-primary text-[10px] font-black tracking-widest px-3 py-1 rounded-full border border-primary/20">
                    {b.rewardAmount} SOL
                  </span>
                  {b.badgeKey && (
                    <span className="bg-purple-500/10 text-purple-300 text-[10px] font-black tracking-widest px-3 py-1 rounded-full border border-purple-500/20 flex items-center gap-1.5 uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {b.badgeKey.replace(/_/g, ' ')}
                    </span>
                  )}
               </div>
              <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors duration-300 mb-2">{b.title}</h3>
              <p className="text-white/40 leading-relaxed max-w-3xl">{b.description}</p>
            </div>
            
            <div className="shrink-0 w-full md:w-auto">
              <Link
                href={`/bounties/${b.id}`}
                className="inline-block w-full md:w-auto bg-primary hover:bg-primary/80 text-black px-10 py-4 rounded-xl font-black tracking-tighter hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_0_20px_rgba(46,230,166,0.2)] text-center"
              >
                VIEW MISSION
              </Link>
            </div>
          </div>
        ))}

        {bounties.length === 0 && (
           <div className="flex flex-col items-center justify-center py-32 bg-white/2 border border-dashed border-white/5 rounded-3xl">
             <div className="h-16 w-16 bg-white/5 rounded-full mb-6 flex items-center justify-center text-white/20 text-3xl">∅</div>
             <p className="text-white/30 font-bold tracking-widest uppercase text-sm">No Missions Detected in Local Sector</p>
           </div>
        )}
      </div>
    </div>
  );
}
