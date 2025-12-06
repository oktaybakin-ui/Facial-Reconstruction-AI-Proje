# 🚀 GitHub'a Yükleme - Adım Adım Rehber

## 📋 Ön Hazırlık

### 1. Git Kurulumu (Eğer yüklü değilse)

1. [git-scm.com/download/win](https://git-scm.com/download/win) adresine gidin
2. Windows için Git'i indirin ve kurun
3. Kurulum sırasında varsayılan ayarları kullanın
4. Kurulumdan sonra PowerShell'i yeniden başlatın

### 2. GitHub Hesabı

1. [github.com](https://github.com) adresine gidin
2. Hesap oluşturun (eğer yoksa)
3. Giriş yapın

---

## 🔧 Adım 1: Git Repository Oluşturma

PowerShell'i açın ve şu komutları çalıştırın:

```powershell
# Proje klasörüne gidin
cd "C:\Users\oktay\Desktop\OKO YAPAY ZEKA\Facial-Reconstruction-AI-Dokumantasyon\Proje-Kaynak-Dosyalari"

# Git başlat (eğer daha önce başlatılmadıysa)
git init

# Git kullanıcı bilgilerinizi ayarlayın (ilk kez kullanıyorsanız)
git config --global user.name "Adınız Soyadınız"
git config --global user.email "email@example.com"

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: Facial Reconstruction AI project"
```

---

## 🌐 Adım 2: GitHub Repository Oluşturma

1. **GitHub.com'a gidin** ve giriş yapın
2. Sağ üstteki **"+"** butonuna tıklayın
3. **"New repository"** seçin
4. Repository bilgilerini doldurun:
   - **Repository name**: `facial-reconstruction-ai` (veya istediğiniz isim)
   - **Description**: "AI Destekli Yüz Rekonstrüksiyon Platformu"
   - **Public** veya **Private** seçin (önerilen: **Private** - API key'leriniz için güvenli)
   - **"Add a README file"** seçeneğini işaretlemeyin (zaten var)
   - **"Add .gitignore"** seçeneğini işaretlemeyin (zaten var)
5. **"Create repository"** butonuna tıklayın

---

## 📤 Adım 3: GitHub'a Push Etme

GitHub'da repository oluşturduktan sonra, sayfada gösterilen komutları kullanın:

**ÖNEMLİ**: `YOUR_USERNAME` ve `REPO_NAME` kısımlarını kendi bilgilerinizle değiştirin!

```powershell
# Remote repository ekle
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Branch adını main yap (eğer master ise)
git branch -M main

# GitHub'a push et
git push -u origin main
```

**Not**: İlk push'ta GitHub kullanıcı adı ve şifre isteyebilir. Şifre yerine **Personal Access Token** kullanmanız gerekebilir.

### Personal Access Token Oluşturma (Gerekirse)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **"Generate new token"** → **"Generate new token (classic)"**
3. **Note**: "Vercel Deployment" (veya istediğiniz isim)
4. **Expiration**: 90 days (veya istediğiniz süre)
5. **Scopes**: `repo` seçeneğini işaretleyin
6. **"Generate token"** butonuna tıklayın
7. **Token'ı kopyalayın** (bir daha gösterilmeyecek!)
8. Push yaparken şifre yerine bu token'ı kullanın

---

## ✅ Adım 4: Kontrol

GitHub repository sayfanızda tüm dosyalarınızı görmelisiniz!

---

## 🎯 Sonraki Adım: Vercel'e Deploy

GitHub'a yükleme tamamlandıktan sonra `YAYINLAMA_REHBERI.md` dosyasındaki **"2. Vercel'e Deploy Etme"** bölümüne geçin.

---

## 🆘 Sorun Giderme

### "git is not recognized" hatası
- Git yüklü değil → Yukarıdaki "Git Kurulumu" bölümüne bakın
- PowerShell'i yeniden başlatın

### "Authentication failed" hatası
- Personal Access Token kullanın (şifre yerine)
- Token'ı doğru kopyaladığınızdan emin olun

### "Repository not found" hatası
- Repository adını ve kullanıcı adını kontrol edin
- Repository'nin var olduğundan emin olun

---

## 📝 Özet Komutlar

```powershell
# 1. Proje klasörüne git
cd "C:\Users\oktay\Desktop\OKO YAPAY ZEKA\Facial-Reconstruction-AI-Dokumantasyon\Proje-Kaynak-Dosyalari"

# 2. Git başlat
git init

# 3. Dosyaları ekle
git add .

# 4. Commit yap
git commit -m "Initial commit"

# 5. Remote ekle (YOUR_USERNAME ve REPO_NAME'i değiştirin)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 6. Branch adını main yap
git branch -M main

# 7. Push et
git push -u origin main
```

