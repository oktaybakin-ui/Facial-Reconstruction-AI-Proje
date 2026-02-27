// lib/anthropic.ts - Shared Anthropic client factory
// Fonksiyon olarak export ediyoruz çünkü 'use server' dosyalar obje import edemez

import Anthropic from '@anthropic-ai/sdk';

let cachedClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'Anthropic API key bulunamadı. Lütfen .env.local dosyasında ANTHROPIC_API_KEY değişkenini ayarlayın.'
    );
  }
  if (!cachedClient) {
    cachedClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return cachedClient;
}
