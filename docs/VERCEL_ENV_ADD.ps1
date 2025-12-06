# Vercel Environment Variables Otomatik Ekleme Scripti

$projectPath = "C:\Users\oktay\Desktop\OKO YAPAY ZEKA\Facial-Reconstruction-AI-Dokumantasyon\Proje-Kaynak-Dosyalari"
Set-Location $projectPath

# Environment variables
$envVars = @{
    "NEXT_PUBLIC_SUPABASE_URL" = "https://clcztcmxkmhrtnajciqd.supabase.co"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "sb_publishable_ROlWeValB-FekXr5OeoXRQ_o9YUvIPX"
    "SUPABASE_SERVICE_ROLE_KEY" = "sb_secret_hfeRqks9ycj-_lkmOXp45g_v9dhJ1u6"
    "OPENAI_API_KEY" = "BURAYA_OPENAI_API_KEY_YAZIN"
    "ANTHROPIC_API_KEY" = "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"
}

Write-Host "🔐 Environment Variables ekleniyor..." -ForegroundColor Green

foreach ($key in $envVars.Keys) {
    Write-Host "  ✓ $key" -ForegroundColor Cyan
    # Vercel CLI ile environment variable ekle
    echo $envVars[$key] | vercel env add $key production preview development
}

Write-Host "✅ Tüm environment variables eklendi!" -ForegroundColor Green

