# AI Analiz Testi ve Debug Rehberi

## Durum
- ✅ Case'ler veritabanında mevcut
- ✅ Pre-op fotoğrafları yüklü
- ❌ AI analiz çalışmıyor - "invalid input syntax for type uuid: 'undefined'" hatası

## Test Adımları

### 1. Tarayıcı Console Kontrolü (F12)
AI analiz butonuna tıklamadan önce console'u açın ve şu log'ları kontrol edin:
- `Starting AI analysis for case:` - caseId ve userId değerleri
- `Full userId prop:` - userId'nin gerçek değeri
- `Request body to send:` - Gönderilen request body

### 2. Terminal/Server Log Kontrolü
Terminal'de (npm run dev çalıştığı yer) şu log'ları kontrol edin:
- `AI Analyze endpoint called for case:` - Case ID doğru mu?
- `Extracted userId:` - userId doğru mu?
- `Fetching case:` - Orchestrator'a geçti mi?
- `Case query result:` - Case bulundu mu?
- `Photos query result:` - Fotoğraf bulundu mu?

### 3. Muhtemel Sorunlar

#### Sorun 1: userId undefined
**Kontrol:** Browser console'da `Full userId prop:` log'una bakın
**Çözüm:** Sayfayı yenileyin (F5) veya çıkış yapıp tekrar giriş yapın

#### Sorun 2: caseId undefined
**Kontrol:** Browser console'da `Starting AI analysis for case:` log'una bakın
**Çözüm:** Sayfayı yenileyin ve tekrar deneyin

#### Sorun 3: UUID format hatası
**Kontrol:** Server log'larında `Type check - caseId:` log'una bakın
**Çözüm:** UUID formatı doğru mu kontrol edin

### 4. Hızlı Test
1. Sayfayı yenileyin (F5)
2. F12 ile console'u açın
3. AI Analiz butonuna tıklayın
4. Console ve terminal log'larını kontrol edin
5. Hata mesajlarını not edin

## Beklenen Log Sırası

### Browser Console:
```
Starting AI analysis for case: 2767e43c-4198-4ad7-98a8-fc2e94d701b6 user: 7d1a18c0-e2ee-4a2f-9d82-2ed249e2af12
Type check - caseId: string userId: string
Full caseData: {...}
Full userId prop: 7d1a18c0-e2ee-4a2f-9d82-2ed249e2af12
Request body to send: {user_id: "7d1a18c0-e2ee-4a2f-9d82-2ed249e2af12"}
```

### Terminal/Server:
```
AI Analyze endpoint called for case: 2767e43c-4198-4ad7-98a8-fc2e94d701b6
Request body: {user_id: "7d1a18c0-e2ee-4a2f-9d82-2ed249e2af12"}
Extracted userId: 7d1a18c0-e2ee-4a2f-9d82-2ed249e2af12
Fetching case: 2767e43c-4198-4ad7-98a8-fc2e94d701b6 for user: 7d1a18c0-e2ee-4a2f-9d82-2ed249e2af12
Case query result: {caseFound: true, ...}
Photos query result: {photosFound: 1, ...}
```

## Hata Durumunda Yapılacaklar

Eğer hala hata alıyorsanız, şu bilgileri paylaşın:
1. Browser console'daki tam hata mesajı
2. Terminal'deki son 10 satır log
3. `Full userId prop:` log'unun değeri
4. `Extracted userId:` log'unun değeri

