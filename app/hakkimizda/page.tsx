import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="glass shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="text-2xl font-bold gradient-text">
              AI Yüz Rekonstrüksiyon Platformu
            </Link>
            <div className="flex gap-3">
              <Link
                href="/auth/login"
                className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-white/50 transition-all duration-300"
              >
                Giriş Yap
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Üye Ol
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass rounded-2xl shadow-2xl p-8 md:p-12 space-y-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full">
              <span className="text-2xl">📖</span>
            </div>
            <h1 className="text-5xl font-extrabold gradient-text">Hakkımızda</h1>
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Platformun Amacı</h2>
            <p className="text-gray-700 leading-relaxed">
              Bu platform, yüz bölgesi cilt lezyonları eksize edildikten sonra oluşan defektlerin 
              lokal fleplerle onarımı için sağlık profesyonellerine AI destekli karar önerisi sunmayı 
              amaçlamaktadır. Platform, yapay zeka teknolojilerini kullanarak pre-operatif değerlendirme, 
              uygun flep seçimi konusunda destek sağlar ve post-operatif takip süreçlerini kolaylaştırır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Hedef Kitle</h2>
            <p className="text-gray-700 leading-relaxed">
              Bu platform sadece sağlık profesyonellerine yöneliktir. Kullanım için kayıt sırasında 
              sağlık profesyoneli olduğunu beyan etmek ve kurum kimlik kartı yüklemek gerekmektedir. 
              Tüm başvurular yönetici onayına tabidir ve yalnızca doğrulanmış sağlık profesyonelleri 
              platformu kullanabilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">KVKK & GDPR Uyumu</h2>
            <p className="text-gray-700 leading-relaxed">
              Platform, Kişisel Verilerin Korunması Kanunu (KVKK) ve Genel Veri Koruma Yönetmeliği 
              (GDPR) kapsamında gerekli tüm güvenlik önlemlerini almaktadır. Kullanıcı verileri ve 
              hasta bilgileri şifrelenmiş olarak saklanmakta, erişim kontrolleri ile korunmaktadır. 
              Platform, sadece gerekli verileri toplamakta ve veri minimizasyonu prensibine uygun 
              hareket etmektedir.
            </p>
          </section>

          <section className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-3">⚠️ Mediko-Legal Uyarı</h2>
            <p className="text-gray-700 leading-relaxed font-medium">
              Bu platform klinik muayene, cerrahi deneyim ve multidisipliner değerlendirmelerin yerine 
              geçmez; yalnızca karar destek amacı taşır. Platform tarafından sunulan öneriler, 
              hastanın nihai tedavisinde kullanılacak kararın tek başına temelini oluşturmaz. 
              Tüm kararlar, hastayı değerlendiren deneyimli klinik ekibin sorumluluğundadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Teknoloji</h2>
            <p className="text-gray-700 leading-relaxed">
              Platform, OpenAI ve Anthropic'in gelişmiş AI modellerini kullanarak görüntü analizi ve 
              karar destek sistemleri sunmaktadır. Tüm AI analizleri, güvenlik ve tutarlılık kontrollerinden 
              geçmektedir. Platform, Supabase altyapısı ile güvenli veri saklama ve işleme imkanı sağlar.
            </p>
          </section>

          <div className="pt-8 border-t border-white/20">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

