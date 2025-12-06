# 🔐 Otomatik API Key Yönetimi

API key'lerinizi manuel olarak girmenize gerek yok! Tüm key'ler otomatik olarak ayarlanır.

## 📋 Nasıl Çalışır?

1. **Key'ler `vercel-env.txt` dosyasında saklanır**
2. **Proje başlatıldığında otomatik olarak `.env.local` oluşturulur**
3. **Manuel işlem gerekmez!**

## 🚀 Kullanım

### Yerel Geliştirme

```bash
# Normal şekilde projeyi başlatın
npm run dev
```

Bu komut otomatik olarak:
- ✅ `vercel-env.txt` dosyasını okur
- ✅ `.env.local` dosyasını oluşturur
- ✅ Tüm key'leri ayarlar
- ✅ Projeyi başlatır

### Manuel Key Ayarlama (İsteğe Bağlı)

Eğer sadece key'leri ayarlamak isterseniz:

```bash
# PowerShell script ile
npm run setup-keys

# Veya direkt
powershell -ExecutionPolicy Bypass -File OTOMATIK_KEY_AYARLA.ps1
```

### Vercel'e Key Yükleme

Vercel'e key'leri otomatik yüklemek için:

```bash
powershell -ExecutionPolicy Bypass -File OTOMATIK_VERCEL_KEY_YUKLE.ps1
```

Bu script:
- ✅ `vercel-env.txt` dosyasını okur
- ✅ Tüm key'leri Vercel'e yükler
- ✅ Production, Preview ve Development ortamlarına ekler

## 📁 Dosya Yapısı

```
proje/
├── vercel-env.txt          # Key'ler burada (Git'te YOK)
├── .env.local              # Otomatik oluşturulur (Git'te YOK)
├── setup-env.js            # Otomatik kurulum scripti
├── OTOMATIK_KEY_AYARLA.ps1  # Manuel key ayarlama
└── OTOMATIK_VERCEL_KEY_YUKLE.ps1  # Vercel'e yükleme
```

## ⚙️ Otomatik Çalışma

`package.json` dosyasındaki script'ler otomatik olarak key'leri ayarlar:

```json
{
  "scripts": {
    "dev": "node setup-env.js && next dev",
    "build": "node setup-env.js && next build",
    "setup-env": "node setup-env.js",
    "setup-keys": "powershell -ExecutionPolicy Bypass -File OTOMATIK_KEY_AYARLA.ps1"
  }
}
```

## 🔒 Güvenlik

- ✅ `vercel-env.txt` `.gitignore`'da (Git'e commit edilmez)
- ✅ `.env.local` `.gitignore`'da (Git'e commit edilmez)
- ✅ Key'ler sadece yerel ve Vercel'de saklanır

## 📝 Key'leri Güncelleme

Key'lerinizi güncellemek için:

1. `vercel-env.txt` dosyasını düzenleyin
2. `npm run dev` komutunu çalıştırın
3. Key'ler otomatik olarak güncellenir!

## 🆘 Sorun Giderme

### Key'ler ayarlanmıyor

```bash
# Manuel olarak ayarlayın
npm run setup-keys
```

### Vercel'e key'ler yüklenmiyor

```bash
# Vercel CLI'nin yüklü olduğundan emin olun
npm install -g vercel

# Projeyi bağlayın (ilk kez)
vercel link

# Key'leri yükleyin
powershell -ExecutionPolicy Bypass -File OTOMATIK_VERCEL_KEY_YUKLE.ps1
```

## ✅ Kontrol Listesi

- [x] `vercel-env.txt` dosyası mevcut
- [x] Key'ler `vercel-env.txt` içinde
- [x] `npm run dev` çalıştırıldığında key'ler otomatik ayarlanıyor
- [x] Vercel'e deploy ederken key'ler otomatik yükleniyor

---

**Artık manuel key girişi yapmanıza gerek yok! 🎉**

