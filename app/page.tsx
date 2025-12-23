'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="space-y-32 pb-20">
      {/* 1. HERO SECTION */}
      <section className="grid lg:grid-cols-2 gap-16 items-center pt-10">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full bg-mint/10 border border-mint/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-mint">
            <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
            Solana Native Protocol
          </div>

          <h1 className="text-6xl md:text-7xl font-black leading-[0.9] tracking-tighter text-white">
            BUILD. SOLVE. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint to-blue-400">EARN SOL.</span>
          </h1>

          <p className="text-white/50 text-xl leading-relaxed max-w-lg font-medium">
            The decentralized infrastructure for proof-of-work. Connect creators with elite developers through trustless escrow and verifiable reputation.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/bounties" className="group relative overflow-hidden rounded-2xl bg-mint px-8 py-4 font-black text-black transition-all hover:scale-105 active:scale-95">
              EXPLORE BOUNTIES
            </Link>
            <Link href="/dashboard" className="rounded-2xl bg-white/5 border border-white/10 px-8 py-4 font-black text-white transition-all hover:bg-white/10 active:scale-95">
              GO TO DASHBOARD
            </Link>
          </div>

          <div className="flex items-center gap-8 pt-6 border-t border-white/5">
             <div>
                <div className="text-2xl font-black text-white">0%</div>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Protocol Fee</div>
             </div>
             <div>
                <div className="text-2xl font-black text-white">Instant</div>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Settlement</div>
             </div>
             <div>
                <div className="text-2xl font-black text-white">Verified</div>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Reputation</div>
             </div>
          </div>
        </div>

        {/* Visual Piece Strong */}
        <div className="relative group">
           <div className="absolute -inset-4 bg-mint/20 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
           <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-panel/40 backdrop-blur-xl p-2 shadow-2xl">
              <Image 
                src="/protocol_visual_map.png" 
                alt="Sol Bounties Protocol System Map" 
                width={800} 
                height={800}
                className="rounded-[2rem] object-cover"
                priority
              />
           </div>
        </div>
      </section>

      {/* 2. THE PROTOCOL FLOW */}
      <section className="space-y-16">
         <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">End-to-End Lifecycle</h2>
            <p className="text-white/40 max-w-xl mx-auto">From mission inception to trustless settlement and reputation gain.</p>
         </div>

         <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Identity', desc: 'Secure login via Solana Wallet signatures.' },
              { step: '02', title: 'Discovery', desc: 'Browse immutable bounties and requirements.' },
              { step: '03', title: 'Submission', desc: 'Upload proof-of-work to the protocol.' },
              { step: '04', title: 'Verification', desc: 'Creator validates the solution quality.' },
              { step: '05', title: 'Settlement', desc: 'Smart escrow releases SOL + Earns Badge.' },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="p-8 rounded-[2rem] bg-white/[0.04] border border-white/10 space-y-4 h-full group-hover:bg-white/[0.08] group-hover:border-mint/30 transition-all shadow-xl">
                  <div className="text-4xl font-black text-mint/30 group-hover:text-mint transition-colors uppercase italic tracking-tighter">{item.step}</div>
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">{item.title}</h4>
                  <p className="text-sm text-white/50 leading-relaxed font-medium">{item.desc}</p>
                </div>
                {i < 4 && <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-white/10 z-10" />}
              </div>
            ))}
         </div>
      </section>

      {/* 3. TWO-SIDED NETWORK */}
      <section className="grid lg:grid-cols-2 gap-8 text-white">
          <div className="p-10 rounded-[3rem] bg-gradient-to-br from-panel/60 to-transparent border border-white/5 space-y-6">
             <div className="h-12 w-12 rounded-2xl bg-mint/10 flex items-center justify-center text-mint">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
             </div>
             <h3 className="text-3xl font-black italic tracking-tighter uppercase">For Developers</h3>
             <p className="text-white/40 font-medium">Build a verifiable on-chain CV. Solve complex problems for top Solana projects and earn rewards in real-time. No intermediaries, just code.</p>
             <ul className="space-y-3 pt-4">
                {['Direct peer-to-peer payments', 'Non-transferrable reputation badges', 'Escrow protection for every mission'].map((li, i) => (
                  <li key={i} className="flex gap-3 text-sm font-bold text-white/70">
                    <span className="text-mint">✓</span> {li}
                  </li>
                ))}
             </ul>
          </div>

          <div className="p-10 rounded-[3rem] bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5 space-y-6">
             <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
             </div>
             <h3 className="text-3xl font-black italic tracking-tighter uppercase">For Creators</h3>
             <p className="text-white/40 font-medium">Scale your protocol by outsourcing development to a global talent pool. Pay only for verified results through our structured submission flow.</p>
             <ul className="space-y-3 pt-4">
                {['Trustless bounty creation', 'Efficient submission management', 'Built-in quality assurance tools'].map((li, i) => (
                  <li key={i} className="flex gap-3 text-sm font-bold text-white/70">
                    <span className="text-blue-400">✓</span> {li}
                  </li>
                ))}
             </ul>
          </div>
      </section>

      {/* 4. TECHNICAL PILLARS */}
      <section className="grid sm:grid-cols-3 gap-6">
          {[
            { 
              t: 'Cryptographic Identity', 
              d: 'Authenticating users via Ed25519 message signatures. No passwords, just private keys.',
              icon: (
                <svg className="w-8 h-8 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )
            },
            { 
              t: 'Reputation Scoring', 
              d: 'An algorithmic trust score derived from completion rates, reward volume, and peer-verified badges.',
              icon: (
                <svg className="w-8 h-8 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )
            },
            { 
              t: 'Programmable Escrow', 
              d: 'Simulating on-chain locked liquidity to ensure that solvers always get paid upon verification.',
              icon: (
                <svg className="w-8 h-8 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )
            }
          ].map((f, i) => (
            <div key={i} className="p-10 rounded-[2.5rem] bg-white/[0.04] border border-white/10 space-y-6 hover:border-mint/30 transition-all group shadow-2xl backdrop-blur-sm">
              <div className="p-3 rounded-2xl bg-mint/5 w-fit group-hover:bg-mint/10 transition-colors">
                {f.icon}
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight">{f.t}</h4>
              <p className="text-sm text-white/50 leading-relaxed font-medium">{f.d}</p>
            </div>
          ))}
      </section>

      {/* FOOTER / CTAs */}
      <section className="text-center pt-10 border-t border-white/5">
         <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">
           Solana Foundation Ecosystem • Built for the Future of Work
         </p>
      </section>
    </div>
  );
}
