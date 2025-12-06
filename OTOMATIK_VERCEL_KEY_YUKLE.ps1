# Vercel'e Otomatik Key Yükleme Scripti
# Bu script key'leri vercel-env.txt'den okuyup Vercel'e otomatik yükler

$projectPath = "C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje"
Set-Location $projectPath

Write-Host "🚀 Vercel'e API Key'ler otomatik yükleniyor..." -ForegroundColor Green

# Key'ler vercel-env.txt dosyasından okunacak
$envFile = Join-Path $projectPath "vercel-env.txt"

if (-not (Test-Path $envFile)) {
    Write-Host "❌ vercel-env.txt dosyası bulunamadı!" -ForegroundColor Red
    exit 1
}

# vercel-env.txt'den key'leri oku
$envLines = Get-Content $envFile | Where-Object { $_ -match "^[A-Z_]+=" -and $_ -notmatch "^#" }

$envVars = @{}
foreach ($line in $envLines) {
    if ($line -match "^([A-Z_]+)=(.*)$") {
        $key = $matches[1]
        $value = $matches[2].Trim()
        if ($value -and $value -ne "") {
            $envVars[$key] = $value
        }
    }
}

Write-Host "✅ $($envVars.Count) adet environment variable bulundu" -ForegroundColor Green

# Vercel CLI kontrolü
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI bulunamadı!" -ForegroundColor Red
    Write-Host "📦 Yüklemek için: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Vercel projesine bağlı mı kontrol et
Write-Host "`n🔍 Vercel projesi kontrol ediliyor..." -ForegroundColor Cyan
$vercelLinked = Test-Path ".vercel\project.json"
if (-not $vercelLinked) {
    Write-Host "⚠️  Vercel projesi bağlı değil. Önce 'vercel link' komutunu çalıştırın." -ForegroundColor Yellow
    exit 1
}

# Her bir key'i Vercel'e yükle
Write-Host "`n📤 Key'ler Vercel'e yükleniyor..." -ForegroundColor Cyan
$successCount = 0
$failCount = 0

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "  → $key yükleniyor..." -ForegroundColor Yellow
    
    try {
        # Vercel CLI ile environment variable ekle
        $value | vercel env add $key production preview development 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ $key başarıyla yüklendi" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "    ⚠️  $key zaten mevcut veya hata oluştu" -ForegroundColor Yellow
            # Zaten varsa güncelle
            $value | vercel env rm $key production preview development --yes 2>&1 | Out-Null
            $value | vercel env add $key production preview development 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ $key güncellendi" -ForegroundColor Green
                $successCount++
            } else {
                $failCount++
            }
        }
    } catch {
        Write-Host "    ❌ $key yüklenirken hata: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n📊 Özet:" -ForegroundColor Cyan
Write-Host "  ✅ Başarılı: $successCount" -ForegroundColor Green
Write-Host "  ❌ Başarısız: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })

if ($successCount -gt 0) {
    Write-Host "`n✅ Key'ler Vercel'e otomatik olarak yüklendi!" -ForegroundColor Green
    Write-Host "🚀 Deploy için: vercel --prod" -ForegroundColor Cyan
}

