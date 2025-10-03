import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { json, raw } from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  // Configure middleware for raw body handling
  app.use('/api/fencing/process-xml', raw({ type: 'application/xml' }));
  app.use('/api/fencing/process-xml', raw({ type: 'text/xml' }));
  app.use('/api/fencing/process-xml', raw({ type: 'application/octet-stream' }));
  
  // Enable CORS for all routes
  app.enableCors();
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  const configService = app.get(ConfigService);
  const mqttUri = configService.get<string>('MQTT_URI');
  
  // Connect to MQTT broker only if MQTT_URI is configured
  if (mqttUri) {
    try {
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.MQTT,
        options: {
          url: 'mqtt://srv.cis2025.win2tec.es:1883',
        },
      });
      
      // Start the microservice
      await app.startAllMicroservices();
      logger.log(`🔗 Connected to MQTT broker at: ${mqttUri}`);
    } catch (error) {
      logger.warn(`⚠️  Failed to connect to MQTT broker: ${error.message}`);
    }
  } else {
    logger.log(`ℹ️  MQTT microservice not configured (MQTT_URI not set)`);
  }
  logger.log(`🚀 Fencing XML Processor API is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api`);
  logger.log(`🏥 Health Check: http://localhost:${port}/api/health`);
  logger.log(`⚔️  Fencing Endpoints:`);
  logger.log(`   POST http://localhost:${port}/api/fencing/process-xml`);
  logger.log(`   POST http://localhost:${port}/api/fencing/process-file`);
  logger.log(`   POST http://localhost:${port}/api/fencing/send-poules`);
  logger.log(`   POST http://localhost:${port}/api/fencing/test-mqtt-data`);
  logger.log(`📡 MQTT Endpoints:`);
  logger.log(`   Topic: TSOVR/FEN/RT/#`);
  logger.log(`   Test: pnpm run test:mqtt`);
}

bootstrap();

