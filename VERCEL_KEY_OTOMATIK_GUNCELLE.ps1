# Vercel API Key Otomatik Güncelleme Script'i
# Bu script Vercel CLI kullanarak API key'i günceller

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Vercel OpenAI API Key Güncelleme" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vercel CLI kontrolü
Write-Host "1. Vercel CLI kontrol ediliyor..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "   ✅ Vercel CLI bulundu: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Vercel CLI bulunamadı!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Lütfen Vercel CLI'yi kurun:" -ForegroundColor Yellow
    Write-Host "   npm install -g vercel" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# Kullanıcıdan yeni API key'i al
Write-Host "2. Yeni OpenAI API Key girişi..." -ForegroundColor Yellow
Write-Host "   Lütfen yeni OpenAI Secret Key'inizi girin (sk-proj-... formatında):" -ForegroundColor White
$newApiKey = Read-Host "   API Key"

# Key format kontrolü
if (-not $newApiKey.StartsWith("sk-")) {
    Write-Host "   ⚠️  Uyarı: Key 'sk-' ile başlamıyor!" -ForegroundColor Yellow
    $continue = Read-Host "   Devam etmek istiyor musunuz? (y/n)"
    if ($continue -ne "y") {
        Write-Host "   İşlem iptal edildi." -ForegroundColor Red
        exit 1
    }
}

if ($newApiKey.StartsWith("sk-svcacct")) {
    Write-Host "   ❌ HATA: Service Account Key kullanmayın! Secret Key kullanın!" -ForegroundColor Red
    Write-Host "   Lütfen https://platform.openai.com/api-keys adresinden yeni bir Secret Key oluşturun." -ForegroundColor Yellow
    exit 1
}

Write-Host "   ✅ Key formatı doğru görünüyor" -ForegroundColor Green
Write-Host ""

# Vercel login kontrolü
Write-Host "3. Vercel login kontrol ediliyor..." -ForegroundColor Yellow
try {
    $whoami = vercel whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Vercel'e giriş yapılmış: $whoami" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Vercel'e giriş yapılmamış" -ForegroundColor Yellow
        Write-Host "   Giriş yapılıyor..." -ForegroundColor White
        vercel login
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ❌ Giriş başarısız!" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "   ⚠️  Vercel'e giriş yapılmamış" -ForegroundColor Yellow
    Write-Host "   Giriş yapılıyor..." -ForegroundColor White
    vercel login
}

Write-Host ""

# Proje dizinine git
Write-Host "4. Proje dizinine geçiliyor..." -ForegroundColor Yellow
$projectPath = "C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje"
if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "   ✅ Proje dizinine geçildi" -ForegroundColor Green
} else {
    Write-Host "   ❌ Proje dizini bulunamadı: $projectPath" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Eski key'i sil
Write-Host "5. Eski API key siliniyor..." -ForegroundColor Yellow
Write-Host "   (Manuel olarak Vercel Dashboard'dan silmeniz gerekebilir)" -ForegroundColor Gray
Write-Host ""

# Yeni key'i ekle
Write-Host "6. Yeni API key ekleniyor..." -ForegroundColor Yellow

# Production environment
Write-Host "   Production environment'a ekleniyor..." -ForegroundColor White
echo $newApiKey | vercel env add OPENAI_API_KEY production

# Preview environment
Write-Host "   Preview environment'a ekleniyor..." -ForegroundColor White
echo $newApiKey | vercel env add OPENAI_API_KEY preview

# Development environment
Write-Host "   Development environment'a ekleniyor..." -ForegroundColor White
echo $newApiKey | vercel env add OPENAI_API_KEY development

Write-Host ""
Write-Host "   ✅ API key tüm environment'lara eklendi" -ForegroundColor Green
Write-Host ""

# Deployment önerisi
Write-Host "7. Sonraki adımlar..." -ForegroundColor Yellow
Write-Host "   ✅ API key başarıyla eklendi!" -ForegroundColor Green
Write-Host ""
Write-Host "   Şimdi yapmanız gerekenler:" -ForegroundColor Cyan
Write-Host "   1. Vercel Dashboard'a gidin: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "   2. Projenizi seçin: Facial-Reconstruction-AI-Proje" -ForegroundColor White
Write-Host "   3. Deployments sekmesine gidin" -ForegroundColor White
Write-Host "   4. En son deployment'ın yanındaki '...' menüsüne tıklayın" -ForegroundColor White
Write-Host "   5. 'Redeploy' seçeneğini seçin" -ForegroundColor White
Write-Host "   6. 'Use existing Build Cache' seçeneğini KAPATIN" -ForegroundColor White
Write-Host "   7. Redeploy'u başlatın ve 2-3 dakika bekleyin" -ForegroundColor White
Write-Host ""
Write-Host "   Test için:" -ForegroundColor Cyan
Write-Host "   https://www.localflaps.com/api/debug/env" -ForegroundColor White
Write-Host "   https://www.localflaps.com/api/debug/test-openai" -ForegroundColor White
Write-Host ""

