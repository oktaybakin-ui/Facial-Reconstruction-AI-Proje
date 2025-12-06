# 🚀 Otomatik Vercel Deploy Script
# Bu script projenizi otomatik olarak Vercel'e deploy eder

Write-Host "🚀 Otomatik Vercel Deploy Başlatılıyor..." -ForegroundColor Green
Write-Host ""

# Proje klasörüne git
$projectPath = "C:\Users\oktay\Desktop\OKO YAPAY ZEKA\Facial-Reconstruction-AI-Dokumantasyon\Proje-Kaynak-Dosyalari"
Set-Location $projectPath

Write-Host "📁 Proje klasörü: $projectPath" -ForegroundColor Cyan
Write-Host ""

# .env.local dosyasını oku
$envFile = Join-Path $projectPath ".env.local"
if (Test-Path $envFile) {
    Write-Host "✅ .env.local dosyası bulundu" -ForegroundColor Green
    
    # Environment variables'ı oku
    $envVars = @{}
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($key -and $value) {
                $envVars[$key] = $value
            }
        }
    }
    
    Write-Host "✅ Environment variables okundu: $($envVars.Count) adet" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠️  .env.local dosyası bulunamadı!" -ForegroundColor Yellow
    Write-Host "Lütfen .env.local dosyasının mevcut olduğundan emin olun." -ForegroundColor Yellow
    exit 1
}

# Vercel CLI kontrolü
Write-Host "🔍 Vercel CLI kontrol ediliyor..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "📦 Vercel CLI yükleniyor..." -ForegroundColor Yellow
    npm install -g vercel
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Vercel CLI yüklenemedi!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Vercel CLI hazır!" -ForegroundColor Green
Write-Host ""

# Vercel login kontrolü
Write-Host "🔐 Vercel giriş kontrolü..." -ForegroundColor Yellow
Write-Host "⚠️  İlk kez kullanıyorsanız, tarayıcı açılacak ve giriş yapmanız gerekecek." -ForegroundColor Yellow
Write-Host ""

# Vercel deploy (non-interactive)
Write-Host "🚀 Vercel'e deploy ediliyor..." -ForegroundColor Green
Write-Host ""

# Environment variables'ı Vercel'e ekle
Write-Host "📝 Environment variables ekleniyor..." -ForegroundColor Cyan

$requiredVars = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY"
)

foreach ($varName in $requiredVars) {
    if ($envVars.ContainsKey($varName)) {
        $varValue = $envVars[$varName]
        Write-Host "  ✓ $varName" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $varName (BULUNAMADI!)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "⚠️  ÖNEMLİ: Vercel CLI interaktif olduğu için şu adımları manuel yapmanız gerekecek:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Vercel'e giriş yapın (tarayıcı açılacak)" -ForegroundColor White
Write-Host "2. Sorulara cevap verin:" -ForegroundColor White
Write-Host "   - Set up and deploy?: Y" -ForegroundColor Cyan
Write-Host "   - Link to existing project?: N" -ForegroundColor Cyan
Write-Host "   - Project name: facial-reconstruction-ai" -ForegroundColor Cyan
Write-Host "   - Directory: ./" -ForegroundColor Cyan
Write-Host "3. Environment variables ekleyin (yukarıdaki 5 değişken)" -ForegroundColor White
Write-Host ""

# Vercel deploy başlat
Write-Host "🚀 Deploy başlatılıyor..." -ForegroundColor Green
Write-Host ""

# Non-interactive deploy için --yes flag'i kullan
# Ancak ilk kez kullanıyorsa login gerekir
vercel --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deploy başarılı!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Production deploy için:" -ForegroundColor Cyan
    Write-Host "   vercel --prod" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️  Deploy sırasında hata oluştu veya manuel adımlar gerekiyor." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternatif: Vercel web arayüzünü kullanın:" -ForegroundColor Cyan
    Write-Host "   1. https://vercel.com/new adresine gidin" -ForegroundColor White
    Write-Host "   2. 'Deploy' sekmesine tıklayın" -ForegroundColor White
    Write-Host "   3. Proje klasörünüzü sürükle-bırak" -ForegroundColor White
    Write-Host "   4. Environment variables ekleyin" -ForegroundColor White
    Write-Host "   5. Deploy!" -ForegroundColor White
}

