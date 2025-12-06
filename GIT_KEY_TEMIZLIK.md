# 🚨 Git'te Key'ler Commit Edilmiş - Acil Çözüm

## ⚠️ Sorun

OpenAI, key'lerin public repository'lere commit edildiğini tespit ettiğinde **otomatik olarak key'leri devre dışı bırakır/siler**. Bu güvenlik önlemidir.

---

## 🔍 Kontrol

### 1. Git'te Key'ler Var mı?

**Kontrol edin:**
```bash
cd "C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje"
git log --all --full-history --source -- "*.env*" "vercel-env.txt" "ENV_LOCAL*"
```

**Veya:**
```bash
git grep -i "sk-svcacct\|sk-proj\|OPENAI_API_KEY" -- "*.txt" "*.bat" "*.ps1" "*.md"
```

### 2. GitHub'da Key'ler Görünüyor mu?

1. GitHub repository'nize gidin
2. "Search" ile `OPENAI_API_KEY` veya `sk-svcacct` arayın
3. Eğer bulursanız → **Key'ler commit edilmiş!**

---

## ✅ Acil Çözüm

### Adım 1: Key'leri Git'ten Kaldırın

**1. Key içeren dosyaları `.gitignore`'a ekleyin:**

`.gitignore` dosyasında şunlar olmalı:
```
.env*
vercel-env.txt
ENV_LOCAL_OLUSTUR.bat
ENV_LOCAL_OLUSTUR.ps1
```

**2. Git'ten dosyaları kaldırın (ama yerel dosyaları koruyun):**

```bash
git rm --cached vercel-env.txt
git rm --cached ENV_LOCAL_OLUSTUR.bat
git rm --cached ENV_LOCAL_OLUSTUR.ps1
git rm --cached .env.local
```

**3. Commit edin:**

```bash
git add .gitignore
git commit -m "Remove API keys from Git - security fix"
git push
```

### Adım 2: Git History'den Key'leri Temizleyin

**⚠️ ÖNEMLİ: Bu işlem Git history'yi değiştirir!**

**Eğer repository public ise ve key'ler commit edilmişse:**

1. **BFG Repo-Cleaner kullanın (Önerilen):**
   ```bash
   # BFG Repo-Cleaner indirin: https://rtyley.github.io/bfg-repo-cleaner/
   # Key'leri temizleyin
   java -jar bfg.jar --replace-text passwords.txt
   ```

2. **Veya Git Filter-Branch (Manuel):**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch vercel-env.txt ENV_LOCAL_OLUSTUR.bat ENV_LOCAL_OLUSTUR.ps1" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push (Dikkatli!):**
   ```bash
   git push --force --all
   git push --force --tags
   ```

**⚠️ UYARI:** Force push yapmadan önce tüm takım üyelerine haber verin!

### Adım 3: Yeni Key Oluşturun

**Key'ler OpenAI tarafından silinmiş olabilir:**

1. **OpenAI Platform:**
   - https://platform.openai.com/api-keys
   - Yeni key oluşturun: "Create new secret key"

2. **Yeni key'i ekleyin:**
   - Vercel Dashboard → Environment Variables
   - `vercel-env.txt` dosyasını güncelleyin
   - Yerel `.env.local` dosyasını güncelleyin

---

## 🛡️ Önleme

### Key'leri Git'ten Uzak Tutun

**1. `.gitignore` Kontrolü:**

`.gitignore` dosyasında şunlar olmalı:
```
# Environment files
.env*
vercel-env.txt
ENV_LOCAL_OLUSTUR.bat
ENV_LOCAL_OLUSTUR.ps1

# Key dosyaları
*key*.txt
*secret*.txt
*password*.txt
```

**2. Pre-commit Hook (İsteğe Bağlı):**

Key'lerin commit edilmesini engellemek için:

```bash
# .git/hooks/pre-commit dosyası oluşturun
#!/bin/sh
if git diff --cached --name-only | grep -E "(vercel-env|ENV_LOCAL|\.env)"; then
    echo "❌ HATA: API key dosyaları commit edilemez!"
    exit 1
fi
```

**3. GitHub Secret Scanning:**

GitHub otomatik olarak key'leri tarar. Eğer bulursa:
- Size email gönderir
- Key'i otomatik devre dışı bırakır (OpenAI)

---

## 📋 Kontrol Listesi

- [ ] `.gitignore` dosyasında key dosyaları var mı?
- [ ] Git'te key'ler commit edilmiş mi? (kontrol ettiniz mi?)
- [ ] GitHub'da key'ler görünüyor mu?
- [ ] Key'leri Git'ten kaldırdınız mı?
- [ ] Git history'den temizlediniz mi? (gerekirse)
- [ ] Yeni key oluşturdunuz mu?
- [ ] Yeni key'i Vercel'e eklediniz mi?
- [ ] Test ettiniz mi?

---

## 🆘 Key'ler Silindi - Ne Yapmalı?

### 1. Yeni Key Oluşturun

**OpenAI Platform:**
1. https://platform.openai.com/api-keys
2. "Create new secret key"
3. Key'i kopyalayın

### 2. Tüm Yerlere Ekleyin

- ✅ Vercel Dashboard → Environment Variables
- ✅ `vercel-env.txt` dosyası
- ✅ Yerel `.env.local` dosyası

### 3. Test Edin

- ✅ Localhost'ta test edin
- ✅ Vercel'de test edin

---

## 🔐 Güvenlik Best Practices

**Key'leri Asla:**
- ❌ Git'e commit etmeyin
- ❌ Public repository'lere yüklemeyin
- ❌ Screenshot'ta paylaşmayın
- ❌ Email'de paylaşmayın

**Key'leri Güvenli Şekilde:**
- ✅ Vercel Environment Variables'da saklayın
- ✅ `.gitignore`'da tutun
- ✅ Password manager kullanın
- ✅ Sadece güvenilir kişilerle paylaşın

---

**Key'leriniz Git'te commit edilmişse, hemen temizleyin ve yeni key oluşturun!** 🚨

