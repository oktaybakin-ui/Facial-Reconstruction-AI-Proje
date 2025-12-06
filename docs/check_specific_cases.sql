-- Belirli Case ID'lerini Kontrol Et

-- Case 1: 2767e43c-4198-4ad7-98a8-fc2e94d701b6
SELECT 
  c.*,
  u.email as user_email,
  up.full_name,
  up.is_verified
FROM cases c
LEFT JOIN auth.users u ON c.user_id = u.id
LEFT JOIN user_profiles up ON c.user_id = up.id
WHERE c.id = '2767e43c-4198-4ad7-98a8-fc2e94d701b6';

-- Case 2: 145334b0-46bc-4589-965c-efbcc010f047
SELECT 
  c.*,
  u.email as user_email,
  up.full_name,
  up.is_verified
FROM cases c
LEFT JOIN auth.users u ON c.user_id = u.id
LEFT JOIN user_profiles up ON c.user_id = up.id
WHERE c.id = '145334b0-46bc-4589-965c-efbcc010f047';

-- Case 1 için fotoğraflar
SELECT 
  cp.*,
  c.case_code
FROM case_photos cp
LEFT JOIN cases c ON cp.case_id = c.id
WHERE cp.case_id = '2767e43c-4198-4ad7-98a8-fc2e94d701b6'
ORDER BY cp.created_at DESC;

-- Case 2 için fotoğraflar
SELECT 
  cp.*,
  c.case_code
FROM case_photos cp
LEFT JOIN cases c ON cp.case_id = c.id
WHERE cp.case_id = '145334b0-46bc-4589-965c-efbcc010f047'
ORDER BY cp.created_at DESC;

-- Tüm case'ler ve fotoğraf sayıları
SELECT 
  c.id,
  c.case_code,
  c.region,
  c.user_id,
  u.email,
  COUNT(cp.id) as photo_count,
  COUNT(CASE WHEN cp.type = 'preop' THEN 1 END) as preop_count,
  COUNT(CASE WHEN cp.type = 'postop' THEN 1 END) as postop_count,
  c.created_at
FROM cases c
LEFT JOIN auth.users u ON c.user_id = u.id
LEFT JOIN case_photos cp ON c.id = cp.case_id
GROUP BY c.id, c.case_code, c.region, c.user_id, u.email, c.created_at
ORDER BY c.created_at DESC;

