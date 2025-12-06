# Facial Reconstruction AI - Proje Dosyaları Listesi

## 📁 Proje Yapısı

```
facial-reconstruction-ai/
├── facial-reconstruction-ai/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── admin/
│   │   │   │   └── check/route.ts    # Admin yetki kontrolü
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts # Kayıt API
│   │   │   │   └── login/route.ts    # Giriş API
│   │   │   ├── cases/
│   │   │   │   ├── route.ts          # Olgu CRUD (GET, POST)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts      # Tekil olgu (GET, PUT, DELETE)
│   │   │   │       ├── analyze/route.ts # AI analizi
│   │   │   │       └── postop/route.ts  # Post-op foto yükleme
│   │   │   └── medical-sources/
│   │   │       ├── route.ts          # Kaynak CRUD
│   │   │       └── [id]/route.ts     # Tekil kaynak
│   │   ├── auth/
│   │   │   ├── register/page.tsx     # Kayıt sayfası
│   │   │   └── login/page.tsx        # Giriş sayfası
│   │   ├── cases/
│   │   │   ├── new/page.tsx          # Yeni olgu formu
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Olgu detay sayfası
│   │   │       ├── edit/page.tsx     # Olgu düzenleme
│   │   │       └── UnifiedImageOverlay.tsx # Görüntü çizim komponenti
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Dashboard (server component)
│   │   │   └── DashboardContent.tsx  # Dashboard (client component)
│   │   ├── knowledge-base/
│   │   │   ├── page.tsx              # Bilgi tabanı listesi
│   │   │   ├── new/page.tsx          # Yeni kaynak formu
│   │   │   ├── edit/[id]/page.tsx    # Kaynak düzenleme
│   │   │   └── bulk-upload/page.tsx  # Toplu yükleme
│   │   ├── hakkimizda/page.tsx       # Hakkımızda sayfası
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Ana sayfa (landing)
│   ├── lib/
│   │   ├── ai/                       # AI modülleri
│   │   │   ├── vision.ts             # Görüntü analizi
│   │   │   ├── decision.ts           # Flep önerileri
│   │   │   ├── safety.ts             # Güvenlik incelemesi
│   │   │   └── orchestrator.ts       # AI orchestration
│   │   ├── auth/
│   │   │   └── admin.ts              # Admin yetki kontrolü
│   │   ├── medical/
│   │   │   └── sources.ts            # Kaynak yönetimi
│   │   ├── utils/
│   │   │   └── followup.ts           # Takip ve hatırlatma fonksiyonları
│   │   ├── auth.ts                   # Auth utility fonksiyonları
│   │   ├── supabaseClient.ts         # Supabase client
│   │   └── validators.ts             # Zod validation schema'ları
│   ├── types/
│   │   ├── ai.ts                     # AI type tanımları
│   │   ├── cases.ts                  # Case type tanımları
│   │   └── medical.ts                # Medical source type tanımları
│   ├── .env.local                    # Environment variables (Git'te yok)
│   ├── .gitignore                    # Git ignore dosyası
│   ├── next.config.js                # Next.js yapılandırması
│   ├── package.json                  # NPM bağımlılıkları
│   ├── tailwind.config.ts            # Tailwind CSS yapılandırması
│   ├── tsconfig.json                 # TypeScript yapılandırması
│   └── README.md                     # Proje README
```

---

## 📄 Önemli Dosyalar

### Configuration Files
- `package.json` - Proje bağımlılıkları ve script'ler
- `tsconfig.json` - TypeScript yapılandırması
- `tailwind.config.ts` - Tailwind CSS yapılandırması
- `next.config.js` - Next.js yapılandırması
- `.env.local` - Environment variables (oluşturulmalı)

### Type Definitions
- `types/cases.ts` - Olgu veri yapıları
- `types/ai.ts` - AI sonuç veri yapıları
- `types/medical.ts` - Tıbbi kaynak veri yapıları

### Core Libraries
- `lib/supabaseClient.ts` - Supabase client bağlantısı
- `lib/auth.ts` - Kimlik doğrulama yardımcıları
- `lib/validators.ts` - Zod validation schema'ları

### AI Modules
- `lib/ai/vision.ts` - OpenAI Vision API entegrasyonu
- `lib/ai/decision.ts` - Flep önerisi AI modülü
- `lib/ai/safety.ts` - Güvenlik incelemesi (Claude)
- `lib/ai/orchestrator.ts` - AI pipeline orchestration

### Utilities
- `lib/utils/followup.ts` - Takip ve hatırlatma hesaplamaları
- `lib/auth/admin.ts` - Admin yetki kontrolü
- `lib/medical/sources.ts` - Tıbbi kaynak CRUD işlemleri

### API Routes
- `app/api/auth/*` - Kimlik doğrulama API'leri
- `app/api/cases/*` - Olgu yönetimi API'leri
- `app/api/medical-sources/*` - Bilgi tabanı API'leri
- `app/api/admin/*` - Admin API'leri

### Pages
- `app/page.tsx` - Landing page
- `app/auth/*` - Kayıt ve giriş sayfaları
- `app/dashboard/*` - Dashboard ve içerik
- `app/cases/*` - Olgu yönetimi sayfaları
- `app/knowledge-base/*` - Bilgi tabanı sayfaları

---

## 🗄️ SQL Dosyaları (Masaüstünde)

Bu klasörde bulunan SQL dosyaları:

1. **add_case_fields.sql**
   - Vaka bilgileri alanları (tarih, saat, süre, hasta özelliği)
   - Veritabanına yeni kolonlar ekler

2. **add_followup_fields.sql**
   - Operasyon ve takip bilgileri
   - Patoloji takip alanları
   - Kontrol tarihi hesaplama view'i

**Not:** Bu SQL dosyaları Supabase Dashboard > SQL Editor'den çalıştırılmalıdır.

---

## 📦 Bağımlılıklar

### Production Dependencies
```json
{
  "next": "^14.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "@supabase/supabase-js": "^2.x",
  "openai": "^4.x",
  "@anthropic-ai/sdk": "^0.x",
  "zod": "^3.x",
  "tailwindcss": "^3.x",
  "typescript": "^5.x"
}
```

### Development Dependencies
```json
{
  "@types/node": "^20.x",
  "@types/react": "^18.x",
  "eslint": "^8.x",
  "eslint-config-next": "^14.x"
}
```

---

## 🔑 Environment Variables

Gerekli environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Admin
ADMIN_EMAILS=
```

---

## 📊 Veritabanı Tabloları

1. **user_profiles** - Kullanıcı profilleri
2. **cases** - Olgular
3. **case_photos** - Fotoğraflar
4. **ai_results** - AI analiz sonuçları
5. **medical_sources** - Tıbbi kaynaklar

Detaylı şema için SQL dosyalarına bakın.

---

## 🎨 Stil Dosyaları

- `tailwind.config.ts` - Tailwind yapılandırması
- Global CSS - Tailwind direktifleri
- Component-level styling - Tailwind utility classes

---

## 📝 Dokümantasyon Dosyaları

Bu klasördeki dosyalar:
- `PROJE-YOLCULUGU.md` - Detaylı proje tarihçesi
- `KURULUM-TALIMATLARI.md` - Kurulum ve setup kılavuzu
- `PROJE-DOSYALARI-LISTESI.md` - Bu dosya

---

**Son Güncelleme:** Aralık 2024

