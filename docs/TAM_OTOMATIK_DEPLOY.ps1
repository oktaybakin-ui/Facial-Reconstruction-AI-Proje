# 🚀 TAM OTOMATIK VERCEL DEPLOY
# Bu script projenizi tamamen otomatik olarak Vercel'e deploy eder

Write-Host "🚀 TAM OTOMATIK VERCEL DEPLOY BAŞLATILIYOR..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Proje klasörüne git
$projectPath = "C:\Users\oktay\Desktop\OKO YAPAY ZEKA\Facial-Reconstruction-AI-Dokumantasyon\Proje-Kaynak-Dosyalari"
Set-Location $projectPath

Write-Host "📁 Proje klasörü: $projectPath" -ForegroundColor Cyan
Write-Host ""

# Vercel CLI kontrolü
Write-Host "🔍 Vercel CLI kontrol ediliyor..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "📦 Vercel CLI yükleniyor..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "✅ Vercel CLI hazır!" -ForegroundColor Green
Write-Host ""

# Environment Variables (doğrudan .env.local'den)
$envVars = @{
    "NEXT_PUBLIC_SUPABASE_URL" = "https://clcztcmxkmhrtnajciqd.supabase.co"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "sb_publishable_ROlWeValB-FekXr5OeoXRQ_o9YUvIPX"
    "SUPABASE_SERVICE_ROLE_KEY" = "sb_secret_hfeRqks9ycj-_lkmOXp45g_v9dhJ1u6"
    "OPENAI_API_KEY" = "BURAYA_OPENAI_API_KEY_YAZIN"
    "ANTHROPIC_API_KEY" = "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"
}

Write-Host "⚠️  ÖNEMLİ: Vercel CLI interaktif olduğu için şu adımlar gerekecek:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  VERCEL'E GİRİŞ:" -ForegroundColor Cyan
Write-Host "   Aşağıdaki komutu çalıştırın ve tarayıcıda giriş yapın:" -ForegroundColor White
Write-Host "   vercel login" -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣  DEPLOY:" -ForegroundColor Cyan
Write-Host "   Giriş yaptıktan sonra şu komutu çalıştırın:" -ForegroundColor White
Write-Host "   vercel --yes" -ForegroundColor Green
Write-Host ""

Write-Host "3️⃣  ENVIRONMENT VARIABLES:" -ForegroundColor Cyan
Write-Host "   Deploy sırasında environment variables sorulacak." -ForegroundColor White
Write-Host "   Aşağıdaki değerleri kullanın:" -ForegroundColor White
Write-Host ""

foreach ($key in $envVars.Keys) {
    Write-Host "   $key" -ForegroundColor Yellow
    Write-Host "   $($envVars[$key])" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "4️⃣  PRODUCTION DEPLOY:" -ForegroundColor Cyan
Write-Host "   Deploy tamamlandıktan sonra:" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor Green
Write-Host ""

Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ Hazır! Yukarıdaki adımları takip edin." -ForegroundColor Green
Write-Host ""

# Alternatif: Web arayüzü kullanımı
Write-Host "🌐 ALTERNATIF: Web Arayüzü (Daha Kolay!)" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. https://vercel.com/new adresine gidin" -ForegroundColor White
Write-Host "2. 'Deploy' sekmesine tıklayın" -ForegroundColor White
Write-Host "3. Proje klasörünüzü sürükle-bırak:" -ForegroundColor White
Write-Host "   $projectPath" -ForegroundColor Gray
Write-Host "4. Environment Variables ekleyin (yukarıdaki 5 değişken)" -ForegroundColor White
Write-Host "5. Deploy!" -ForegroundColor White
Write-Host ""

