// Image URL Test Script
// Bu script'i çalıştırmak için: node Desktop/check_image_url.js

const imageUrl = 'https://clcztcmxkmhrtnajciqd.supabase.co/storage/v1/object/public/case-photos/7d1a18c0-e2ee-4a2f-9d82-2ed249e2af12/preop-bb02d9cd-6c7f-429e-b47a-52fc6e66e148-1763915535205.jpg';

async function checkImageUrl() {
  console.log('Testing image URL:', imageUrl);
  
  try {
    // Test 1: HEAD request
    const headResponse = await fetch(imageUrl, { method: 'HEAD' });
    console.log('HEAD request result:', {
      status: headResponse.status,
      ok: headResponse.ok,
      headers: Object.fromEntries(headResponse.headers.entries()),
    });
    
    // Test 2: GET request (first few bytes)
    const getResponse = await fetch(imageUrl, { 
      method: 'GET',
      headers: {
        'Range': 'bytes=0-100'
      }
    });
    console.log('GET request result:', {
      status: getResponse.status,
      ok: getResponse.ok,
      contentType: getResponse.headers.get('content-type'),
    });
    
    if (getResponse.ok) {
      const blob = await getResponse.blob();
      console.log('Image blob:', {
        size: blob.size,
        type: blob.type,
      });
    }
    
    // Test 3: Check if URL is accessible from external sources
    console.log('\nURL Analysis:');
    console.log('- Is HTTPS:', imageUrl.startsWith('https://'));
    console.log('- Is public path:', imageUrl.includes('/storage/v1/object/public/'));
    console.log('- Domain:', new URL(imageUrl).hostname);
    
  } catch (error) {
    console.error('Error checking image URL:', error.message);
  }
}

checkImageUrl();

