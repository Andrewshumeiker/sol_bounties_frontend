'use client';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../components/providers/AuthProvider';
import Panel from '../components/Panel';
import { getToken } from '../services/auth';
import { useWallet } from '@solana/wallet-adapter-react';

type Submission = {
  id: string;
  applicant: { id: string; walletAddress: string; username?: string };
  content: string;
  status: string;
  createdAt: string;
};

type Bounty = {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  badgeKey: string;
  creatorId: string;
  submissions?: Submission[];
};

export default function CreatorPage() {
  const { user } = useAuth();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { signMessage, connected } = useWallet();
  const [signing, setSigning] = useState(false);
  const [showSuccess, setShowSuccess] = useState<any>(null);
  
  // Create Form State
  const [newBounty, setNewBounty] = useState({
    title: '',
    description: '',
    rewardAmount: 0.1,
    badgeKey: 'first_bounty_win'
  });

  // Map to store applications for each bounty: bountyId -> submissions
  const [applicationsMap, setApplicationsMap] = useState<Record<string, Submission[]>>({});

  useEffect(() => {
    if (user) {
      fetchMyBounties();
    }
  }, [user]);

  async function fetchMyBounties() {
    try {
      const all = await api<Bounty[]>('bounties');
      const myBounties = all.filter(b => b.creatorId === user?.id);
      setBounties(myBounties);
      
      const apps: Record<string, Submission[]> = {};
      const token = getToken();
      for (const b of myBounties) {
        try {
          const subs = await api<Submission[]>(`bounties/${b.id}/applications`, { token });
          apps[b.id] = subs;
        } catch (e) {
          console.error(`Failed to fetch apps for ${b.id}`, e);
        }
      }
      setApplicationsMap(apps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateBalance(amount: number, type: 'IN' | 'OUT', memo: string) {
    if (!user) return;
    const balanceKey = `sb_balance_${user.id}`;
    const txKey = `sb_transactions_${user.id}`;

    const current = parseFloat(localStorage.getItem(balanceKey) || '8.42');
    const next = type === 'IN' ? current + amount : current - amount;
    localStorage.setItem(balanceKey, next.toFixed(2));
    
    const txs = JSON.parse(localStorage.getItem(txKey) || '[]');
    txs.unshift({
      id: Math.random().toString(36).slice(2, 10),
      type,
      amount: amount.toFixed(2),
      memo,
      date: new Date().toISOString()
    });
    localStorage.setItem(txKey, JSON.stringify(txs.slice(0, 10)));
  }

  async function handleCreateBounty(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    
    // Simulation: Transaction Signature
    setSigning(true);
    try {
      if (connected && signMessage) {
        const msg = new TextEncoder().encode(`Authorize Escrow: ${newBounty.rewardAmount} SOL for ${newBounty.title}`);
        await signMessage(msg);
      } else {
        await new Promise(r => setTimeout(r, 1500)); // Fake delay for demo
      }
    } catch (e) {
      setSigning(false);
      return; // Cancel
    }
    setSigning(false);

    setCreating(true);
    try {
      const token = getToken();
      await api('bounties', {
        method: 'POST',
        body: newBounty,
        token
      });
      
      await updateBalance(newBounty.rewardAmount, 'OUT', `Escrow Deployment: ${newBounty.title}`);
      
      setNewBounty({ title: '', description: '', rewardAmount: 0.1, badgeKey: 'first_bounty_win' });
      alert('Bounty created and funds locked in escrow! 🚀');
      fetchMyBounties();
    } catch (e: any) {
      alert(e.message || 'Failed to create bounty');
    } finally {
      setCreating(false);
    }
  }

  async function handleAccept(appId: string, bountyTitle: string, amount: number, hunterId: string) {
    if (!confirm(`Accept this submission and release ${amount} SOL to the hunter?`)) return;
    
    setSigning(true);
    try {
      if (connected && signMessage) {
        const msg = new TextEncoder().encode(`Release Escrow: ${amount} SOL to hunter for ${bountyTitle}`);
        await signMessage(msg);
      } else {
        await new Promise(r => setTimeout(r, 1500));
      }
    } catch (e) {
      setSigning(false);
      return;
    }
    setSigning(false);

    setProcessing(appId);
    try {
      const token = getToken();
      await api(`bounties/applications/${appId}/accept`, { method: 'PATCH', token });
      
      // Update Client Balance (Payment Released)
      await updateBalance(amount, 'OUT', `Payment Released: ${bountyTitle}`);
      
      // Update Hunter Balance (Simulated Payment Received)
      const hunterBalanceKey = `sb_balance_${hunterId}`;
      const hunterTxKey = `sb_transactions_${hunterId}`;
      
      const currentHunter = parseFloat(localStorage.getItem(hunterBalanceKey) || '0.00');
      const nextHunter = currentHunter + amount;
      localStorage.setItem(hunterBalanceKey, nextHunter.toFixed(2));
      
      const hunterTxs = JSON.parse(localStorage.getItem(hunterTxKey) || '[]');
      hunterTxs.unshift({
        id: Math.random().toString(36).slice(2, 10),
        type: 'IN',
        amount: amount.toFixed(2),
        memo: `Bounty Won: ${bountyTitle}`,
        date: new Date().toISOString()
      });
      localStorage.setItem(hunterTxKey, JSON.stringify(hunterTxs.slice(0, 10)));
      
      setShowSuccess({ title: bountyTitle, amount, hunterId });
      fetchMyBounties();
    } catch (e: any) {
      alert(e.message || 'Error');
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(appId: string) {
    if (!confirm('Reject this submission?')) return;
    setProcessing(appId);
    try {
      const token = getToken();
      await api(`bounties/applications/${appId}/reject`, { method: 'PATCH', token });
      alert('Rejected');
      fetchMyBounties();
    } catch (e: any) {
      alert(e.message || 'Error');
    } finally {
      setProcessing(null);
    }
  }

  if (!user) return <div className="p-8 text-center">Please login to access creator tools</div>;
  if (loading) return <div className="p-8 text-center">Loading your projects...</div>;

  return (
    <div className="space-y-12 relative">
      {showSuccess && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[10000] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
           <div className="bg-gradient-to-b from-[#1a1c20] to-black border border-primary/20 w-full max-w-md rounded-[2.5rem] p-10 text-center shadow-[0_0_100px_rgba(46,230,166,0.15)]">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
                 <div className="text-5xl animate-bounce">💎</div>
              </div>
              <h2 className="text-3xl font-black text-white mb-4 italic tracking-tighter">MISSION COMPLETE</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                You have successfully released <span className="text-primary font-bold">{showSuccess.amount} SOL</span> for the mission: 
                <br/>
                <span className="text-white font-medium">"{showSuccess.title}"</span>
              </p>
              <div className="bg-white/5 rounded-2xl p-4 mb-10 border border-white/5">
                 <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mb-1">Transaction Status</div>
                 <div className="text-primary font-mono text-xs">ON-CHAIN VERIFIED • FINALIZED</div>
              </div>
              <button 
                onClick={() => setShowSuccess(null)}
                className="w-full bg-primary hover:bg-primary/80 text-black font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(46,230,166,0.3)] transition-all uppercase tracking-widest text-sm"
              >
                Return to Hub
              </button>
           </div>
        </div>
      )}

      {signing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="relative mb-8">
              <div className="h-24 w-24 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="h-12 w-12 rounded-full bg-primary/10 animate-pulse" />
              </div>
           </div>
           <h2 className="text-3xl font-black text-white tracking-tight mb-2">Requesting Signature</h2>
           <p className="text-primary font-mono text-sm animate-pulse">Check your wallet to authorize transaction...</p>
           <div className="mt-12 bg-white/5 border border-white/10 p-4 rounded-2xl max-w-xs text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Security Verification</p>
              <p className="text-xs text-white/60 leading-relaxed">Please verify the memo matches the bounty details before signing.</p>
           </div>
        </div>
      )}

      <header className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Creator Hub</h1>
          <p className="text-white/40">Launch new bounties and manage your mission applicants.</p>
        </div>
      </header>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <Panel title="Deploy New Bounty">
            <form onSubmit={handleCreateBounty} className="space-y-4 pt-2">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 block mb-1.5">Mission Title</label>
                <input 
                  required
                  type="text" 
                  value={newBounty.title}
                  onChange={e => setNewBounty({...newBounty, title: e.target.value})}
                  placeholder="e.g. Design Pixel Art Logo" 
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-primary/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 block mb-1.5">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={newBounty.description}
                  onChange={e => setNewBounty({...newBounty, description: e.target.value})}
                  placeholder="Describe the mission goals..." 
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-primary/50 outline-none transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 block mb-1.5 font-mono">SOL Reward</label>
                  <div className="relative">
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      min="0.01"
                      value={newBounty.rewardAmount}
                      onChange={e => setNewBounty({...newBounty, rewardAmount: parseFloat(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pr-12 text-sm focus:border-primary/50 outline-none transition-all font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 pointer-events-none group-focus-within:opacity-100 opacity-40 transition-opacity">
                      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-primary"></div>
                      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-primary"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 block mb-1.5">Badge Key</label>
                  <select 
                    value={newBounty.badgeKey}
                    onChange={e => setNewBounty({...newBounty, badgeKey: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-primary/50 outline-none transition-all appearance-none"
                  >
                    <option value="first_bounty_win">First Win</option>
                    <option value="code_warrior">Code Warrior</option>
                    <option value="pixel_master">Pixel Master</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                disabled={creating}
                className="w-full bg-primary hover:bg-primary/80 text-black font-black py-4 rounded-xl shadow-[0_4px_20px_rgba(46,230,166,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {creating ? 'DEPLOYING...' : 'LAUNCH MISSION'}
              </button>
            </form>
          </Panel>
        </div>

        {/* Bounties List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Active Missions
          </h2>
          
          {bounties.length === 0 ? (
            <div className="bg-white/2 p-12 rounded-2xl border border-dashed border-white/5 text-center">
              <p className="text-white/30">You haven't deployed any missions yet.</p>
            </div>
          ) : (
            bounties.map(b => (
              <Panel key={b.id} title={b.title}>
                <div className="mt-4">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-1 rounded">ID: {b.id.slice(0,8)}</span>
                    <span className="text-xs font-bold text-primary/80 bg-primary/5 px-2 py-1 rounded">{b.rewardAmount} SOL</span>
                  </div>

                  <h4 className="text-[10px] uppercase tracking-widest font-black text-white/20 mb-3 ml-1">Candidate Submissions</h4>
                  
                  {applicationsMap[b.id]?.length ? (
                    <div className="space-y-3">
                      {applicationsMap[b.id].map(sub => (
                        <div key={sub.id} className="bg-white/[0.03] border border-white/5 p-4 rounded-xl flex justify-between items-start gap-4 hover:bg-white/[0.05] transition-all group">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-primary/40 to-blue-500/40" />
                              <span className="font-mono text-xs text-blue-300">
                                {sub.applicant.walletAddress.slice(0, 8)}...{sub.applicant.walletAddress.slice(-6)}
                              </span>
                            </div>
                            <div className="space-y-4 mb-4">
                              {sub.content.includes('REPO/LINK:') ? (
                                <>
                                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <label className="text-[9px] uppercase tracking-widest font-black text-primary/50 block mb-1">Project Link</label>
                                    <a 
                                      href={sub.content.split('\n\n')[0].replace('REPO/LINK: ', '').trim()} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-400 hover:text-blue-300 underline font-mono break-all"
                                    >
                                      {sub.content.split('\n\n')[0].replace('REPO/LINK: ', '').trim()}
                                    </a>
                                  </div>
                                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <label className="text-[9px] uppercase tracking-widest font-black text-white/20 block mb-1">Technical Notes</label>
                                    <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">
                                      {sub.content.split('\n\n')[1]?.replace('NOTES: ', '').trim() || 'No notes provided.'}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <p className="text-sm text-white/80 leading-relaxed">{sub.content}</p>
                              )}
                            </div>
                            <div className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full inline-block ${
                              sub.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              sub.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            }`}>
                              {sub.status}
                            </div>
                          </div>
                          
                          {sub.status === 'PENDING' && (
                            <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                              <button 
                                onClick={() => handleAccept(sub.id, b.title, b.rewardAmount, sub.applicant.id)}
                                disabled={!!processing}
                                className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black px-4 py-2 rounded-lg border border-primary/20"
                              >
                                APPROVE
                              </button>
                              <button 
                                onClick={() => handleReject(sub.id)}
                                disabled={!!processing}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black px-4 py-2 rounded-lg border border-red-500/20"
                              >
                                DECLINE
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                     <div className="text-white/10 text-sm italic py-4 pl-1">No applicants detected for this mission.</div>
                  )}
                </div>
              </Panel>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
