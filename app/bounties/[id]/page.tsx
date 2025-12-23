'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../components/providers/AuthProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Panel from '../../components/Panel';
import { getToken } from '../../services/auth';

type Bounty = {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  badgeKey: string;
  creatorId: string;
  status: string;
  submissions?: {
    id: string;
    content: string;
    applicantId: string;
    status: string;
  }[];
  createdBy: { walletAddress: string };
};

export default function BountyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { connected } = useWallet();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState({
    link: '',
    notes: ''
  });
  const [existingSub, setExistingSub] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchBounty();
  }, [id]);

  async function fetchBounty() {
    try {
      const data = await api<Bounty>(`bounties/${id}`);
      setBounty(data);
      
      if (user && data.submissions) {
        const mySub = data.submissions.find(s => s.applicantId === user.id);
        if (mySub) {
          setExistingSub(mySub);
          // Parse content
          const linkMatch = mySub.content.match(/REPO\/LINK: (.*)\n\nNOTES: (.*)/s);
          if (linkMatch) {
            setSubmission({ link: linkMatch[1], notes: linkMatch[2] });
          } else {
            setSubmission({ link: '', notes: mySub.content });
          }
        } else {
          setExistingSub(null);
          setSubmission({ link: '', notes: '' });
        }
      }
    } catch (e) {
      console.error(e);
      alert('Failed to load mission data');
      router.push('/bounties');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !bounty) return;
    
    setSubmitting(true);
    try {
      const token = getToken();
      const content = `REPO/LINK: ${submission.link}\n\nNOTES: ${submission.notes}`;
      
      await api(`bounties/${id}/apply`, {
        method: 'POST',
        body: { content },
        token
      });
      
      alert(existingSub ? 'Mission solution updated!' : 'Mission solution transmitted successfully!');
      fetchBounty();
      setEditing(false);
    } catch (e: any) {
      alert(e.message || 'Transmission failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!existingSub || !confirm('Delete this submission?')) return;
    setSubmitting(true);
    try {
      const token = getToken();
      await api(`bounties/applications/${existingSub.id}/delete`, {
        method: 'POST',
        token
      });
      alert('Submission removed.');
      fetchBounty();
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-black tracking-widest text-xl">DECRYPTING MISSION DATA...</div>;
  if (!bounty) return <div className="p-20 text-center text-white/40">Mission not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="space-y-4">
        <button 
          onClick={() => router.back()}
          className="text-primary/60 hover:text-primary text-xs font-black tracking-widest uppercase flex items-center gap-2 transition-colors"
        >
          ← Abort & Return
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <span className="bg-primary/10 text-primary text-xs font-black tracking-widest px-4 py-1 rounded-full border border-primary/20">
                {bounty.rewardAmount} SOL
               </span>
               <span className="text-white/20 font-mono text-xs">ID: {bounty.id.slice(0,12)}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">
              {bounty.title}
            </h1>
          </div>
          {bounty.badgeKey && (
            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.4)]" />
               <div>
                  <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Soulbound Reward</div>
                  <div className="text-white font-bold">{bounty.badgeKey.replace(/_/g, ' ')}</div>
               </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 mb-4 ml-1">Mission Briefing</h3>
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl leading-relaxed text-white/70 whitespace-pre-wrap">
              {bounty.description}
            </div>
          </section>

          {user && user.id !== bounty.creatorId ? (
            <section className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(46,230,166,1)]" />
                  <h3 className="text-xl font-bold">
                    {existingSub ? 'Your Mission Progress' : 'Transmit Solution'}
                  </h3>
               </div>
               
               {existingSub && !editing ? (
                 <Panel title="Transmission Active">
                    <div className="space-y-6">
                       <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                             <span className="text-white/30 font-mono">Status</span>
                             <span className={`${existingSub.status === 'ACCEPTED' ? 'text-green-400' : existingSub.status === 'REJECTED' ? 'text-red-400' : 'text-yellow-400'}`}>
                                {existingSub.status}
                             </span>
                          </div>
                          <div>
                             <label className="text-[10px] uppercase font-bold text-white/20 block mb-1">Repo Link</label>
                             <div className="text-sm font-mono text-blue-300 break-all">{submission.link}</div>
                          </div>
                          <div>
                             <label className="text-[10px] uppercase font-bold text-white/20 block mb-1">Technical Notes</label>
                             <p className="text-sm text-white/60 leading-relaxed italic">"{submission.notes}"</p>
                          </div>
                       </div>
                       
                       {existingSub.status === 'PENDING' && (
                         <div className="flex gap-4">
                            <button 
                              onClick={() => setEditing(true)}
                              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-lg border border-white/10 text-xs uppercase"
                            >
                              Edit Files
                            </button>
                            <button 
                              onClick={handleDelete}
                              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-lg border border-red-500/10 text-xs uppercase"
                            >
                              Delete
                            </button>
                         </div>
                       )}
                    </div>
                 </Panel>
               ) : (
                 <Panel title={editing ? 'Clarify Transmission' : 'Submission Portal'}>
                   <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                     <div>
                       <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 block mb-2">Project Repo / Link</label>
                       <input 
                         required
                         type="url"
                         placeholder="https://github.com/your-username/solution-repo"
                         value={submission.link}
                         onChange={e => setSubmission({...submission, link: e.target.value})}
                         className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-primary/50 outline-none transition-all text-blue-300 font-mono"
                       />
                     </div>
                     <div>
                       <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 block mb-2">Technical Notes</label>
                       <textarea 
                         required
                         rows={5}
                         placeholder="Briefly explain your approach and how to verify the solution..."
                         value={submission.notes}
                         onChange={e => setSubmission({...submission, notes: e.target.value})}
                         className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-primary/50 outline-none transition-all resize-none text-white/80"
                       />
                     </div>
                     <div className="flex gap-4">
                        {editing && (
                          <button 
                            type="button"
                            onClick={() => setEditing(false)}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-xl uppercase tracking-tighter"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          type="submit"
                          disabled={submitting}
                          className="flex-[2] bg-primary hover:bg-primary/80 text-black font-black py-4 rounded-xl shadow-[0_10px_30px_rgba(46,230,166,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-lg uppercase tracking-tighter"
                        >
                          {submitting ? 'TRANSMITTING...' : editing ? 'UPDATE SOLUTION' : 'SEND SOLUTION'}
                        </button>
                     </div>
                   </form>
                 </Panel>
               )}
            </section>
          ) : (
            <div className="p-8 bg-white/5 rounded-3xl border border-white/5 border-dashed text-center">
               <p className="text-white/30 text-sm font-bold uppercase tracking-widest">
                {user?.id === bounty.creatorId ? 'You are the creator of this mission' : 'Unauthorized Access: Synchronize Wallet to Submit'}
               </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
           <Panel title="Creator">
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">Creator</label>
                    <div className="font-mono text-xs text-white/70 truncate">{bounty.createdBy.walletAddress}</div>
                 </div>
                 <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">Status</label>
                    <div className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                       <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                       Active
                    </div>
                 </div>
              </div>
           </Panel>

           {!connected && (
             <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl space-y-4">
                <p className="text-orange-200 text-xs leading-relaxed font-bold uppercase tracking-wider">Authentication Required to provide solutions.</p>
                <div className="flex justify-center">
                  <WalletMultiButton />
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
