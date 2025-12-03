import { connectDB, Availability } from './database.js';

async function testMapSerialization() {
  await connectDB();
  
  // Find an availability document
  const availability = await Availability.findOne({});
  
  if (!availability) {
    console.log('No availability documents found');
    process.exit(0);
  }
  
  console.log('Found availability for:', availability.username);
  console.log('Dates type:', typeof availability.dates);
  console.log('Dates constructor:', availability.dates?.constructor?.name);
  console.log('Has forEach?', typeof availability.dates?.forEach === 'function');
  
  // Try different conversion methods
  console.log('\n=== Method 1: forEach ===');
  let calendar1 = {};
  if (availability.dates && typeof availability.dates.forEach === 'function') {
    availability.dates.forEach((value, key) => {
      calendar1[key] = value;
    });
  }
  console.log('Result:', calendar1);
  console.log('Keys count:', Object.keys(calendar1).length);
  
  console.log('\n=== Method 2: toObject ===');
  try {
    const calendar2 = availability.toObject().dates;
    console.log('Result:', calendar2);
    console.log('Type:', typeof calendar2);
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  console.log('\n=== Method 3: JSON parse/stringify ===');
  try {
    const calendar3 = JSON.parse(JSON.stringify(availability.dates));
    console.log('Result:', calendar3);
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  console.log('\n=== Method 4: toJSON ===');
  try {
    const doc = availability.toJSON();
    console.log('Result:', doc.dates);
    console.log('Type:', typeof doc.dates);
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  process.exit(0);
}

testMapSerialization().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
