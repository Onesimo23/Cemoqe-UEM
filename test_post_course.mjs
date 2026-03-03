import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const API_URL = 'http://localhost:3005';

const testPayload = {
  instructor_uid: 'test-instructor-uid',
  title: 'Test Course',
  description: 'Test Description',
  image_url: 'https://example.com/image.jpg',
  category: 'Geral',
  level: 'beginner',
  price: 0,
};

console.log('🧪 Testing POST /api/courses');
console.log('📦 Payload:', JSON.stringify(testPayload, null, 2));

try {
  const response = await axios.post(`${API_URL}/api/courses`, testPayload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  console.log('✅ SUCCESS:', response.status);
  console.log('📋 Response:', JSON.stringify(response.data, null, 2));
} catch (error) {
  console.error('❌ ERROR:', error.response?.status || error.code);
  console.error('📋 Response:', error.response?.data || error.message);
  
  if (error.response?.data) {
    console.error('Details:', error.response.data);
  }
}
