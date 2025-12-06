-- Kullanıcı durumunu kontrol et

-- 1. Kullanıcının auth.users tablosunda olup olmadığını kontrol et
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'oktaybakin@gmail.com';

-- 2. user_profiles tablosunda profil var mı kontrol et
SELECT 
  up.*,
  u.email,
  u.email_confirmed_at
FROM user_profiles up
JOIN auth.users u ON up.id = u.id
WHERE u.email = 'oktaybakin@gmail.com';

-- 3. Şifre sıfırlama (gerekirse)
-- Bu komutu çalıştırmak şifre sıfırlama email'i gönderir
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email = 'oktaybakin@gmail.com';

