// lib/openai.ts (sadece server'da import edeceğin dosya olsun)

import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

