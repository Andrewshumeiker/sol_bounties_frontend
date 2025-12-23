import { api } from '../lib/api';

export type AuthChallengeResponse = { message: string; nonce: string };
export type AuthVerifyResponse = {
  token: string;
  user: {
    id: string;
    username?: string;
    walletAddress: string;
    badges?: { key: string; name: string }[];
  };
};

export async function requestChallenge(publicKey: string) {
  return api<AuthChallengeResponse>('/auth/challenge', { method: 'POST', body: { publicKey } });
}

export async function verifySignature(payload: {
  publicKey: string;
  signature: string; // base58
  message: string;
  nonce: string;
}) {
  return api<AuthVerifyResponse>('/auth/verify', { method: 'POST', body: payload });
}

export async function me(token: string) {
  return api<AuthVerifyResponse['user']>('/users/me', { token });
}

export function saveToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem('sb_token', token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sb_token');
}

export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('sb_token');
}
