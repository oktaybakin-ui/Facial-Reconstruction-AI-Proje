# Otomatik API Key Ayarlama Scripti
# Bu script .env.local dosyasını otomatik oluşturur ve key'leri ayarlar

$projectPath = "C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje"
Set-Location $projectPath

Write-Host "🔐 API Key'ler otomatik olarak ayarlanıyor..." -ForegroundColor Green

# Key'ler vercel-env.txt dosyasından okunacak
$envFile = Join-Path $projectPath "vercel-env.txt"

if (Test-Path $envFile) {
    Write-Host "✅ vercel-env.txt dosyası bulundu" -ForegroundColor Green
    
    # vercel-env.txt'den key'leri oku
    $envContent = Get-Content $envFile -Raw
    
    # .env.local dosyasını oluştur
    $envContent | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline
    
    Write-Host "✅ .env.local dosyası oluşturuldu!" -ForegroundColor Green
    Write-Host "📁 Konum: $PWD\.env.local" -ForegroundColor Cyan
    
    # Key'lerin varlığını kontrol et
    $envVars = @{
        "NEXT_PUBLIC_SUPABASE_URL" = $false
        "NEXT_PUBLIC_SUPABASE_ANON_KEY" = $false
        "SUPABASE_SERVICE_ROLE_KEY" = $false
        "OPENAI_API_KEY" = $false
        "ANTHROPIC_API_KEY" = $false
        "ADMIN_EMAILS" = $false
    }
    
    foreach ($key in $envVars.Keys) {
        if ($envContent -match "$key=(.+)") {
            $envVars[$key] = $true
            Write-Host "  ✓ $key ayarlandı" -ForegroundColor Cyan
        } else {
            Write-Host "  ⚠️  $key bulunamadı!" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n✅ Tüm key'ler otomatik olarak ayarlandı!" -ForegroundColor Green
    Write-Host "🚀 Projeyi başlatmak için: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "❌ vercel-env.txt dosyası bulunamadı!" -ForegroundColor Red
    Write-Host "📝 Lütfen önce vercel-env.txt dosyasını oluşturun." -ForegroundColor Yellow
    
    # Alternatif: ENV_LOCAL_OLUSTUR.ps1 scriptini çalıştır
    $createScript = Join-Path $projectPath "ENV_LOCAL_OLUSTUR.ps1"
    if (Test-Path $createScript) {
        Write-Host "🔄 ENV_LOCAL_OLUSTUR.ps1 scripti çalıştırılıyor..." -ForegroundColor Yellow
        & $createScript
    }
}

