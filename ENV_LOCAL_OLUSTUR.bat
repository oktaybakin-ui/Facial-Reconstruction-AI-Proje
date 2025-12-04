@echo off
cd /d "C:\Users\oktay\Desktop\Facial-Reconstruction-AI-Proje"

(
echo NEXT_PUBLIC_SUPABASE_URL=https://clcztcmxkmhrtnajciqd.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ROlWeValB-FekXr5OeoXRQ_o9YUvIPX
echo SUPABASE_SERVICE_ROLE_KEY=sb_secret_hfeRqks9ycj-_lkmOXp45g_v9dhJ1u6
echo OPENAI_API_KEY=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
echo ANTHROPIC_API_KEY=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
echo ADMIN_EMAILS=oktaybakin@gmail.com
echo AUTO_APPROVE_USERS=false
) > .env.local

echo ✅ .env.local dosyasi olusturuldu!
echo 📁 Konum: %CD%\.env.local
pause

