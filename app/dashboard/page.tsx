'use client';
import { useAuth } from '../components/providers/AuthProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Badge from '../components/Badge';
import { useState } from 'react';
import { requestChallenge, verifySignature, saveToken } from '../services/auth';
import Panel from '../components/Panel';
import { api, ApiError } from '../lib/api';
import { config } from '../lib/config';
import bs58 from 'bs58';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, refreshUser, logout } = useAuth();
  const { publicKey, signMessage, disconnect } = useWallet();
  const [loggingIn, setLoggingIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle'|'loading'|'ok'|'error'; message?: string }>({ type: 'idle' });
  const [balance, setBalance] = useState('8.42');
  const [transactions, setTransactions] = useState<{id:string, type:'IN'|'OUT', amount:string, memo:string, date:string, hash?:string}[]>([]);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  function loadData() {
    if (user) {
      const balanceKey = `sb_balance_${user.id}`;
      const txKey = `sb_transactions_${user.id}`;
      setBalance(localStorage.getItem(balanceKey) || '8.42');
      const savedTx = localStorage.getItem(txKey);
      setTransactions(savedTx ? JSON.parse(savedTx) : []);
    }
  }

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [user]);

  async function handleLogin() {
    if (!publicKey || !signMessage) return;
    setLoggingIn(true);
    try {
      setStatus({ type: 'loading', message: 'Requesting challenge...' });
      const { nonce, message } = await requestChallenge(publicKey.toBase58());
      // Strict normalization to \n only
      const normalizedMessage = message.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      
      setStatus({ type: 'loading', message: 'Signing...' });
      const encodedMessage = new TextEncoder().encode(normalizedMessage);
      const signature = await signMessage(encodedMessage);
      
      setStatus({ type: 'loading', message: 'Verifying...' });
      const { token } = await verifySignature({
        publicKey: publicKey.toBase58(),
        signature:  bs58.encode(signature), 
        message: normalizedMessage,
        nonce
      });
      saveToken(token);
      await refreshUser();
      setStatus({ type: 'ok', message: 'Login Success ✅' });
    } catch (e: any) {
      console.error(e);
      const msg = e instanceof ApiError ? e.message : (e.message || 'Login failed');
      setStatus({ type: 'error', message: msg });
      alert('Login failed: ' + msg);
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleDevLogin(walletKey: string) {
    try {
      setStatus({ type: 'loading', message: 'Test Login...' });
      const res = await fetch(`${config.apiUrl}/auth/dev-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: walletKey })
      });
      const data = await res.json();
      if (!data.token) throw new Error('No token returned');
      
      saveToken(data.token);
      await refreshUser();
      setStatus({ type: 'ok', message: 'Test Mode Active 🧙‍♂️' });
    } catch (e: any) {
      console.error(e);
      setStatus({ type: 'error', message: 'Test login failed' });
      alert('Test login failed');
    }
  }

  if (!mounted) return null;

  return (
    <div className="space-y-8 relative">
      {/* Transaction Modal (Fake Solscan) */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
           <div className="bg-[#0f1114] border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="bg-primary/5 p-6 border-b border-white/5 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                       <div className="w-4 h-4 text-primary">⚡</div>
                    </div>
                    <h3 className="text-xl font-black text-white">Transaction Detail</h3>
                 </div>
                 <button onClick={() => setSelectedTx(null)} className="text-white/20 hover:text-white transition-colors text-2xl">×</button>
              </div>
              <div className="p-8 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <label className="text-[10px] uppercase tracking-widest font-black text-white/30 block mb-1">Status</label>
                       <div className="flex items-center gap-2 text-primary font-black uppercase text-sm">
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Finalized
                       </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-widest font-black text-white/30 block mb-1">Network</label>
                        <div className="text-white font-mono text-sm tracking-tighter">Solana Devnet</div>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                       <label className="text-[10px] uppercase tracking-widest font-black text-white/20 block mb-2">Signature (TX Hash)</label>
                       <div className="font-mono text-[11px] text-blue-300 break-all leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">
                          {selectedTx.hash || '5T8zK3p9uMQ7YvXwA2rJ1nL6B4mE9sF0cQ8vR1xH2jG5... (Verified)'}
                       </div>
                    </div>
                    
                    <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                       <label className="text-[10px] uppercase tracking-widest font-black text-white/20 block mb-2">Memo Instruction</label>
                       <div className="text-sm text-white/80 font-medium italic">"{selectedTx.memo}"</div>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="text-white/40 text-xs font-mono">{new Date(selectedTx.date).toLocaleString()}</div>
                    <div className={`text-2xl font-black ${selectedTx.type === 'IN' ? 'text-green-400' : 'text-red-400'}`}>
                       {selectedTx.type === 'IN' ? '+' : '-'}{selectedTx.amount} SOL
                    </div>
                 </div>
                 
                 <button 
                  onClick={() => setSelectedTx(null)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-xl border border-white/10 uppercase tracking-widest text-xs transition-all"
                 >
                    Close Explorer
                 </button>
              </div>
           </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-4 items-center">
             {!user && <WalletMultiButton />}
              {user && (
                <button 
                  onClick={() => { 
                    disconnect(); 
                    logout();
                    window.location.reload(); 
                  }} 
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-red-500/10"
                >
                  Terminate Session
                </button>
              )}
        </div>
      </div>

      {status.type !== 'idle' && (
        <div className={`p-3 rounded-lg text-sm ${
          status.type === 'error' ? 'bg-red-500/20 text-red-200' : 
          status.type === 'ok' ? 'bg-green-500/20 text-green-200' : 'bg-blue-500/20 text-blue-200'
        }`}>
          {status.message}
        </div>
      )}

      {!user ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-panel rounded-2xl border border-white/5">
           <h2 className="text-2xl font-bold mb-4">Welcome to Sol Bounties</h2>
           <p className="text-white/60 mb-8 max-w-md text-center">Connect your wallet and sign in to track your progress, earn badges, and manage bounties.</p>
           
           {publicKey && (
             <div className="flex flex-col gap-3">
               <button 
                 onClick={handleLogin} 
                 disabled={loggingIn}
                 className="bg-primary hover:bg-primary/80 text-black px-8 py-3 rounded-xl font-bold text-lg disabled:opacity-50"
               >
                 {loggingIn ? 'Logging in...' : 'Sign In with Wallet'}
               </button>
               
                <div className="flex flex-col gap-2">
                   <button 
                     onClick={() => handleDevLogin('EDnAmnXEDYFxSay1VL3hrtf93Fuk3L2cBDFtenoBhcoe')}
                     className="text-xs text-white/30 hover:text-white/50 underline text-center"
                   >
                     Simulate Hunter (Test Mode)
                   </button>
                   <button 
                     onClick={() => handleDevLogin('SeedCreatorWalletAddress123')}
                     className="text-xs text-white/30 hover:text-white/50 underline text-center"
                   >
                     Simulate Client (Test Mode)
                   </button>
                </div>
             </div>
           )}
           {!publicKey && <WalletMultiButton />}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Panel title="Profile & Wallet">
            <div className="space-y-6">
               <div className="bg-gradient-to-br from-primary/10 to-blue-500/5 p-4 rounded-xl border border-primary/20">
                  <label className="text-[10px] uppercase tracking-widest font-black text-primary mb-1 block">Simulated Balance</label>
                  <div className="text-3xl font-black text-white flex items-end gap-2">
                    {balance} <span className="text-sm text-primary mb-1">SOL</span>
                  </div>
               </div>
               <div>
                 <label className="text-[10px] uppercase tracking-widest font-black text-white/30 block mb-1">Public Address</label>
                 <div className="font-mono bg-black/40 p-3 rounded-lg text-xs break-all text-white/70 border border-white/5">{user.walletAddress}</div>
               </div>
            </div>
          </Panel>

          <Panel title="My Badges">
            {user.badges && user.badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                 {user.badges.map(b => (
                   <Badge key={b.key} badgeKey={b.key} name={b.name} />
                 ))}
              </div>
            ) : (
              <div className="text-white/40 py-8 text-center italic">
                Complete bounties to earn badges!
              </div>
            )}
          </Panel>

          <Panel title="Reputation & Performance">
             {user.reputation ? (
               <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <div>
                       <label className="text-[10px] uppercase tracking-widest font-black text-white/30 block mb-1">Current Tier</label>
                       <div className={`text-2xl font-black italic tracking-tighter ${
                         user.reputation.tier === 'Legend' ? 'text-yellow-400' :
                         user.reputation.tier === 'Elite' ? 'text-purple-400' :
                         user.reputation.tier === 'Professional' ? 'text-blue-400' : 'text-white/70'
                       }`}>
                         {user.reputation.tier.toUpperCase()}
                       </div>
                    </div>
                    <div className="text-right">
                       <label className="text-[10px] uppercase tracking-widest font-black text-white/30 block mb-1">Rep Score</label>
                       <div className="text-3xl font-black text-primary">{Math.round(user.reputation.totalScore)}</div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                       <div className="text-[9px] text-white/30 uppercase font-bold mb-1">Success Rate</div>
                       <div className="text-sm font-mono text-white">{(user.reputation.acceptanceRate * 100).toFixed(0)}%</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                       <div className="text-[9px] text-white/30 uppercase font-bold mb-1">Missions Won</div>
                       <div className="text-sm font-mono text-white">{user.reputation.completedBounties}</div>
                    </div>
                 </div>

                 <div className="pt-2">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div 
                        className="h-full bg-primary shadow-[0_0_10px_rgba(46,230,166,0.5)] transition-all duration-1000" 
                        style={{ width: `${Math.min(100, (user.reputation.totalScore / 1500) * 100)}%` }}
                       />
                    </div>
                    <div className="flex justify-between mt-2 text-[8px] font-black text-white/20 uppercase tracking-widest">
                       <span>Novice</span>
                       <span>Legend</span>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="text-center py-10 text-white/20 text-xs italic">
                 Initializing on-chain profile...
               </div>
             )}
          </Panel>

          <div className="md:col-span-2">
            <Panel title={
              <div className="flex justify-between items-center w-full pr-4">
                 <span>Recent Network Activity</span>
                 <button 
                  onClick={loadData}
                  className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20 transition-all font-black uppercase tracking-widest"
                 >
                   Sync History
                 </button>
              </div>
            }>
              <div className="space-y-4">
                 {transactions.length === 0 ? (
                   <div className="text-center py-10 border border-dashed border-white/5 rounded-xl text-white/20 text-sm font-bold uppercase tracking-widest">
                     No transactions detected on-chain
                   </div>
                 ) : (
                   <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-white/30 border-b border-white/5 uppercase text-[10px] tracking-widest">
                            <th className="pb-3 pl-2">Type</th>
                            <th className="pb-3">Memo / Description</th>
                            <th className="pb-3">Amount</th>
                            <th className="pb-3 text-right pr-2">Link</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {transactions.map(tx => (
                            <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 pl-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${tx.type === 'IN' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className="py-4 text-white/70 max-w-[200px] truncate">{tx.memo}</td>
                              <td className={`py-4 font-mono font-bold ${tx.type === 'IN' ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.type === 'IN' ? '+' : '-'}{tx.amount} SOL
                              </td>
                              <td className="py-4 text-right pr-2">
                                <button 
                                  onClick={() => setSelectedTx(tx)}
                                  className="text-primary hover:text-white transition-colors text-[10px] font-black bg-primary/5 group-hover:bg-primary/20 px-3 py-1 rounded-lg uppercase tracking-tighter"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                   </div>
                 )}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
