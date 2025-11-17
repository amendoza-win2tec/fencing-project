const axios = require('axios');

// Test the WRE participants endpoint
async function testWreParticipants() {
  try {
    console.log('Testing WRE participants start list...');
    
    // Test getting all participants
    const response = await axios.get('http://localhost:3000/wrestling/participants/start-list', {
      params: {
        discipline: 'WRE',
        gender: 'M',
        sportEvent: 'Wrestling',
        category: 'Senior',
        phase: 'Qualification',
        unit: '001',
        phaseCode: 'WRE-M-Wrestling-Senior-Qualification',
        unitCode: 'WRE-M-Wrestling-Senior-Qualification-001'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Number of participants:', response.data.participants.length);
    console.log('First participant:', response.data.participants[0]);
    
    // Test getting participants by gender
    console.log('\nTesting WRE participants by gender (Female)...');
    const femaleResponse = await axios.get('http://localhost:3000/wrestling/participants/start-list-by-gender', {
      params: {
        gender: 'F',
        discipline: 'WRE',
        sportEvent: 'Wrestling',
        category: 'Senior',
        phase: 'Qualification',
        unit: '001',
        phaseCode: 'WRE-F-Wrestling-Senior-Qualification',
        unitCode: 'WRE-F-Wrestling-Senior-Qualification-001'
      }
    });
    
    console.log('Female participants count:', femaleResponse.data.participants.length);
    console.log('First female participant:', femaleResponse.data.participants[0]);
    
  } catch (error) {
    console.error('Error testing WRE participants:', error.response?.data || error.message);
  }
}

// Run the test
testWreParticipants();
