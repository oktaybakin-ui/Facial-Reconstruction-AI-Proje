// lib/anthropic.ts - Shared Anthropic client factory
// Fonksiyon olarak export ediyoruz çünkü 'use server' dosyalar obje import edemez

import Anthropic from '@anthropic-ai/sdk';

let cachedClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY bulunamadı. Lütfen Vercel Dashboard → Settings → Environment Variables bölümünden ANTHROPIC_API_KEY ekleyin ve redeploy yapın.'
    );
  }
  if (!cachedClient) {
    cachedClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return cachedClient;
}
