import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative glass shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="text-2xl font-bold gradient-text">
              AI Yüz Rekonstrüksiyon Platformu
            </div>
            <div className="flex gap-3">
              <Link
                href="/auth/login"
                className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-white/50 transition-all duration-300 hover:scale-105"
              >
                Giriş Yap
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Üye Ol
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <div className="inline-block mb-6 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🚀 Yapay Zeka Destekli Tıbbi Karar Desteği
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="gradient-text">AI Destekli</span>
            <br />
            <span className="text-gray-900">Yüz Rekonstrüksiyon Platformu</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Yüz bölgesi cilt defektlerinin lokal fleplerle onarımında sağlık profesyonellerine 
            <span className="font-semibold text-gray-800"> klinik karar desteği</span> sunan, AI tabanlı medikal platform.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="group relative glass rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">📸</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pre-op Fotoğraf Yükle</h3>
              <p className="text-gray-600 leading-relaxed">
                Ameliyat öncesi fotoğrafları yükleyin ve AI ile otomatik analiz edin.
              </p>
            </div>
          </div>

          <div className="group relative glass rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lokal Flep Seçeneklerini Analiz Et</h3>
              <p className="text-gray-600 leading-relaxed">
                AI destekli karar sistemi ile en uygun lokal flep seçeneklerini değerlendirin.
              </p>
            </div>
          </div>

          <div className="group relative glass rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Olgularını Güvenle Sakla</h3>
              <p className="text-gray-600 leading-relaxed">
                Tüm olgularınızı güvenli şekilde saklayın ve post-operatif takiplerini yapın.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="text-center space-x-4 mb-16">
          <Link
            href="/auth/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Üye Ol →
          </Link>
          <Link
            href="/auth/login"
            className="inline-block px-10 py-4 glass border-2 border-gray-300 text-gray-800 rounded-xl hover:bg-white/90 transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105"
          >
            Giriş Yap
          </Link>
        </div>

        {/* Legal Notice */}
        <div className="glass rounded-2xl p-6 max-w-2xl mx-auto text-center border border-white/20">
          <p className="text-sm text-gray-600 mb-2">
            ⚠️ Bu platform yalnızca <span className="font-semibold">karar destek</span> amaçlıdır; nihai karar, hastayı değerlendiren 
            klinik ekibe aittir.
          </p>
          <Link href="/hakkimizda" className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:underline">
            Daha fazla bilgi →
          </Link>
        </div>
      </main>

    </div>
  );
}
