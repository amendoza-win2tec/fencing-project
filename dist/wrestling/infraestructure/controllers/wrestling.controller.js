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
var WrestlingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrestlingController = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const wrestling_app_service_1 = require("../../application/wrestling.app.service");
const xml2js = require("xml2js");
let WrestlingController = WrestlingController_1 = class WrestlingController {
    constructor(wrestlingMiMQueue, wrestlingService) {
        this.wrestlingMiMQueue = wrestlingMiMQueue;
        this.wrestlingService = wrestlingService;
        this.logger = new common_1.Logger(WrestlingController_1.name);
    }
    async processWrestlingXml(req) {
        try {
            this.logger.log('Processing wrestling XML schedule...');
            const xmlContent = req.body;
            const result = await this.wrestlingService.processWrestlingSchedule(xmlContent);
            return {
                success: true,
                data: result,
                message: 'Wrestling XML schedule processed successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error processing wrestling XML: ${error.message}`);
            throw new common_1.BadRequestException(`Error processing XML: ${error.message}`);
        }
    }
    async processWrestlingFile(body) {
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
            const result = this.wrestlingService.processWrestlingFights(xmlJson);
            return {
                success: true,
                data: result,
                message: 'Wrestling XML file processed successfully',
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
            const result = await this.wrestlingService.sendRawPoulesToApi(xmlJson);
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error sending poules to API: ${error.message}`);
        }
    }
};
exports.WrestlingController = WrestlingController;
__decorate([
    (0, common_1.Post)('process-xml'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WrestlingController.prototype, "processWrestlingXml", null);
__decorate([
    (0, common_1.Post)('process-file'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WrestlingController.prototype, "processWrestlingFile", null);
__decorate([
    (0, common_1.Post)('send-poules'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WrestlingController.prototype, "sendRawPoulesToApi", null);
exports.WrestlingController = WrestlingController = WrestlingController_1 = __decorate([
    (0, common_1.Controller)('wrestling'),
    __param(0, (0, bullmq_2.InjectQueue)('wrestling-mim')),
    __metadata("design:paramtypes", [bullmq_1.Queue,
        wrestling_app_service_1.WrestlingService])
], WrestlingController);
//# sourceMappingURL=wrestling.controller.js.map