-- Kullanıcıyı doğrulamak için SQL komutları

-- Yöntem 1: Email ile doğrulama - OKTAY BAKIN
UPDATE user_profiles 
SET is_verified = true 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'oktaybakin@gmail.com'
);

-- Yöntem 2: Son kayıt olan kullanıcıyı doğrula
UPDATE user_profiles 
SET is_verified = true 
WHERE id = (
  SELECT id FROM auth.users 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Yöntem 3: Tüm doğrulanmamış kullanıcıları doğrula (DİKKATLİ KULLANIN)
-- UPDATE user_profiles SET is_verified = true WHERE is_verified = false;

-- Kontrol: Doğrulanmış kullanıcıları görüntüle
SELECT 
  u.email,
  up.full_name,
  up.is_verified,
  up.created_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY up.created_at DESC;

