# 🚀 Vercel CLI ile Otomatik Deploy

Vercel CLI yüklendi! Şimdi deploy edelim.

## ⚠️ ÖNEMLİ: Environment Variables

Deploy etmeden önce `.env.local` dosyanızdaki değerleri hazır bulundurun:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY
- ANTHROPIC_API_KEY

## 🚀 Deploy Adımları

PowerShell'de şu komutları çalıştırın:

### 1. Vercel'e Giriş
```powershell
vercel login
```
- Tarayıcı açılacak, GitHub ile giriş yapın
- Giriş yaptıktan sonra PowerShell'e dönün

### 2. Deploy Et
```powershell
vercel
```

Sorulara şu şekilde cevap verin:
- **Set up and deploy?**: `Y` (Yes)
- **Which scope?**: Hesabınızı seçin
- **Link to existing project?**: `N` (No)
- **What's your project's name?**: `facial-reconstruction-ai`
- **In which directory is your code located?**: `./` (nokta slash)
- **Want to override the settings?**: `N` (No)

### 3. Environment Variables Ekle

Deploy sırasında environment variable'lar sorulacak. Her birini ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=your_value
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
SUPABASE_SERVICE_ROLE_KEY=your_value
OPENAI_API_KEY=your_value
ANTHROPIC_API_KEY=your_value
```

### 4. Production Deploy
```powershell
vercel --prod
```

## ✅ Tamamlandı!

Siteniz canlıda! URL'i terminal'de göreceksiniz.

---

## 🔧 Alternatif: Vercel Dashboard

Eğer CLI ile yapmak istemezseniz:

1. [vercel.com](https://vercel.com) → GitHub ile giriş
2. "Add New Project"
3. "Import Git Repository" yerine "Deploy" seçin
4. Proje klasörünüzü sürükle-bırak
5. Environment variables ekleyin
6. Deploy!

