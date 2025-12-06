# 📚 Tıbbi Kaynak Sistemi (Knowledge Base) Kurulum Kılavuzu

Bu sistem, AI'ın flep önerilerini desteklemek için kullanıcıların tıbbi kaynaklarını yükleyip yönetebilmesine olanak sağlar.

## 🚀 Kurulum Adımları

### 1. Veritabanı Şemasını Oluştur

1. Supabase Dashboard'a gidin
2. SQL Editor'ü açın
3. `medical_knowledge_base_schema.sql` dosyasının içeriğini kopyalayıp yapıştırın
4. "Run" butonuna tıklayın

Bu şema şunları oluşturur:
- `medical_sources` tablosu
- RLS (Row Level Security) politikaları
- Arama fonksiyonu (`search_medical_sources`)
- Indexler (performans için)

### 2. Kullanım

#### Kaynak Ekleme
1. Dashboard'dan "📚 Bilgi Tabanı" linkine tıklayın
2. "➕ Yeni Kaynak Ekle" butonuna tıklayın
3. Formu doldurun:
   - **Kaynak Türü**: Metin, Makale, Kitap, Kılavuz, Araştırma, PDF
   - **Başlık**: Kaynağın başlığı
   - **İçerik**: Tıbbi bilgi, teknik açıklama (bu içerik AI tarafından kullanılacak)
   - **İlgili Bölgeler**: Bu kaynağın hangi yüz bölgeleri için geçerli olduğu
   - **İlgili Flep Tipleri**: Bu kaynağın hangi flep tiplerini kapsadığı
   - **Anahtar Kelimeler**: Arama için anahtar kelimeler

#### AI Kullanımı
AI analizi çalıştırıldığında:
1. Sistem otomatik olarak olgunun bölgesine ve kritik yapılarına göre ilgili kaynakları arar
2. En uygun 3 kaynağı bulur
3. Bu kaynakları AI prompt'una ekler
4. AI flep önerilerini bu kaynaklara dayandırarak yapar

## 📋 Örnek Kaynak İçerikleri

### Örnek 1: Transpozisyon Flebi
```
Başlık: Transpozisyon Flebi Teknikleri
Tür: Makale
İçerik: Transpozisyon flebi, defektin hemen yanındaki sağlam dokudan alınan flebin 
defekt alanına aktarılması prensibine dayanır. Flep, defekt boyutunun 1.5-2 katı 
genişliğinde planlanmalıdır. Natural skin tension lines (RSTL) boyunca insizyon 
yapılmalıdır...
Bölgeler: Alın, Yanak, Burun
Flep Tipleri: Transpozisyon
```

### Örnek 2: Rotasyon Flebi
```
Başlık: Rotasyon Flebi Prensipleri
Tür: Kılavuz
İçerik: Rotasyon flebi, donor alanın defekt alanı etrafında döndürülmesi prensibine 
dayanır. Bu teknik özellikle üçgen defektler için idealdir. Flep tasarımında donor 
alanın kapatılabilirliği değerlendirilmelidir...
Bölgeler: Alın, Şakak, Çene
Flep Tipleri: Rotasyon
```

## 🔍 Arama Mantığı

Sistem şu kriterlere göre kaynak arar:
1. **Bölge**: Olgunun bölgesi ile eşleşen kaynaklar önceliklidir
2. **Anahtar Kelimeler**: Olgudaki kritik yapılar ve bilgiler ile eşleşen kaynaklar
3. **Flep Tipi**: Önerilen flep tipine uygun kaynaklar

## 🎯 Faydaları

- **Güvenilirlik**: AI önerileri kullanıcının yüklediği tıbbi kaynaklara dayanır
- **Kişiselleştirme**: Her kullanıcı kendi kaynak kütüphanesini oluşturabilir
- **Güncellik**: Yeni tıbbi bilgiler kolayca eklenebilir
- **Takip**: Hangi kaynağın hangi öneride kullanıldığı izlenebilir

## 📝 Notlar

- Kaynaklar sadece kaynağı ekleyen kullanıcı tarafından görülebilir (RLS)
- Kaynaklar "soft delete" ile silinir (is_active = false)
- Arama fonksiyonu relevance score'a göre sıralama yapar
- AI analizi sırasında en uygun 3 kaynak kullanılır

## 🔧 Gelişmiş Özellikler (İleride)

- PDF yükleme ve otomatik içerik çıkarma
- Vector embeddings ile semantik arama
- Kaynak versiyonlama
- Kaynak paylaşımı (isteğe bağlı)
- Kaynak istatistikleri (hangi kaynak kaç kez kullanıldı)

