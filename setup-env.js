// Otomatik .env.local dosyası oluşturma scripti
// Bu script vercel-env.txt dosyasından key'leri okuyup .env.local oluşturur
// Vercel'de environment variable'lar otomatik yüklendiği için bu script sadece localhost için çalışır

const fs = require('fs');
const path = require('path');

// Vercel'de çalışıyorsak veya environment variable'lar zaten yüklüyse, script'e gerek yok
// Vercel'de OPENAI_API_KEY zaten process.env'de olmalı
if (process.env.VERCEL || process.env.VERCEL_ENV || (process.env.OPENAI_API_KEY && !fs.existsSync(path.join(__dirname, 'vercel-env.txt')))) {
  console.log('🔐 Vercel ortamı tespit edildi - Environment variable\'lar otomatik yüklenecek');
  console.log('✅ OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `Yüklendi (${process.env.OPENAI_API_KEY.substring(0, 20)}...)` : 'Yüklenmedi');
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  UYARI: OPENAI_API_KEY Vercel environment variable\'larında bulunamadı!');
    console.log('💡 Lütfen Vercel Dashboard\'da Settings → Environment Variables\'dan kontrol edin.');
  }
  // Vercel'de .env.local oluşturmaya gerek yok, environment variable'lar zaten yüklü
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
  console.log('⚠️  vercel-env.txt dosyası bulunamadı!');
  console.log('📝 Lütfen önce vercel-env.txt dosyasını oluşturun.');
  console.log('💡 Alternatif: npm run setup-keys komutunu çalıştırın.');
  
  // Eğer .env.local zaten varsa, devam et
  if (fs.existsSync(envTargetFile)) {
    console.log('ℹ️  Mevcut .env.local dosyası kullanılacak.');
  } else {
    console.log('⚠️  .env.local dosyası bulunamadı. Sunucu başlatılıyor ancak environment variable\'lar eksik olabilir.');
    console.log('💡 Environment variable\'lar sistem ortam değişkenlerinden yüklenecek veya manuel olarak .env.local oluşturulmalı.');
    // Hata vermeden devam et, environment variable'lar sistemden yüklenecek
    process.exit(0);
  }
}

