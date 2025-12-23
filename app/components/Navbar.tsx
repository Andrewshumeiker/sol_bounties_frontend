'use client';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-20 backdrop-blur border-b border-white/5 bg-black/30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-mint shadow-[0_0_20px_rgba(46,230,166,0.65)]" />
          <span className="text-lg font-extrabold tracking-tight">
            <span className="text-white">Sol</span>{" "}
            <span className="text-primary">Bounties</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link className="text-sm font-medium text-white/70 hover:text-white hover:text-primary transition-colors" href="/dashboard">Dashboard</Link>
          <Link className="text-sm font-medium text-white/70 hover:text-white hover:text-primary transition-colors" href="/bounties">Bounties</Link>
          <Link className="text-sm font-medium text-white/70 hover:text-white hover:text-primary transition-colors" href="/leaderboard">Leaderboard</Link>
          <Link className="text-sm font-medium text-white/70 hover:text-white hover:text-primary transition-colors" href="/creator">Creator</Link>
          <div className="h-6 w-px bg-white/10 mx-2" />
          {mounted && <WalletMultiButton />}
        </div>
      </div>
    </nav>
  );
}
