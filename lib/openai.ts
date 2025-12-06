// lib/openai.ts (sadece server'da import edeceğin dosya olsun)
// Bu dosya 'use server' kullanmaz çünkü obje export ediyor
// Ancak sadece server-side dosyalarda (API routes, 'use server' dosyalar) kullanılmalı

import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

