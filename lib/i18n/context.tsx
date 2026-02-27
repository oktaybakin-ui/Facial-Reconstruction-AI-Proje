'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'tr' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Complete translations for homepage and navigation
const translations: Record<Language, Record<string, string>> = {
  tr: {
    // App
    'app.name': 'AI Yüz Rekonstrüksiyon',

    // Navigation
    'nav.home': 'Ana Sayfa',
    'nav.login': 'Giriş Yap',
    'nav.register': 'Üye Ol',
    'nav.dashboard': 'Dashboard',
    'nav.getStarted': 'Başlayın',
    'nav.signIn': 'Giriş Yap',
    'nav.knowledgeBase': 'Bilgi Tabanı',
    'nav.newCase': 'Yeni Olgu',
    'nav.adminPanel': 'Yönetici Paneli',
    'nav.signOut': 'Çıkış',

    // Features
    'feature.image.title': 'Pre-op Görüntü Yükleme',
    'feature.image.desc': 'Hasta yüz görüntülerini (frontal, oblik, bazal) yükleyin ve gelişmiş görüntü işleme ile AI destekli görüntü analizi yapın',
    'feature.analysis.title': 'Lokal Flep Analizi',
    'feature.analysis.desc': 'AI destekli karar destek sistemi, detaylı cerrahi planlama ve risk değerlendirmesi ile optimal lokal flep seçeneklerini değerlendirir',
    'feature.storage.title': 'Güvenli Veri Depolama',
    'feature.storage.desc': 'Tüm olguları güvenli şekilde saklayın ve KVKK uyumlu veri yönetimi ile post-operatif takipleri yönetin',

    // Stats
    'stats.total': 'Toplam Olgu',
    'stats.planned': 'Planlı',
    'stats.operated': 'Opere',
    'stats.followup': 'Takip',
    'stats.access': '24/7',
    'stats.accessDesc': 'Erişim',
    'stats.ai': 'AI',
    'stats.aiDesc': 'AI destekli tasarım mimarisi',
    'stats.secure': 'Güvenli',
    'stats.secureDesc': 'Etik & kullanıcı odaklı tasarım',
    'stats.accessible': 'Erişilebilir',
    'stats.accessibleDesc': 'Basit klinik akış',
    'stats.kvkk': 'KVKK',
    'stats.kvkkDesc': 'KVKK & GDPR uyumlu tasarım prensipleri',

    // Notice
    'notice.title': 'Klinik Karar Destek',
    'notice.text': 'Bu platform <strong>AI destekli karar destek</strong> sistemidir. Nihai kararlar hastayı değerlendiren klinik ekibe aittir. AI önerileri profesyonel tıbbi görüşe ek bir referans kaynağı olarak kullanılmalıdır.',
    'notice.learnMore': 'Daha Fazla Bilgi',

    // Footer
    'footer.copyright': '© 2024 AI Yüz Rekonstrüksiyon Platformu. Tüm hakları saklıdır.',
    'footer.copyright2': '© 2025 – FaceTech Fusion · The Head & Neck Engineers',
    'footer.disclaimer': 'Sağlık profesyonelleri için AI destekli klinik karar destek platformu.',

    // Hero
    'hero.badge': 'Klinik AI Karar Destek Platformu',
    'hero.title': 'AI Destekli',
    'hero.titleHighlight': 'Yüz Rekonstrüksiyon Platformu',
    'hero.description': 'Pre-op yüz görüntülerini analiz ederek lokal flep seçeneklerini değerlendiren, klinik karar sürecini standardize eden yapay zeka destekli cerrahi planlama platformu.',
    'hero.bullet1': 'AI destekli cerrahi karar destek',
    'hero.bullet2': 'Pre-op görüntü analizi & lokal flep planlama',
    'hero.bullet3': 'KVKK uyumlu güvenli veri yönetimi',

    // Concept
    'concept.title': 'Analiz Paneli',
    'concept.subtitle': 'Pre-op Yüz Analizi',
    'concept.badge': 'AI',
    'concept.region': 'Anatomik bölge',
    'concept.regionValue': 'Nazolabial üçgen',
    'concept.size': 'Defekt boyutu',
    'concept.sizeValue': '2.4 × 3.1 cm',
    'concept.zone': 'Estetik zon',
    'concept.zoneValue': 'Yüksek görünürlük',
    'concept.note': 'AI modeli defekt konumu ve çevre dokularla ilişkisini değerlendirerek optimal flep seçeneklerini sunar.',

    // --- Auth pages ---
    'auth.login.subtitle': 'AI destekli cerrahi planlama platformuna erişin',
    'auth.register.subtitle': 'Sağlık profesyonelleri için AI platformuna katılın',
    'auth.register.personalInfo': 'Kişisel Bilgiler',
    'auth.register.tcKimlik': 'TC Kimlik No',
    'auth.register.tcPlaceholder': '11 haneli TC kimlik numarası',
    'auth.register.fullName': 'Ad Soyad',
    'auth.register.fullNamePlaceholder': 'Adınız ve soyadınız',
    'auth.register.email': 'E-posta',
    'auth.register.password': 'Parola',
    'auth.register.passwordPlaceholder': 'Parolanızı belirleyin',
    'auth.register.phone': 'Telefon',
    'auth.register.specialty': 'Uzmanlık Alanı',
    'auth.register.selectSpecialty': 'Seçin',
    'auth.register.institutionInfo': 'Kurum Bilgileri',
    'auth.register.institutionName': 'Kurum Adı',
    'auth.register.institutionPlaceholder': 'Çalıştığınız kurum',
    'auth.register.institutionEmail': 'Kurum E-postası',
    'auth.register.optional': 'Opsiyonel',
    'auth.register.kvkkConsent': 'KVKK ve Gizlilik Politikasını okudum ve kabul ediyorum.',
    'auth.register.healthProfessional': 'Sağlık profesyoneli olduğumu beyan ederim.',
    'auth.register.alreadyHaveAccount': 'Zaten hesabınız var mı?',
    'auth.register.success': 'Kayıt başarılı! Hesabınız onay bekliyor. Giriş sayfasına yönlendiriliyorsunuz...',
    'auth.login.noAccount': 'Hesabınız yok mu?',
    'auth.login.email': 'E-posta',
    'auth.login.password': 'Parola',
    'auth.login.passwordPlaceholder': 'Parolanızı girin',

    // --- Dashboard ---
    'dashboard.welcome': 'Hoşgeldiniz',
    'dashboard.manageCase': 'Olgularınızı yönetin ve takip edin',
    'dashboard.newCase': 'Yeni Olgu',
    'dashboard.totalCases': 'Toplam Olgu',
    'dashboard.planned': 'Planlı',
    'dashboard.operated': 'Opere',
    'dashboard.followup': 'Takip',
    'dashboard.completed': 'Tamamlandı',
    'dashboard.cases': 'Olgular',
    'dashboard.records': 'kayıt',
    'dashboard.loading': 'Olgular yükleniyor...',
    'dashboard.noCases': 'Henüz olgu yok',
    'dashboard.addFirstCase': 'İlk olgunuzu ekleyerek AI destekli yüz rekonstrüksiyon analizine başlayın.',
    'dashboard.addFirstCaseBtn': 'İlk Olgunuzu Ekleyin',
    'dashboard.admin': 'Yönetici',
    'dashboard.knowledgeBase': 'Bilgi Tabanı',
    'dashboard.signOut': 'Çıkış',
    'dashboard.view': 'Görüntüle',
    'dashboard.edit': 'Düzenle',
    'dashboard.delete': 'Sil',
    'dashboard.deleteConfirm': 'Bu olguyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
    'dashboard.deleteConfirmTitle': 'Olguyu Sil',
    'dashboard.table.caseCode': 'Olgu Kodu',
    'dashboard.table.region': 'Bölge',
    'dashboard.table.status': 'Durum',
    'dashboard.table.date': 'Tarih',
    'dashboard.table.analysis': 'Analiz',
    'dashboard.table.actions': 'İşlemler',
    'dashboard.table.noAnalysis': 'Analiz yapılmamış',
    'dashboard.table.analyzed': 'Analiz edildi',
    'dashboard.deleteCase': 'Olguyu Sil',
    'dashboard.deleteCaseConfirm': 'Bu olguyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
    'dashboard.cancel': 'İptal',
    'dashboard.sessionRequired': 'Oturum açmanız gerekiyor',
    'dashboard.deleteFailed': 'Olgu silinemedi',
    'dashboard.deleteSuccess': 'Olgu başarıyla silindi',
    'dashboard.deleteError': 'Olgu silinirken bir hata oluştu',

    // --- New Case page ---
    'case.new.title': 'Yeni Olgu Ekle',
    'case.new.subtitle': 'Hasta bilgilerini ve defekt detaylarını girin',
    'case.new.step1': 'Hasta Bilgileri',
    'case.new.step1Desc': 'Temel hasta ve vaka bilgileri',
    'case.new.step2': 'Defekt Bilgileri',
    'case.new.step2Desc': 'Lezyon bölgesi, boyut ve özellikler',
    'case.new.step3': 'Fotoğraf & Kaydet',
    'case.new.step3Desc': 'Fotoğraf yükle ve kaydet',
    'case.new.caseCode': 'Olgu Kodu / Protokol No',
    'case.new.caseCodePlaceholder': 'Örneğin: CASE-2024-001',
    'case.new.age': 'Yaş',
    'case.new.sex': 'Cinsiyet',
    'case.new.male': 'Erkek',
    'case.new.female': 'Kadın',
    'case.new.other': 'Diğer',
    'case.new.select': 'Seçiniz',
    'case.new.caseDate': 'Vaka Tarihi',
    'case.new.caseTime': 'Vaka Saati',
    'case.new.caseDuration': 'Vaka Süresi (dakika)',
    'case.new.operationDate': 'Operasyon Tarihi',
    'case.new.followupDays': 'Kontrol Süresi (gün)',
    'case.new.followupHint': 'Kontrol tarihi otomatik hesaplanacak',
    'case.new.region': 'Lezyon Bölgesi',
    'case.new.width': 'Defekt Boyutu (mm) – En',
    'case.new.height': 'Defekt Boyutu (mm) – Boy',
    'case.new.depth': 'Derinlik',
    'case.new.depthSkin': 'Cilt',
    'case.new.depthSkinSubcutis': 'Cilt+Subkutan',
    'case.new.depthMuscle': 'Kas',
    'case.new.depthMucosa': 'Mukozaya Uzanan',
    'case.new.pathology': 'Tahmini Patoloji',
    'case.new.pathologyPlaceholder': 'Örn: BCC, SCC, vb.',
    'case.new.previousSurgery': 'Önceki Cerrahi Var mı?',
    'case.new.previousRadiotherapy': 'Önceki Radyoterapi Var mı?',
    'case.new.criticalStructures': 'Kritik Yapılar',
    'case.new.highAestheticZone': 'Yüksek Estetik Zon',
    'case.new.preopPhoto': 'Pre-op Fotoğraf',
    'case.new.dragDrop': 'Dosya Seç veya Sürükle Bırak',
    'case.new.fileTypes': 'PNG, JPG, WEBP - Maks. 10MB',
    'case.new.preview': 'Pre-op önizleme',
    'case.new.remove': 'Kaldır',
    'case.new.patientCondition': 'Hastanın Özel Durumu / Özelliği',
    'case.new.patientConditionPlaceholder': 'Örn: Diyabet, hipertansiyon, alerji, önceki cerrahi, vb.',
    'case.new.patientConditionHint': 'Operasyon öncesi önemli notlar ve hasta özellikleri',
    'case.new.back': 'Geri',
    'case.new.cancel': 'İptal',
    'case.new.next': 'Sonraki',
    'case.new.save': 'Kaydet',
    'case.new.uploadPhoto': 'Fotoğraf yükleyin',
    'case.new.photoRequired': 'Pre-op fotoğraf zorunludur. Lütfen bir fotoğraf yükleyin.',
    'case.new.caseCodeRequired': 'Olgu Kodu / Protokol No alanı zorunludur.',
    'case.new.regionRequired': 'Lezyon Bölgesi seçimi zorunludur.',

    // --- HeroApple animated features (homepage) ---
    'hero.feature.preopTitle': 'Pre-op Analiz',
    'hero.feature.preopDesc': 'Yüz görüntülerini yükleyin, AI destekli detaylı analiz alın',
    'hero.feature.flapTitle': 'Flep Planlama',
    'hero.feature.flapDesc': 'Optimal lokal flep seçeneklerini AI ile değerlendirin',
    'hero.feature.riskTitle': 'Risk Analizi',
    'hero.feature.riskDesc': 'Komplikasyon tahminleri ve detaylı risk skorlaması',
    'hero.feature.kvkkTitle': 'KVKK Uyumlu',
    'hero.feature.kvkkDesc': 'Tüm veriler AES-256 ile şifrelenir, KVKK & GDPR uyumlu',
    'hero.stat.flaps': 'Desteklenen Flep',
    'hero.stat.analysisTime': 'Analiz Süresi',
    'hero.stat.accuracy': 'Doğruluk Oranı',

    // --- Common ---
    'common.loading': 'Yükleniyor...',
    'common.error': 'Bir hata oluştu',
    'common.confirm': 'Onayla',
    'common.cancel': 'İptal',
    'common.yes': 'Evet',
    'common.no': 'Hayır',
    'common.save': 'Kaydet',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.view': 'Görüntüle',
    'common.back': 'Geri',
    'common.next': 'Sonraki',
    'common.sessionExpired': 'Oturum açmanız gerekli',
    'common.platformName': 'AI Yüz Rekonstrüksiyon Platformu',

    // --- About page (hakkimizda) ---
    'about.title': 'Hakkımızda',
    'about.subtitle': 'AI Yüz Rekonstrüksiyon Platformu hakkında bilgi',
    'about.purposeTitle': 'Platformun Amacı',
    'about.purposeText1': 'FaceTech Fusion, yüz bölgesindeki deri defektlerinin rekonstrüksiyonunda cerrahlara AI destekli karar destek sağlayan bir platformdur.',
    'about.purposeText2': 'Platform, pre-operatif yüz görüntülerini analiz ederek, defektin lokalizasyonu, boyutu ve çevre doku ilişkilerine göre uygun lokal flep seçeneklerini değerlendirir.',
    'about.audienceTitle': 'Hedef Kitle',
    'about.audienceText': 'Platform, plastik cerrahlar, KBB uzmanları, dermatologlar ve çene-yüz cerrahları gibi yüz rekonstrüksiyonu ile ilgilenen sağlık profesyonellerine yöneliktir.',
    'about.kvkkTitle': 'KVKK & GDPR Uyumu',
    'about.kvkkText': 'Tüm kişisel veriler KVKK ve GDPR gerekliliklerine uygun olarak işlenir. Veriler AES-256 şifreleme ile korunur ve Türkiye merkezli sunucularda saklanır.',
    'about.techTitle': 'Teknoloji',
    'about.techText': 'Platform Next.js, Supabase ve Claude AI altyapısı üzerine inşa edilmiştir. Görüntü analizi için gelişmiş bilgisayar görmesi algoritmaları kullanılmaktadır.',
    'about.legalTitle': 'Mediko-Legal Uyarı',
    'about.legalText': 'Bu platform yalnızca karar destek amaçlıdır ve nihai cerrahi kararların yerine geçmez. Tüm klinik kararlar hastayı değerlendiren cerrah tarafından verilmelidir.',
    'about.backHome': 'Ana Sayfaya Dön',
  },
  en: {
    // App
    'app.name': 'AI Facial Reconstruction',

    // Navigation
    'nav.home': 'Home',
    'nav.login': 'Sign In',
    'nav.register': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.getStarted': 'Get Started',
    'nav.signIn': 'Sign In',
    'nav.knowledgeBase': 'Knowledge Base',
    'nav.newCase': 'New Case',
    'nav.adminPanel': 'Admin Panel',
    'nav.signOut': 'Sign Out',

    // Features
    'feature.image.title': 'Pre-op Image Upload',
    'feature.image.desc': 'Upload patient facial images (frontal, oblique, basal) for AI-powered vision analysis with advanced image processing',
    'feature.analysis.title': 'Local Flap Analysis',
    'feature.analysis.desc': 'AI-driven decision support system evaluates optimal local flap options with detailed surgical planning and risk assessment',
    'feature.storage.title': 'Secure Data Storage',
    'feature.storage.desc': 'Store all cases securely and manage post-operative follow-ups with KVKK-compliant data management',

    // Stats
    'stats.total': 'Total Cases',
    'stats.planned': 'Planned',
    'stats.operated': 'Operated',
    'stats.followup': 'Follow-up',
    'stats.access': '24/7',
    'stats.accessDesc': 'Access',
    'stats.ai': 'AI',
    'stats.aiDesc': 'AI-powered design architecture',
    'stats.secure': 'Secure',
    'stats.secureDesc': 'Ethical & user-centered design',
    'stats.accessible': 'Accessible',
    'stats.accessibleDesc': 'Simple clinical workflow',
    'stats.kvkk': 'KVKK',
    'stats.kvkkDesc': 'KVKK & GDPR compliant design principles',

    // Notice
    'notice.title': 'Clinical Decision Support',
    'notice.text': 'This platform is an <strong>AI-powered decision support</strong> system. Final decisions rest with the clinical team evaluating the patient. AI recommendations serve as an additional reference to professional medical judgment.',
    'notice.learnMore': 'Learn More',

    // Footer
    'footer.copyright': '© 2024 AI Facial Reconstruction Platform. All rights reserved.',
    'footer.copyright2': '© 2025 – FaceTech Fusion · The Head & Neck Engineers',
    'footer.disclaimer': 'AI-powered clinical decision support platform for healthcare professionals.',

    // Hero
    'hero.badge': 'Clinical AI Decision Support Platform',
    'hero.title': 'AI-Powered',
    'hero.titleHighlight': 'Facial Reconstruction Platform',
    'hero.description': 'An AI-powered surgical planning platform that analyzes pre-op facial images to evaluate local flap options and standardize the clinical decision-making process.',
    'hero.bullet1': 'AI-powered surgical decision support',
    'hero.bullet2': 'Pre-op image analysis & local flap planning',
    'hero.bullet3': 'KVKK-compliant secure data management',

    // Concept
    'concept.title': 'Analysis Panel',
    'concept.subtitle': 'Pre-op Facial Analysis',
    'concept.badge': 'AI',
    'concept.region': 'Anatomical region',
    'concept.regionValue': 'Nasolabial triangle',
    'concept.size': 'Defect size',
    'concept.sizeValue': '2.4 × 3.1 cm',
    'concept.zone': 'Aesthetic zone',
    'concept.zoneValue': 'High visibility',
    'concept.note': 'The AI model evaluates the relationship between defect location and surrounding tissues to present optimal flap options.',

    // --- Auth pages ---
    'auth.login.subtitle': 'Access the AI-powered surgical planning platform',
    'auth.register.subtitle': 'Join the AI platform for healthcare professionals',
    'auth.register.personalInfo': 'Personal Information',
    'auth.register.tcKimlik': 'National ID Number',
    'auth.register.tcPlaceholder': '11-digit national ID number',
    'auth.register.fullName': 'Full Name',
    'auth.register.fullNamePlaceholder': 'Your full name',
    'auth.register.email': 'Email',
    'auth.register.password': 'Password',
    'auth.register.passwordPlaceholder': 'Set your password',
    'auth.register.phone': 'Phone',
    'auth.register.specialty': 'Specialty',
    'auth.register.selectSpecialty': 'Select',
    'auth.register.institutionInfo': 'Institution Information',
    'auth.register.institutionName': 'Institution Name',
    'auth.register.institutionPlaceholder': 'Your workplace',
    'auth.register.institutionEmail': 'Institution Email',
    'auth.register.optional': 'Optional',
    'auth.register.kvkkConsent': 'I have read and accept the KVKK and Privacy Policy.',
    'auth.register.healthProfessional': 'I declare that I am a healthcare professional.',
    'auth.register.alreadyHaveAccount': 'Already have an account?',
    'auth.register.success': 'Registration successful! Your account is pending verification. Redirecting to login...',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.email': 'Email',
    'auth.login.password': 'Password',
    'auth.login.passwordPlaceholder': 'Enter your password',

    // --- Dashboard ---
    'dashboard.welcome': 'Welcome',
    'dashboard.manageCase': 'Manage and track your cases',
    'dashboard.newCase': 'New Case',
    'dashboard.totalCases': 'Total Cases',
    'dashboard.planned': 'Planned',
    'dashboard.operated': 'Operated',
    'dashboard.followup': 'Follow-up',
    'dashboard.completed': 'Completed',
    'dashboard.cases': 'Cases',
    'dashboard.records': 'records',
    'dashboard.loading': 'Loading cases...',
    'dashboard.noCases': 'No cases yet',
    'dashboard.addFirstCase': 'Start AI-powered facial reconstruction analysis by adding your first case.',
    'dashboard.addFirstCaseBtn': 'Add Your First Case',
    'dashboard.admin': 'Admin',
    'dashboard.knowledgeBase': 'Knowledge Base',
    'dashboard.signOut': 'Sign Out',
    'dashboard.view': 'View',
    'dashboard.edit': 'Edit',
    'dashboard.delete': 'Delete',
    'dashboard.deleteConfirm': 'Are you sure you want to delete this case? This action cannot be undone.',
    'dashboard.deleteConfirmTitle': 'Delete Case',
    'dashboard.table.caseCode': 'Case Code',
    'dashboard.table.region': 'Region',
    'dashboard.table.status': 'Status',
    'dashboard.table.date': 'Date',
    'dashboard.table.analysis': 'Analysis',
    'dashboard.table.actions': 'Actions',
    'dashboard.table.noAnalysis': 'No analysis',
    'dashboard.table.analyzed': 'Analyzed',
    'dashboard.deleteCase': 'Delete Case',
    'dashboard.deleteCaseConfirm': 'Are you sure you want to delete this case? This action cannot be undone.',
    'dashboard.cancel': 'Cancel',
    'dashboard.sessionRequired': 'You need to sign in',
    'dashboard.deleteFailed': 'Failed to delete case',
    'dashboard.deleteSuccess': 'Case deleted successfully',
    'dashboard.deleteError': 'An error occurred while deleting the case',

    // --- New Case page ---
    'case.new.title': 'Add New Case',
    'case.new.subtitle': 'Enter patient information and defect details',
    'case.new.step1': 'Patient Information',
    'case.new.step1Desc': 'Basic patient and case information',
    'case.new.step2': 'Defect Information',
    'case.new.step2Desc': 'Lesion area, size and characteristics',
    'case.new.step3': 'Photo & Save',
    'case.new.step3Desc': 'Upload photo and save',
    'case.new.caseCode': 'Case Code / Protocol No',
    'case.new.caseCodePlaceholder': 'e.g.: CASE-2024-001',
    'case.new.age': 'Age',
    'case.new.sex': 'Sex',
    'case.new.male': 'Male',
    'case.new.female': 'Female',
    'case.new.other': 'Other',
    'case.new.select': 'Select',
    'case.new.caseDate': 'Case Date',
    'case.new.caseTime': 'Case Time',
    'case.new.caseDuration': 'Case Duration (min)',
    'case.new.operationDate': 'Operation Date',
    'case.new.followupDays': 'Follow-up Period (days)',
    'case.new.followupHint': 'Follow-up date will be calculated automatically',
    'case.new.region': 'Lesion Region',
    'case.new.width': 'Defect Size (mm) – Width',
    'case.new.height': 'Defect Size (mm) – Height',
    'case.new.depth': 'Depth',
    'case.new.depthSkin': 'Skin',
    'case.new.depthSkinSubcutis': 'Skin+Subcutis',
    'case.new.depthMuscle': 'Muscle',
    'case.new.depthMucosa': 'Extending to Mucosa',
    'case.new.pathology': 'Suspected Pathology',
    'case.new.pathologyPlaceholder': 'e.g.: BCC, SCC, etc.',
    'case.new.previousSurgery': 'Previous Surgery?',
    'case.new.previousRadiotherapy': 'Previous Radiotherapy?',
    'case.new.criticalStructures': 'Critical Structures',
    'case.new.highAestheticZone': 'High Aesthetic Zone',
    'case.new.preopPhoto': 'Pre-op Photo',
    'case.new.dragDrop': 'Select File or Drag & Drop',
    'case.new.fileTypes': 'PNG, JPG, WEBP - Max 10MB',
    'case.new.preview': 'Pre-op preview',
    'case.new.remove': 'Remove',
    'case.new.patientCondition': 'Patient Special Condition',
    'case.new.patientConditionPlaceholder': 'e.g.: Diabetes, hypertension, allergy, previous surgery, etc.',
    'case.new.patientConditionHint': 'Important pre-operative notes and patient characteristics',
    'case.new.back': 'Back',
    'case.new.cancel': 'Cancel',
    'case.new.next': 'Next',
    'case.new.save': 'Save',
    'case.new.uploadPhoto': 'Upload photo',
    'case.new.photoRequired': 'Pre-op photo is required. Please upload a photo.',
    'case.new.caseCodeRequired': 'Case Code / Protocol No is required.',
    'case.new.regionRequired': 'Lesion Region selection is required.',

    // --- HeroApple animated features (homepage) ---
    'hero.feature.preopTitle': 'Pre-op Analysis',
    'hero.feature.preopDesc': 'Upload facial images, get detailed AI-powered analysis',
    'hero.feature.flapTitle': 'Flap Planning',
    'hero.feature.flapDesc': 'Evaluate optimal local flap options with AI',
    'hero.feature.riskTitle': 'Risk Analysis',
    'hero.feature.riskDesc': 'Complication predictions and detailed risk scoring',
    'hero.feature.kvkkTitle': 'KVKK Compliant',
    'hero.feature.kvkkDesc': 'All data encrypted with AES-256, KVKK & GDPR compliant',
    'hero.stat.flaps': 'Supported Flaps',
    'hero.stat.analysisTime': 'Analysis Time',
    'hero.stat.accuracy': 'Accuracy Rate',

    // --- Common ---
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.sessionExpired': 'You need to sign in',
    'common.platformName': 'AI Facial Reconstruction Platform',

    // --- About page (hakkimizda) ---
    'about.title': 'About Us',
    'about.subtitle': 'About the AI Facial Reconstruction Platform',
    'about.purposeTitle': 'Platform Purpose',
    'about.purposeText1': 'FaceTech Fusion is a platform that provides AI-powered decision support to surgeons in the reconstruction of facial skin defects.',
    'about.purposeText2': 'The platform analyzes pre-operative facial images and evaluates appropriate local flap options based on defect localization, size, and surrounding tissue relationships.',
    'about.audienceTitle': 'Target Audience',
    'about.audienceText': 'The platform is aimed at healthcare professionals involved in facial reconstruction, such as plastic surgeons, ENT specialists, dermatologists, and maxillofacial surgeons.',
    'about.kvkkTitle': 'KVKK & GDPR Compliance',
    'about.kvkkText': 'All personal data is processed in accordance with KVKK and GDPR requirements. Data is protected with AES-256 encryption and stored on Turkey-based servers.',
    'about.techTitle': 'Technology',
    'about.techText': 'The platform is built on Next.js, Supabase and Claude AI infrastructure. Advanced computer vision algorithms are used for image analysis.',
    'about.legalTitle': 'Medico-Legal Notice',
    'about.legalText': 'This platform is for decision support purposes only and does not replace final surgical decisions. All clinical decisions must be made by the surgeon evaluating the patient.',
    'about.backHome': 'Back to Homepage',
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'tr' || saved === 'en')) {
          return saved;
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    return 'tr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('language', lang);
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
