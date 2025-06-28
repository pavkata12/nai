const http = require('http');

const testBookingData = {
  name: "Test User",
  phone: "0888123456", 
  email: "test@example.com",
  date: "2024-12-30",
  start_time: "14:00",
  duration_hours: 2,
  booking_type: "standard",
  computer_id: 1,
  special_requests: "Test booking",
  total_price: 60.00
};

const postData = JSON.stringify(testBookingData);

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/bookings',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing booking API...');
console.log('📋 Test data:', testBookingData);

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📝 Response:');
    console.log('Raw data length:', data.length);
    console.log('Raw data:', data);
    
    if (data) {
      try {
        const response = JSON.parse(data);
        console.log('Parsed response:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('❌ JSON parse error:', e.message);
        console.log('Raw response:', data);
      }
    } else {
      console.log('❌ Empty response');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
});

req.write(postData);
req.end(); 