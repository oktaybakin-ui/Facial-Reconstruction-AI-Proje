-- Toplu Tıbbi Kaynak Yükleme Script'i
-- Bu script'i Supabase SQL Editor'de çalıştırarak kaynakları doğrudan veritabanına ekleyebilirsiniz

-- ÖNEMLİ: user_id'yi kendi user ID'niz ile değiştirin!
-- Supabase Dashboard > Authentication > Users bölümünden kendi user_id'nizi bulabilirsiniz

-- Örnek: user_id'nizi buraya yazın (UUID formatında)
-- Örn: '7d1a18c0-e2ee-4a2f-9d82-2ed249e2af12'

-- ÖRNEK 1: Transpozisyon Flebi Teknikleri
INSERT INTO medical_sources (
  user_id,
  title,
  content,
  source_type,
  keywords,
  region_focus,
  flap_types,
  is_active
) VALUES (
  'BURAYA_KENDI_USER_ID_NIZI_YAZIN', -- USER_ID'Yİ DEĞİŞTİRİN!
  'Transpozisyon Flebi Teknikleri ve Uygulama Prensipleri',
  'Transpozisyon flebi, defektin hemen yanındaki sağlam dokudan alınan flebin defekt alanına aktarılması prensibine dayanır. Flep, defekt boyutunun 1.5-2 katı genişliğinde planlanmalıdır. Natural skin tension lines (RSTL) boyunca insizyon yapılmalıdır. Disseksiyon subkutanöz doku tabakası altında, fasya seviyesinde yapılır. Flep yeterli mobilite kazanana kadar mobilize edilir ve defekt alanına transpoze edilir. Donor alan direkt kapatma veya graft ile kapatılabilir. Bu teknik özellikle yüzün üst ve orta kısımlarındaki defektler için idealdir.',
  'guideline',
  ARRAY['transpozisyon', 'flep', 'yüz rekonstrüksiyonu', 'RSTL', 'natural skin tension lines'],
  ARRAY['Alın', 'Yanak', 'Burun'],
  ARRAY['Transpozisyon'],
  true
);

-- ÖRNEK 2: Rotasyon Flebi Prensipleri
INSERT INTO medical_sources (
  user_id,
  title,
  content,
  source_type,
  keywords,
  region_focus,
  flap_types,
  is_active
) VALUES (
  'BURAYA_KENDI_USER_ID_NIZI_YAZIN', -- USER_ID'Yİ DEĞİŞTİRİN!
  'Rotasyon Flebi Teknikleri ve Endikasyonları',
  'Rotasyon flebi, donor alanın defekt alanı etrafında döndürülmesi prensibine dayanır. Bu teknik özellikle üçgen defektler için idealdir. Flep tasarımında donor alanın kapatılabilirliği değerlendirilmelidir. Rotasyon flebi, defekt alanına en yakın sağlam dokudan oluşturulur ve döndürülerek defekt kapatılır. Bu teknik alın, şakak ve çene bölgelerindeki defektler için uygundur. Flep tasarımında geometrik hesaplamalar önemlidir.',
  'article',
  ARRAY['rotasyon', 'flep', 'yüz rekonstrüksiyonu', 'üçgen defekt'],
  ARRAY['Alın', 'Şakak', 'Çene'],
  ARRAY['Rotasyon'],
  true
);

-- ÖRNEK 3: Bilobed Flep Teknikleri
INSERT INTO medical_sources (
  user_id,
  title,
  content,
  source_type,
  keywords,
  region_focus,
  flap_types,
  is_active
) VALUES (
  'BURAYA_KENDI_USER_ID_NIZI_YAZIN', -- USER_ID'Yİ DEĞİŞTİRİN!
  'Bilobed Flep: Teknik, Endikasyonlar ve Komplikasyonlar',
  'Bilobed flep, burun bölgesindeki defektler için özellikle uygun bir tekniktir. İki loblu flep tasarımı ile defekt alanı ve donor alan aynı anda kapatılır. İlk lob defekt alanını kapatırken, ikinci lob birinci lobun donor alanını kapatır. Bu teknik burun kanadı ve burun sırtı bölgelerindeki küçük ve orta boy defektler için idealdir. Flep tasarımında 90-110 derece açı ile planlama yapılmalıdır.',
  'research',
  ARRAY['bilobed', 'flep', 'burun rekonstrüksiyonu', 'burun kanadı'],
  ARRAY['Burun', 'Burun kanadı'],
  ARRAY['Bilobed'],
  true
);

-- ÖRNEK 4: Advancement Flep Prensipleri
INSERT INTO medical_sources (
  user_id,
  title,
  content,
  source_type,
  keywords,
  region_focus,
  flap_types,
  is_active
) VALUES (
  'BURAYA_KENDI_USER_ID_NIZI_YAZIN', -- USER_ID'Yİ DEĞİŞTİRİN!
  'Advancement Flep: Tasarım ve Uygulama',
  'Advancement flebi, flebin doğrudan ileriye doğru hareket ettirilmesi prensibine dayanır. Bu teknik, flebin rotasyon veya transpozisyon yapmadan defekt alanına kaydırılması ile gerçekleştirilir. Advancement flebi özellikle alın ve kaş bölgelerindeki defektler için uygundur. Bu teknikte donor alan direkt olarak kapatılabilir. V-Y advancement ve A-T advancement gibi varyasyonları mevcuttur.',
  'article',
  ARRAY['advancement', 'flep', 'ilerletme flebi', 'V-Y advancement'],
  ARRAY['Alın', 'Kaş', 'Şakak'],
  ARRAY['Advancement'],
  true
);

-- Daha fazla kaynak eklemek için yukarıdaki formatı kullanarak yeni INSERT statement'ları ekleyebilirsiniz
-- Her INSERT statement'ından önce ve sonra virgül kullanmayın, sadece noktalı virgül (;) ile ayırın

-- NOT: Bu script'i çalıştırmadan önce:
-- 1. Tüm 'BURAYA_KENDI_USER_ID_NIZI_YAZIN' yerlerini kendi user_id'niz ile değiştirin
-- 2. İsterseniz örnek kaynakları düzenleyin veya silin
-- 3. Yeni kaynaklar ekleyebilirsiniz

