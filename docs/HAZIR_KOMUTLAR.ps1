# 🚀 GitHub'a Yükleme - Hazır PowerShell Komutları
# Git kurulumundan SONRA bu dosyayı çalıştırın

Write-Host "🚀 GitHub'a Yükleme Başlatılıyor..." -ForegroundColor Green

# Proje klasörüne git
$projectPath = "C:\Users\oktay\Desktop\OKO YAPAY ZEKA\Facial-Reconstruction-AI-Dokumantasyon\Proje-Kaynak-Dosyalari"
Set-Location $projectPath

Write-Host "📁 Proje klasörüne gidildi: $projectPath" -ForegroundColor Cyan

# Git başlat
Write-Host "🔧 Git repository başlatılıyor..." -ForegroundColor Yellow
git init

# Git kullanıcı bilgileri (DEĞİŞTİRİN!)
Write-Host "👤 Git kullanıcı bilgileri ayarlanıyor..." -ForegroundColor Yellow
Write-Host "⚠️  LÜTFEN AŞAĞIDAKİ KOMUTLARI KENDİ BİLGİLERİNİZLE DEĞİŞTİRİN!" -ForegroundColor Red
Write-Host ""
Write-Host "git config --global user.name 'Adınız Soyadınız'" -ForegroundColor White
Write-Host "git config --global user.email 'email@example.com'" -ForegroundColor White
Write-Host ""

# Dosyaları ekle
Write-Host "📦 Dosyalar ekleniyor..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "💾 Commit yapılıyor..." -ForegroundColor Yellow
git commit -m "Initial commit: Facial Reconstruction AI project"

Write-Host ""
Write-Host "✅ Yerel Git repository hazır!" -ForegroundColor Green
Write-Host ""
Write-Host "📤 Şimdi GitHub'da repository oluşturun ve şu komutları çalıştırın:" -ForegroundColor Cyan
Write-Host ""
Write-Host "git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADI.git" -ForegroundColor White
Write-Host "git branch -M main" -ForegroundColor White
Write-Host "git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  KULLANICI_ADINIZ ve REPO_ADI kısımlarını değiştirmeyi unutmayın!" -ForegroundColor Red

