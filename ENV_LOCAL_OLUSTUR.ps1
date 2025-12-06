# .env.local dosyası oluştur
$envContent = @"
NEXT_PUBLIC_SUPABASE_URL=https://clcztcmxkmhrtnajciqd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ROlWeValB-FekXr5OeoXRQ_o9YUvIPX
SUPABASE_SERVICE_ROLE_KEY=sb_secret_hfeRqks9ycj-_lkmOXp45g_v9dhJ1u6
OPENAI_API_KEY=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
ANTHROPIC_API_KEY=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
ADMIN_EMAILS=oktaybakin@gmail.com
AUTO_APPROVE_USERS=false
"@

$envContent | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline

Write-Host "✅ .env.local dosyası oluşturuldu!" -ForegroundColor Green
Write-Host "📁 Konum: $PWD\.env.local" -ForegroundColor Cyan

