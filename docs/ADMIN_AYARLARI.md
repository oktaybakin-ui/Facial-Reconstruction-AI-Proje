# 🔐 Yönetici (Admin) Ayarları

Tıbbi kaynak ekleme/düzenleme işlemleri sadece yöneticiler tarafından yapılabilir.

## Kurulum

1. `.env.local` dosyanıza aşağıdaki satırı ekleyin:

```env
ADMIN_EMAILS=oktaybakin@gmail.com
```

Birden fazla yönetici için:

```env
ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
```

2. Değişikliklerin etkili olması için Next.js sunucusunu yeniden başlatın.

## Nasıl Çalışır?

- **Normal Kullanıcılar**: Kaynakları görüntüleyebilir ama ekleyemez, düzenleyemez veya silemez.
- **Yöneticiler**: Tüm kaynak işlemlerini yapabilir (ekleme, düzenleme, silme).

## Güvenlik

- Admin kontrolü hem frontend (UI) hem de backend (API) tarafında yapılır.
- Email adresi `.env.local` dosyasından okunur (güvenlik için bu dosya Git'e eklenmemelidir).
- API route'larında admin kontrolü yapılmadığı takdirde işlem reddedilir.

## Not

- Email adresleri büyük/küçük harf duyarsızdır.
- Sadece `.env.local` dosyasında belirtilen email adresleri yönetici olarak tanınır.

