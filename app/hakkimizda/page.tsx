import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <svg className="h-8 w-8 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hakkımızda</h1>
          </div>
          <p className="text-slate-500">AI Yüz Rekonstrüksiyon Platformu hakkında bilgi</p>
        </div>

        {/* Content Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {/* Section: Platform Purpose */}
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                <h2 className="text-xl font-semibold text-slate-900">Platformun Amacı</h2>
              </div>
              <p className="text-slate-600 leading-relaxed pl-8">
                Bu platform, yüz bölgesi cilt lezyonları eksize edildikten sonra oluşan defektlerin
                lokal fleplerle onarımı için sağlık profesyonellerine AI destekli karar önerisi sunmayı
                amaçlamaktadır. Platform, yapay zeka teknolojilerini kullanarak pre-operatif değerlendirme,
                uygun flep seçimi konusunda destek sağlar ve post-operatif takip süreçlerini kolaylaştırır.
              </p>
            </div>

            {/* Section: Target Audience */}
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <h2 className="text-xl font-semibold text-slate-900">Hedef Kitle</h2>
              </div>
              <p className="text-slate-600 leading-relaxed pl-8">
                Bu platform sadece sağlık profesyonellerine yöneliktir. Kullanım için kayıt sırasında
                sağlık profesyoneli olduğunu beyan etmek ve kurum kimlik kartı yüklemek gerekmektedir.
                Tüm başvurular yönetici onayına tabidir ve yalnızca doğrulanmış sağlık profesyonelleri
                platformu kullanabilir.
              </p>
            </div>

            {/* Section: KVKK & GDPR */}
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <h2 className="text-xl font-semibold text-slate-900">KVKK &amp; GDPR Uyumu</h2>
              </div>
              <p className="text-slate-600 leading-relaxed pl-8">
                Platform, Kişisel Verilerin Korunması Kanunu (KVKK) ve Genel Veri Koruma Yönetmeliği
                (GDPR) kapsamında gerekli tüm güvenlik önlemlerini almaktadır. Kullanıcı verileri ve
                hasta bilgileri şifrelenmiş olarak saklanmakta, erişim kontrolleri ile korunmaktadır.
                Platform, sadece gerekli verileri toplamakta ve veri minimizasyonu prensibine uygun
                hareket etmektedir.
              </p>
            </div>

            {/* Section: Technology */}
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                <h2 className="text-xl font-semibold text-slate-900">Teknoloji</h2>
              </div>
              <p className="text-slate-600 leading-relaxed pl-8">
                Platform, OpenAI ve Anthropic&apos;in gelişmiş AI modellerini kullanarak görüntü analizi ve
                karar destek sistemleri sunmaktadır. Tüm AI analizleri, güvenlik ve tutarlılık kontrollerinden
                geçmektedir. Platform, Supabase altyapısı ile güvenli veri saklama ve işleme imkanı sağlar.
              </p>
            </div>
          </div>

          {/* Medico-Legal Warning */}
          <div className="mx-6 mb-6 sm:mx-8 sm:mb-8 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Mediko-Legal Uyarı</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Bu platform klinik muayene, cerrahi deneyim ve multidisipliner değerlendirmelerin yerine
                  geçmez; yalnızca karar destek amacı taşır. Platform tarafından sunulan öneriler,
                  hastanın nihai tedavisinde kullanılacak kararın tek başına temelini oluşturmaz.
                  Tüm kararlar, hastayı değerlendiren deneyimli klinik ekibin sorumluluğundadır.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    </div>
  );
}
