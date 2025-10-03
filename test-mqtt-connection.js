const mqtt = require('mqtt');

// MQTT Test Configuration
const MQTT_URI = process.env.MQTT_URI || 'mqtt://srv.cis2025.win2tec.es:1883';
const TOPIC = 'TSOVR/FEN/RT/test';

// Test data
const testData = {
  "DataDic": {
    "Protocol": "EFP1.1",
    "Com": "INFO",
    "Piste": "GREEN",
    "Compe": "5095v1",
    "Phase": "1",
    "PoulTab": "3",
    "Match": "15",
    "Round": "1",
    "Time": "11:00",
    "Stopwatch": "3:00",
    "Type": "I",
    "Weapon": "S",
    "Priority": "N",
    "State": "E",
    "RightId": "2",
    "RightName": "ABULOV S",
    "RightNat": "UZB",
    "Rscore": "5",
    "Rstatus": "U",
    "RYcard": "0",
    "RRcard": "0",
    "RLight": "0",
    "RWlight": "0",
    "RMedical": "0",
    "RReserve": "N",
    "RPcard": "0",
    "LeftId": "6",
    "LeftName": "HAURUSIK K",
    "LeftNat": "BLR",
    "Lscore": "4",
    "Lstatus": "U",
    "LYcard": "0",
    "LRcard": "0",
    "LLight": "0",
    "LWlight": "0",
    "LMedical": "0",
    "LReserve": "N",
    "LPcard": "0"
  }
};

console.log('🔌 Testing MQTT Connection...');
console.log(`📡 Broker: ${MQTT_URI}`);
console.log(`📋 Topic: ${TOPIC}`);

// Connect to MQTT broker
const client = mqtt.connect(MQTT_URI);

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  
  // Subscribe to the topic
  client.subscribe(TOPIC, (err) => {
    if (err) {
      console.error('❌ Failed to subscribe:', err);
      process.exit(1);
    }
    console.log(`📥 Subscribed to topic: ${TOPIC}`);
  });
  
  // Publish test data
  console.log('📤 Publishing test data...');
  client.publish(TOPIC, JSON.stringify(testData), (err) => {
    if (err) {
      console.error('❌ Failed to publish:', err);
    } else {
      console.log('✅ Test data published successfully');
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`📨 Received message on topic ${topic}:`);
  console.log(JSON.stringify(JSON.parse(message.toString()), null, 2));
});

client.on('error', (err) => {
  console.error('❌ MQTT Error:', err);
  process.exit(1);
});

client.on('close', () => {
  console.log('🔌 MQTT connection closed');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  client.end();
  process.exit(0);
});

// Keep the script running for 10 seconds
setTimeout(() => {
  console.log('⏰ Test completed');
  client.end();
  process.exit(0);
}, 10000);
