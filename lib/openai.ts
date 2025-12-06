// lib/openai.ts (sadece server'da import edeceğin dosya olsun)
// Fonksiyon olarak export ediyoruz çünkü 'use server' dosyalar obje import edemez

import OpenAI from "openai";

export function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

