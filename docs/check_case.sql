-- Case kontrolü için SQL

-- Tüm case'leri görüntüle
SELECT 
  c.id,
  c.case_code,
  c.region,
  c.user_id,
  u.email,
  c.created_at,
  c.status
FROM cases c
LEFT JOIN auth.users u ON c.user_id = u.id
ORDER BY c.created_at DESC
LIMIT 10;

-- Belirli bir case'i kontrol et (case_id'yi değiştirin)
-- SELECT * FROM cases WHERE id = 'case-id-here';

-- Case photos kontrolü
SELECT 
  cp.id,
  cp.case_id,
  cp.type,
  cp.url,
  cp.created_at,
  c.case_code
FROM case_photos cp
LEFT JOIN cases c ON cp.case_id = c.id
ORDER BY cp.created_at DESC
LIMIT 10;

