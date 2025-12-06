// Browser console'da çalıştırın - Login test kodu
// F12 > Console sekmesine yapıştırın

const testLogin = async () => {
  const email = 'oktaybakin@gmail.com';
  const password = 'your-password-here'; // Şifrenizi buraya yazın
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User:', data.user);
      console.log('Is verified:', data.is_verified);
    } else {
      console.error('❌ Login failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Kullanım: testLogin();

