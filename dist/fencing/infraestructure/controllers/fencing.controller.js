"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FencingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FencingController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const fencing_app_service_1 = require("../../application/fencing.app.service");
const xml2js = require("xml2js");
let FencingController = FencingController_1 = class FencingController {
    constructor(fenMiMQueue, fencingService) {
        this.fenMiMQueue = fenMiMQueue;
        this.fencingService = fencingService;
        this.logger = new common_1.Logger(FencingController_1.name);
    }
    async processFencingXml(req) {
        try {
            const xmlContent = req.body?.toString('utf8');
            if (!xmlContent) {
                throw new common_1.BadRequestException('XML content is required');
            }
            const parser = new xml2js.Parser({
                explicitArray: false,
                mergeAttrs: true,
                explicitRoot: false,
            });
            const xmlJson = await parser.parseStringPromise(xmlContent);
            const result = await this.fencingService.processFencingFights(xmlJson);
            return {
                success: true,
                data: result,
                message: 'Fencing XML processed successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error processing XML: ${error.message}`);
        }
    }
    async processFencingFile(body) {
        try {
            if (!body.xmlFile) {
                throw new common_1.BadRequestException('XML file content is required');
            }
            const parser = new xml2js.Parser({
                explicitArray: false,
                mergeAttrs: true,
                explicitRoot: false,
            });
            const xmlJson = await parser.parseStringPromise(body.xmlFile);
            const result = this.fencingService.processFencingFights(xmlJson);
            return {
                success: true,
                data: result,
                message: 'Fencing XML file processed successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error processing XML file: ${error}`);
        }
    }
    async sendRawPoulesToApi(req) {
        try {
            const xmlContent = req.body?.toString('utf8');
            if (!xmlContent) {
                throw new common_1.BadRequestException('XML content is required');
            }
            const parser = new xml2js.Parser({
                explicitArray: false,
                mergeAttrs: true,
                explicitRoot: false,
            });
            const xmlJson = await parser.parseStringPromise(xmlContent);
            const result = await this.fencingService.sendRawPoulesToApi(xmlJson);
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error sending poules to API: ${error.message}`);
        }
    }
    async testMqttData(body) {
        try {
            this.logger.log('Testing MQTT data processing');
            const matchData = this.transformMqttData(body.DataDic);
            this.logger.log(`Test match data: ${JSON.stringify(matchData, null, 2)}`);
            return {
                success: true,
                message: 'MQTT data processed successfully',
                data: matchData
            };
        }
        catch (error) {
            this.logger.error(`Error testing MQTT data: ${error.message}`);
            throw new common_1.BadRequestException(`Error testing MQTT data: ${error.message}`);
        }
    }
    async handleJudData(payload) {
        try {
            this.logger.log('Received TKW data from MQTT topic');
            this.logger.debug(`MQTT Payload: ${JSON.stringify(payload, null, 2)}`);
            const matchData = this.transformMqttData(payload.DataDic);
            this.logger.log(`Processing match ${matchData.match} - ${matchData.rightFencer.name} vs ${matchData.leftFencer.name}`);
            await this.fencingService.parseIndividualCompetition(matchData);
            this.logger.log('Successfully processed TKW data from MQTT');
        }
        catch (error) {
            this.logger.error(`Error handling TKW MQTT data: ${error.message}`, error.stack);
            throw error;
        }
    }
    transformMqttData(mqttData) {
        const data = mqttData;
        return {
            protocol: data.Protocol,
            communication: data.Com,
            piste: data.Piste,
            competition: data.Compe,
            phase: data.Phase,
            pouleTable: data.PoulTab,
            match: data.Match,
            round: data.Round,
            time: data.Time,
            stopwatch: data.Stopwatch,
            type: data.Type,
            weapon: data.Weapon,
            priority: data.Priority,
            state: data.State,
            rightFencer: {
                id: data.RightId,
                name: data.RightName,
                nationality: data.RightNat,
                score: data.Rscore,
                status: data.Rstatus,
                yellowCard: data.RYcard,
                redCard: data.RRcard,
                light: data.RLight,
                weaponLight: data.RWlight,
                medical: data.RMedical,
                reserve: data.RReserve,
                pCard: data.RPcard
            },
            leftFencer: {
                id: data.LeftId,
                name: data.LeftName,
                nationality: data.LeftNat,
                score: data.Lscore,
                status: data.Lstatus,
                yellowCard: data.LYcard,
                redCard: data.LRcard,
                light: data.LLight,
                weaponLight: data.LWlight,
                medical: data.LMedical,
                reserve: data.LReserve,
                pCard: data.LPcard
            }
        };
    }
};
exports.FencingController = FencingController;
__decorate([
    (0, common_1.Post)('process-xml'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FencingController.prototype, "processFencingXml", null);
__decorate([
    (0, common_1.Post)('process-file'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FencingController.prototype, "processFencingFile", null);
__decorate([
    (0, common_1.Post)('send-poules'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FencingController.prototype, "sendRawPoulesToApi", null);
__decorate([
    (0, common_1.Post)('test-mqtt-data'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FencingController.prototype, "testMqttData", null);
__decorate([
    (0, microservices_1.MessagePattern)('TSOVR/FEN/RT/#'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FencingController.prototype, "handleJudData", null);
exports.FencingController = FencingController = FencingController_1 = __decorate([
    (0, common_1.Controller)('fencing'),
    __param(0, (0, bullmq_2.InjectQueue)('fen-mim')),
    __metadata("design:paramtypes", [bullmq_1.Queue,
        fencing_app_service_1.FencingService])
], FencingController);
//# sourceMappingURL=fencing.controller.js.map