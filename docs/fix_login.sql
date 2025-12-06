-- Login sorunu için kapsamlı düzeltme SQL'i

-- 1. Email'i confirm et
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email = 'oktaybakin@gmail.com';

-- 2. Kullanıcı profilini kontrol et ve eksikse oluştur
INSERT INTO user_profiles (
  id,
  full_name,
  tc_kimlik_no,
  specialty,
  institution_name,
  institution_email,
  phone,
  role,
  is_verified
)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Oktay Bakin'),
  COALESCE(u.raw_user_meta_data->>'tc_kimlik_no', '12345678901'),
  'Diğer',
  'Test Institution',
  'oktaybakin@gmail.com',
  '5555555555',
  'physician',
  true
FROM auth.users u
WHERE u.email = 'oktaybakin@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.id = u.id
);

-- 3. Kullanıcıyı doğrula
UPDATE user_profiles 
SET is_verified = true 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'oktaybakin@gmail.com'
);

-- 4. Kontrol: Kullanıcı durumunu görüntüle
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  up.full_name,
  up.is_verified,
  up.specialty
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'oktaybakin@gmail.com';

