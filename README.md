# Facial Reconstruction AI

Yapay zeka destekli yüz rekonstrüksiyon ve lezyon analiz platformu.

## 🚀 Kurulum

### Node.js Uygulaması

```bash
npm install
npm run dev
```

### Python 3D Reconstruction Service (Opsiyonel - Önerilir)

3D yüz rekonstrüksiyonu için Python microservice kurulumu:

```bash
cd face-3d-service

# Virtual environment oluştur
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# Paketleri yükle (requirements.txt oluşturmayı unutmayın)
pip install -r requirements.txt

# Servisi başlat
python app.py
```

Detaylı kurulum için: `FACE_3D_SERVICE_SETUP.md` dosyasına bakın.

## 📋 Environment Variables

`.env.local` dosyası oluşturun ve gerekli değişkenleri ekleyin:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# OpenAI & Anthropic
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...

# Python 3D Service (Opsiyonel)
PYTHON_FACE_3D_SERVICE_URL=http://localhost:8000

# Admin
ADMIN_EMAILS=admin@example.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

## ✨ Özellikler

- 🤖 AI destekli yüz rekonstrüksiyon analizi
- 🎯 Lokal flep planlama önerileri
- 📸 Çoklu fotoğraf yükleme ve analiz
- 🎭 3D yüz modeli oluşturma (Python service ile)
- 📚 Tıbbi kaynak entegrasyonu
- 👥 Kullanıcı yönetimi ve doğrulama sistemi
- 🔒 Güvenli veri saklama (Supabase)

## 🚀 Deployment

Vercel'e deploy için `vercel.json` dosyası hazırdır.

Python service'i ayrı olarak deploy etmeniz gerekir (Docker, Cloud Functions, vb.).
