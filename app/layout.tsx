'use client';
import './globals.css';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { AuthProvider } from './components/providers/AuthProvider';
import Navbar from './components/Navbar';
import { config } from './lib/config';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const endpoint = config.solanaRpc;
  const wallets = [new PhantomWalletAdapter()];

  return (
    <html lang="es">
      <body className="sb-gradient">
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <AuthProvider>
                <Navbar />
                <main className="max-w-6xl mx-auto px-6 py-10">
                  {children}
                </main>
              </AuthProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </body>
    </html>
  );
}
