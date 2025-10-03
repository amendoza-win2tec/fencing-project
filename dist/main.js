"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    app.use('/api/fencing/process-xml', (0, express_1.raw)({
        type: 'application/xml',
        limit: '50mb'
    }));
    app.use('/api/fencing/process-xml', (0, express_1.raw)({
        type: 'text/xml',
        limit: '50mb'
    }));
    app.use('/api/fencing/process-xml', (0, express_1.raw)({
        type: 'application/octet-stream',
        limit: '50mb'
    }));
    app.use('/api/wrestling/process-xml', (0, express_1.raw)({
        type: 'application/xml',
        limit: '50mb'
    }));
    app.use('/api/wrestling/process-xml', (0, express_1.raw)({
        type: 'text/xml',
        limit: '50mb'
    }));
    app.use('/api/wrestling/process-xml', (0, express_1.raw)({
        type: 'application/octet-stream',
        limit: '50mb'
    }));
    app.use('/api/wrestling/send-poules', (0, express_1.raw)({
        type: 'application/xml',
        limit: '50mb'
    }));
    app.use('/api/wrestling/send-poules', (0, express_1.raw)({
        type: 'text/xml',
        limit: '50mb'
    }));
    app.use('/api/wrestling/send-poules', (0, express_1.raw)({
        type: 'application/octet-stream',
        limit: '50mb'
    }));
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.enableCors();
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3000;
    await app.listen(port);
    const configService = app.get(config_1.ConfigService);
    const mqttUri = configService.get('MQTT_URI');
    if (mqttUri) {
        try {
            app.connectMicroservice({
                transport: microservices_1.Transport.MQTT,
                options: {
                    url: 'mqtt://srv.cis2025.win2tec.es:1883',
                },
            });
            await app.startAllMicroservices();
            logger.log(`🔗 Connected to MQTT broker at: ${mqttUri}`);
        }
        catch (error) {
            logger.warn(`⚠️  Failed to connect to MQTT broker: ${error.message}`);
        }
    }
    else {
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
    logger.log(`🤼 Wrestling Endpoints:`);
    logger.log(`   POST http://localhost:${port}/api/wrestling/process-xml`);
    logger.log(`   POST http://localhost:${port}/api/wrestling/process-file`);
    logger.log(`   POST http://localhost:${port}/api/wrestling/send-poules`);
    logger.log(`   POST http://localhost:${port}/api/wrestling/test-mqtt-data`);
    logger.log(`📡 MQTT Endpoints:`);
    logger.log(`   Topic: TSOVR/FEN/RT/# (Fencing)`);
    logger.log(`   Topic: TSOVR/WRESTLING/RT/# (Wrestling)`);
    logger.log(`   Test: pnpm run test:mqtt`);
}
bootstrap();
//# sourceMappingURL=main.js.map