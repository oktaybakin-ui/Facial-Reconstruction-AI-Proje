# API Key Format Kontrolü

## Anthropic API Key ✅
- **Format:** `sk-ant-api03-4rJ...WwAA`
- **Başlangıç:** ✅ Doğru (`sk-ant-` ile başlıyor)
- **Format kontrolü:** ✅ Geçerli görünüyor

## OpenAI API Key ❓
- Lütfen OpenAI API key'inizin başlangıcını paylaşın
- Beklenen format: `sk-` ile başlamalı
- Örnek: `sk-proj-...` veya `sk-xxxxx...`

## Kontrol Listesi

### 1. .env.local Dosyası Kontrolü
Dosyanın şu formatta olması gerekiyor:

```
NEXT_PUBLIC_SUPABASE_URL=https://clcztcmxkmhrtnajciqd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-api03-4rJ...WwAA
```

### 2. Önemli Notlar
- ✅ Değişken adları tam olarak yazılmalı (büyük/küçük harf önemli)
- ✅ Eşittir işaretinden sonra boşluk olmamalı
- ✅ Tırnak işareti kullanmayın
- ✅ Her satırda bir değişken

### 3. Server Yeniden Başlatma
API key'leri ekledikten sonra:
1. Terminal'de `Ctrl+C` ile sunucuyu durdurun
2. `npm run dev` ile yeniden başlatın
3. Sayfayı yenileyin

## Test
Sunucu yeniden başladıktan sonra terminal'de şu log'ları görmelisiniz:
- `OpenAI API key present: true`
- `Anthropic API key present: true`

