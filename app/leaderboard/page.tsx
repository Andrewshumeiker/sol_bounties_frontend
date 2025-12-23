'use client';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import Panel from '../components/Panel';
import Badge from '../components/Badge';

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      const data = await api<any[]>('users/leaderboard');
      setUsers(data);
    } catch (e) {
      console.error('Failed to fetch leaderboard', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-20 text-center animate-pull text-primary font-black tracking-widest text-xl uppercase">Calculating Rankings...</div>;

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
         <h1 className="text-5xl font-black italic tracking-tighter text-white">THE <span className="text-primary underline decoration-primary/30 underline-offset-8">BOARD</span></h1>
         <p className="text-white/40 uppercase text-[10px] tracking-[0.5em] font-bold">Top Verified Developers & Designers</p>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
         {users.map((user, index) => {
           const earnings = Number(user.reputation?.totalEarningsSol || 0);
           const completed = Number(user.reputation?.completedBounties || 0);
           const displayEarnings = earnings > 0 ? earnings.toFixed(2) : (completed * 0.5).toFixed(1);

           return (
             <div 
              key={user.id} 
              className={`group relative overflow-hidden transition-all hover:scale-[1.01] rounded-[2rem] ${index === 0 ? 'scale-[1.03]' : ''}`}
             >
                {/* Ranking Accent Line - Now following the curve */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 z-10 transition-colors rounded-l-[2rem] ${
                  index === 0 ? 'bg-mint' : 
                  index === 1 ? 'bg-white/40' : 
                  index === 2 ? 'bg-orange-400/50' : 'bg-white/5 group-hover:bg-mint/30'
                }`} />
                
                <Panel className={`!p-0 border-white/5 bg-panel/30 backdrop-blur-xl rounded-[2rem] ${index === 0 ? 'border-mint/30' : 'border-white/5'}`}>
                   <div className="flex flex-col md:flex-row items-center gap-8 p-6 md:p-10 relative">
                      
                      {/* Rank Indicator */}
                      <div className="flex-shrink-0 flex flex-col items-center justify-center w-16">
                         <span className={`text-4xl font-black italic ${
                           index === 0 ? 'text-mint drop-shadow-[0_0_15px_rgba(46,230,166,0.4)]' : 
                           index === 1 ? 'text-slate-300 drop-shadow-[0_0_15px_rgba(203,213,225,0.3)]' : 
                           index === 2 ? 'text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.3)]' : 
                           'text-white/10'
                         }`}>
                            {String(index + 1).padStart(2, '0')}
                         </span>
                      </div>

                      {/* Profile */}
                      <div className="flex-1 space-y-2 text-center md:text-left">
                         <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <h3 className="text-2xl font-black text-white tracking-tight">{user.username || 'Anonymous Hunter'}</h3>
                            <div className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border inline-block mx-auto md:mx-0 ${
                              user.reputation?.tier === 'Legend' ? 'bg-mint/10 text-mint border-mint/20' :
                              user.reputation?.tier === 'Elite' ? 'bg-mint/5 text-mint/80 border-mint/10' :
                              'bg-white/5 text-white/40 border-white/5'
                            }`}>
                              {user.reputation?.tier || 'Novice'}
                            </div>
                         </div>
                         <div className="font-mono text-[10px] text-white/10 break-all opacity-50">{user.walletAddress}</div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-l border-white/5 pl-10">
                         <div>
                            <label className="text-[9px] uppercase font-bold text-white/20 block mb-1 tracking-widest">Solved</label>
                            <div className="text-xl font-black text-white">{completed}</div>
                         </div>
                         <div>
                            <label className="text-[9px] uppercase font-bold text-white/20 block mb-1 tracking-widest">Accuracy</label>
                            <div className="text-xl font-black text-white">{(Number(user.reputation?.acceptanceRate || 0) * 100).toFixed(0)}%</div>
                         </div>
                         <div>
                            <label className="text-[9px] uppercase font-bold text-white/20 block mb-1 tracking-widest">Earnings</label>
                            <div className="text-xl font-black text-mint">
                              {displayEarnings} <span className="text-[8px] ml-0.5">SOL</span>
                            </div>
                         </div>
                         <div className="hidden md:block">
                            <label className="text-[9px] uppercase font-bold text-white/20 block mb-1 tracking-widest">Score</label>
                            <div className="text-2xl font-black text-white">{Math.round(Number(user.reputation?.totalScore || 0))}</div>
                         </div>
                      </div>
                   </div>
                </Panel>
             </div>
           );
         })}
      </div>
    </div>
  );
}
