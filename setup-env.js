// Otomatik .env.local dosyası oluşturma scripti
// Bu script vercel-env.txt dosyasından key'leri okuyup .env.local oluşturur
// Vercel'de environment variable'lar otomatik yüklendiği için bu script sadece localhost için çalışır

const fs = require('fs');
const path = require('path');

// Vercel'de çalışıyorsak, environment variable'lar zaten yüklü, script'e gerek yok
if (process.env.VERCEL) {
  console.log('🔐 Vercel ortamı tespit edildi - Environment variable\'lar otomatik yüklenecek');
  console.log('✅ OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Yüklendi' : 'Yüklenmedi');
  process.exit(0);
}

const projectPath = __dirname;
const envSourceFile = path.join(projectPath, 'vercel-env.txt');
const envTargetFile = path.join(projectPath, '.env.local');

console.log('🔐 API Key\'ler otomatik olarak ayarlanıyor...');

// vercel-env.txt dosyasını oku
if (fs.existsSync(envSourceFile)) {
  console.log('✅ vercel-env.txt dosyası bulundu');
  
  const envContent = fs.readFileSync(envSourceFile, 'utf8');
  
  // .env.local dosyasını oluştur
  fs.writeFileSync(envTargetFile, envContent, 'utf8');
  
  console.log('✅ .env.local dosyası oluşturuldu!');
  console.log(`📁 Konum: ${envTargetFile}`);
  
  // Key'lerin varlığını kontrol et
  const requiredKeys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'ADMIN_EMAILS'
  ];
  
  let allKeysPresent = true;
  requiredKeys.forEach(key => {
    if (envContent.includes(`${key}=`) && !envContent.match(new RegExp(`${key}=\\s*$`))) {
      console.log(`  ✓ ${key} ayarlandı`);
    } else {
      console.log(`  ⚠️  ${key} bulunamadı veya boş!`);
      allKeysPresent = false;
    }
  });
  
  if (allKeysPresent) {
    console.log('\n✅ Tüm key\'ler otomatik olarak ayarlandı!');
  } else {
    console.log('\n⚠️  Bazı key\'ler eksik olabilir. Lütfen kontrol edin.');
  }
} else {
  console.log('❌ vercel-env.txt dosyası bulunamadı!');
  console.log('📝 Lütfen önce vercel-env.txt dosyasını oluşturun.');
  console.log('💡 Alternatif: npm run setup-keys komutunu çalıştırın.');
  
  // Eğer .env.local zaten varsa, devam et
  if (fs.existsSync(envTargetFile)) {
    console.log('ℹ️  Mevcut .env.local dosyası kullanılacak.');
  } else {
    process.exit(1);
  }
}

