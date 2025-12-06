# 🔐 API Key'leri Kalıcı Hale Getirme Rehberi

## 🎯 Sorun

API key'ler bazen kayboluyor veya siliniyor. Bunu önlemek için kalıcı bir sistem kuruyoruz.

---

## ✅ Çözüm: 3 Katmanlı Yedekleme Sistemi

### 1. Vercel Environment Variables (Ana Kaynak) ⭐

**Vercel Dashboard'da kalıcı olarak saklayın:**

1. **Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Projeniz → Settings → Environment Variables

2. **Key'leri ekleyin:**
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - Diğer tüm key'ler

3. **Önemli Ayarlar:**
   - ✅ **Environments:** Production, Preview, Development (hepsini seçin)
   - ✅ **Encrypted:** Vercel otomatik şifreler
   - ✅ **Backup:** Vercel otomatik yedekler

4. **Kalıcılık için:**
   - Key'leri **asla silmeyin**
   - Key güncellerken **eski key'i silmeden yeni key ekleyin**
   - Key'leri **düzenli olarak kontrol edin**

### 2. Yerel Yedekleme (Güvenli Depolama) 💾

**Key'leri güvenli bir yerde saklayın:**

#### Yöntem 1: Şifreli Dosya

1. **Güvenli bir klasör oluşturun:**
   ```
   C:\Users\oktay\Desktop\GUVENLI-KEYLER\
   ```

2. **Şifreli bir dosya oluşturun:**
   - `API_KEYS_BACKUP.txt` (şifreli)
   - Veya password manager kullanın (1Password, LastPass, vs.)

3. **Key'leri kaydedin:**
   ```
   OPENAI_API_KEY=sk-... (gerçek key'i buraya yazmayın! Sadece Vercel Dashboard'da saklayın)
   ANTHROPIC_API_KEY=sk-ant-... (gerçek key'i buraya yazmayın! Sadece Vercel Dashboard'da saklayın)
   ```

#### Yöntem 2: Password Manager

**Önerilen:**
- 1Password
- LastPass
- Bitwarden
- Windows Credential Manager

**Avantajları:**
- ✅ Şifreli saklama
- ✅ Otomatik yedekleme
- ✅ Güvenli paylaşım
- ✅ Erişim geçmişi

### 3. Proje Dosyası (Yedek) 📁

**`vercel-env.txt` dosyasını güncel tutun:**

1. **Dosya konumu:**
   ```
   C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje\vercel-env.txt
   ```

2. **Güncel tutun:**
   - Key değiştiğinde bu dosyayı güncelleyin
   - Bu dosya `.gitignore`'da (Git'e commit edilmez)

3. **Yedek alın:**
   - Düzenli olarak bu dosyayı güvenli bir yere kopyalayın
   - USB, cloud storage, vs.

---

## 🔄 Key Rotation (Key Değiştirme) Sistemi

### Güvenli Key Değiştirme Adımları

1. **Yeni key oluşturun:**
   - OpenAI Platform → API Keys → Create new secret key
   - Yeni key'i kopyalayın

2. **Eski key'i silmeden yeni key'i ekleyin:**
   - Vercel'de yeni key'i ekleyin
   - Test edin
   - Çalışıyorsa eski key'i silin

3. **Tüm yedekleri güncelleyin:**
   - `vercel-env.txt` dosyasını güncelleyin
   - Password manager'ı güncelleyin
   - Yerel yedekleri güncelleyin

---

## 🛡️ Key Güvenliği

### Key'leri Asla:

❌ Git'e commit etmeyin  
❌ Public repository'lere yüklemeyin  
❌ Email'de paylaşmayın  
❌ Screenshot'ta paylaşmayın  
❌ Chat'te paylaşmayın (güvenli olmayan)

### Key'leri Güvenli Şekilde:

✅ Vercel Environment Variables'da saklayın  
✅ Password manager kullanın  
✅ Şifreli dosyalarda saklayın  
✅ Sadece güvenilir kişilerle paylaşın  
✅ Düzenli olarak rotate edin (3-6 ayda bir)

---

## 📋 Kontrol Listesi

### Haftalık Kontrol:
- [ ] Vercel'de key'ler mevcut mu?
- [ ] Key'ler aktif mi?
- [ ] Billing/quota durumu nasıl?

### Aylık Kontrol:
- [ ] Yedekler güncel mi?
- [ ] Key rotation gerekli mi?
- [ ] Güvenlik kontrolü yapıldı mı?

### Key Değiştiğinde:
- [ ] Vercel'de güncellendi mi?
- [ ] `vercel-env.txt` güncellendi mi?
- [ ] Password manager güncellendi mi?
- [ ] Yerel yedekler güncellendi mi?
- [ ] Test edildi mi?

---

## 🔧 Otomatik Yedekleme Scripti

### PowerShell Script (İsteğe Bağlı)

```powershell
# API Key Yedekleme Scripti
$backupPath = "C:\Users\oktay\Desktop\GUVENLI-KEYLER\API_KEYS_BACKUP_$(Get-Date -Format 'yyyy-MM-dd').txt"
$sourceFile = "C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje\vercel-env.txt"

if (Test-Path $sourceFile) {
    Copy-Item $sourceFile $backupPath
    Write-Host "✅ Yedek oluşturuldu: $backupPath" -ForegroundColor Green
} else {
    Write-Host "❌ Kaynak dosya bulunamadı!" -ForegroundColor Red
}
```

---

## 🆘 Key Kaybolduğunda

### Acil Durum Planı:

1. **Vercel'de kontrol edin:**
   - Settings → Environment Variables
   - Key'ler hala orada mı?

2. **Yedeklerden geri yükleyin:**
   - Password manager'dan
   - Yerel yedeklerden
   - `vercel-env.txt` dosyasından

3. **Yeni key oluşturun:**
   - Eğer key gerçekten kaybolduysa
   - OpenAI Platform'dan yeni key oluşturun
   - Tüm yerlere ekleyin

---

## 📝 Özet

**Kalıcılık için 3 katman:**

1. **Vercel Environment Variables** (Ana kaynak)
2. **Password Manager** (Güvenli yedek)
3. **Yerel Dosya** (`vercel-env.txt` - Hızlı erişim)

**Önemli:**
- Key'leri düzenli kontrol edin
- Yedekleri güncel tutun
- Key rotation yapın
- Güvenli saklayın

---

**Artık key'leriniz kalıcı ve güvenli! 🔐**

