// API Key Kontrol Script'i
// Bu script'i çalıştırmak için: node Desktop/check_api_keys.js

require('dotenv').config({ path: require('path').join(__dirname, '../facial-reconstruction-ai/facial-reconstruction-ai/.env.local') });

console.log('=== API Key Kontrolü ===\n');

// OpenAI API Key
const openaiKey = process.env.OPENAI_API_KEY;
if (openaiKey) {
  console.log('✅ OPENAI_API_KEY: Bulundu');
  console.log(`   Format: ${openaiKey.substring(0, 7)}... (${openaiKey.length} karakter)`);
  console.log(`   Doğru başlangıç: ${openaiKey.startsWith('sk-') ? '✅ Evet' : '❌ Hayır (sk- ile başlamalı)'}`);
} else {
  console.log('❌ OPENAI_API_KEY: Bulunamadı');
}

console.log('');

// Anthropic API Key
const anthropicKey = process.env.ANTHROPIC_API_KEY;
if (anthropicKey) {
  console.log('✅ ANTHROPIC_API_KEY: Bulundu');
  console.log(`   Format: ${anthropicKey.substring(0, 10)}... (${anthropicKey.length} karakter)`);
  console.log(`   Doğru başlangıç: ${anthropicKey.startsWith('sk-ant-') ? '✅ Evet' : '❌ Hayır (sk-ant- ile başlamalı)'}`);
} else {
  console.log('❌ ANTHROPIC_API_KEY: Bulunamadı');
}

console.log('');

// Supabase Keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL: Bulundu');
  console.log(`   URL: ${supabaseUrl}`);
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL: Bulunamadı');
}

if (supabaseAnonKey) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Bulundu');
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: Bulunamadı');
}

if (supabaseServiceKey) {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY: Bulundu');
} else {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY: Bulunamadı');
}

console.log('\n=== Sonuç ===');
const allKeysPresent = openaiKey && anthropicKey && supabaseUrl && supabaseAnonKey && supabaseServiceKey;
if (allKeysPresent) {
  console.log('✅ Tüm API key\'ler mevcut!');
} else {
  console.log('❌ Bazı API key\'ler eksik. Lütfen .env.local dosyasını kontrol edin.');
}

