import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Yüz Rekonstrüksiyon Platformu
            </div>
            <div className="flex gap-4">
              <Link
                href="/auth/login"
                className="px-6 py-2.5 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:scale-105"
              >
                Giriş Yap
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Üye Ol
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">AI Destekli</span>
            <br />
            <span className="text-gray-900">Yüz Rekonstrüksiyon</span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Platformu</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
            Yüz bölgesi cilt defektlerinin lokal fleplerle onarımında sağlık profesyonellerine 
            <span className="font-bold text-gray-800"> klinik karar desteği</span> sunan, AI tabanlı medikal platform.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="group bg-white border-2 border-gray-200 rounded-3xl p-8 hover:shadow-2xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">📸</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Pre-op Fotoğraf Yükle</h3>
            <p className="text-gray-600 leading-relaxed">
              Ameliyat öncesi fotoğrafları yükleyin ve AI ile otomatik analiz edin. Gelişmiş görüntü işleme teknolojisi ile hassas değerlendirme.
            </p>
          </div>

          <div className="group bg-white border-2 border-gray-200 rounded-3xl p-8 hover:shadow-2xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Lokal Flap Seçeneklerini Analiz Et</h3>
            <p className="text-gray-600 leading-relaxed">
              AI destekli karar sistemi ile en uygun lokal flep seçeneklerini değerlendirin. Detaylı cerrahi planlama ve risk analizi.
            </p>
          </div>

          <div className="group bg-white border-2 border-gray-200 rounded-3xl p-8 hover:shadow-2xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">Olgularını Güvende Sakla</h3>
            <p className="text-gray-600 leading-relaxed">
              Tüm olgularınızı güvenli şekilde saklayın ve post-operatif takiplerini yapın. KVKK uyumlu veri yönetimi.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="text-center space-x-4">
          <Link
            href="/auth/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            Üye Ol →
          </Link>
          <Link
            href="/auth/login"
            className="inline-block px-10 py-4 bg-white border-2 border-gray-300 text-gray-800 rounded-2xl hover:bg-gray-50 hover:border-purple-400 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Giriş Yap
          </Link>
        </div>
      </main>
    </div>
  );
}
