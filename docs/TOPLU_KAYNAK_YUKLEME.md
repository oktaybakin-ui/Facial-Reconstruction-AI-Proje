# 📦 Toplu Kaynak Yükleme Kılavuzu

Tıbbi kaynaklarınızı iki farklı yöntemle doğrudan sisteme yükleyebilirsiniz:

## Yöntem 1: Admin Paneli ile Toplu Yükleme (Kolay) ⭐

1. Dashboard'dan **"📚 Bilgi Tabanı"** linkine tıklayın
2. **"📦 Toplu Yükleme"** butonuna tıklayın
3. JSON formatında kaynaklarınızı hazırlayın
4. JSON içeriğini textarea'ya yapıştırın
5. **"Kaynakları Yükle"** butonuna tıklayın

### JSON Formatı

```json
[
  {
    "title": "Kaynak Başlığı",
    "content": "Tıbbi kaynak içeriği buraya yazılır...",
    "source_type": "article",
    "keywords": ["anahtar", "kelime", "listesi"],
    "region_focus": ["Alın", "Burun"],
    "flap_types": ["Transpozisyon", "Rotasyon"],
    "source_url": "https://..."
  },
  {
    "title": "İkinci Kaynak",
    "content": "İçerik...",
    "source_type": "guideline",
    ...
  }
]
```

### Zorunlu Alanlar

- `title`: Kaynak başlığı (string)
- `content`: Kaynak içeriği (string)
- `source_type`: Kaynak türü - şunlardan biri olmalı: `text`, `pdf`, `article`, `book`, `guideline`, `research`

### Opsiyonel Alanlar

- `keywords`: Anahtar kelime dizisi (array)
- `region_focus`: İlgili bölgeler (array) - örn: ["Alın", "Burun", "Yanak"]
- `flap_types`: İlgili flep tipleri (array) - örn: ["Transpozisyon", "Rotasyon"]
- `source_url`: Kaynak URL'i (string)

### Örnek Şablon

Masaüstünüzdeki `bulk_load_json_template.json` dosyasını kullanabilirsiniz.

---

## Yöntem 2: SQL Script ile Doğrudan Veritabanına Yükleme (İleri Seviye)

1. Masaüstündeki `bulk_load_medical_sources.sql` dosyasını açın
2. `BURAYA_KENDI_USER_ID_NIZI_YAZIN` yazan tüm yerleri kendi user ID'niz ile değiştirin
   - Supabase Dashboard > Authentication > Users bölümünden user ID'nizi bulabilirsiniz
3. İsterseniz örnek kaynakları düzenleyin veya yeni kaynaklar ekleyin
4. Supabase SQL Editor'e gidin
5. SQL script'i kopyalayıp yapıştırın
6. "Run" butonuna tıklayın

### SQL Formatı

```sql
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
  'BURAYA_USER_ID_YAZIN',
  'Kaynak Başlığı',
  'İçerik...',
  'article',
  ARRAY['anahtar', 'kelime'],
  ARRAY['Alın', 'Burun'],
  ARRAY['Transpozisyon'],
  true
);
```

---

## Hangisini Kullanmalıyım?

- **Admin Paneli (Yöntem 1)**: Kolay, görsel arayüz, hata kontrolü, kullanıcı dostu
- **SQL Script (Yöntem 2)**: Hızlı, çok sayıda kaynak için uygun, doğrudan veritabanı erişimi

## Önemli Notlar

- Her iki yöntem de **sadece yöneticiler** tarafından kullanılabilir
- SQL script yöntemini kullanırken user_id'nizi doğru yazdığınızdan emin olun
- JSON formatında hata varsa, admin paneli hataları gösterir
- Toplu yükleme sırasında bir kaynak başarısız olsa bile diğerleri yüklenmeye devam eder

