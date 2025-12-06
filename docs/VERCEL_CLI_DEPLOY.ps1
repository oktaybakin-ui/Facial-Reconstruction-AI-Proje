# 🚀 Vercel CLI ile Direkt Deploy (Git Olmadan!)
# Bu script Vercel CLI kullanarak projeyi direkt deploy eder

Write-Host "🚀 Vercel CLI Deploy Başlatılıyor..." -ForegroundColor Green

# Proje klasörüne git
$projectPath = "C:\Users\oktay\Desktop\OKO YAPAY ZEKA\Facial-Reconstruction-AI-Dokumantasyon\Proje-Kaynak-Dosyalari"
Set-Location $projectPath

Write-Host "📁 Proje klasörüne gidildi: $projectPath" -ForegroundColor Cyan

# Vercel CLI kontrolü
Write-Host "🔍 Vercel CLI kontrol ediliyor..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI yüklü değil. Yükleniyor..." -ForegroundColor Yellow
    npm install -g vercel
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Vercel CLI yüklenemedi. Lütfen manuel olarak yükleyin:" -ForegroundColor Red
        Write-Host "npm install -g vercel" -ForegroundColor White
        exit 1
    }
}

Write-Host "✅ Vercel CLI hazır!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Şimdi şu adımları takip edin:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Vercel'e giriş yapın:" -ForegroundColor Yellow
Write-Host "   vercel login" -ForegroundColor White
Write-Host ""
Write-Host "2. Deploy edin:" -ForegroundColor Yellow
Write-Host "   vercel" -ForegroundColor White
Write-Host ""
Write-Host "3. Production deploy:" -ForegroundColor Yellow
Write-Host "   vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "💡 Sorulara cevap verirken:" -ForegroundColor Cyan
Write-Host "   - Set up and deploy?: Y" -ForegroundColor White
Write-Host "   - Link to existing project?: N" -ForegroundColor White
Write-Host "   - Project name: facial-reconstruction-ai" -ForegroundColor White
Write-Host "   - Directory: ./" -ForegroundColor White
Write-Host ""

