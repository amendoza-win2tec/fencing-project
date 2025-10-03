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
var ApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let ApiService = ApiService_1 = class ApiService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ApiService_1.name);
        this.apiBaseUrl = this.configService.get('API_BASE_URL') || 'http://localhost:3020/api';
        this.apiKey = this.configService.get('API_KEY') || '';
        this.mqttUser = this.configService.get('MQTT_URI') || '';
        this.mqttPassword = this.configService.get('MQTT_PASSWORD') || '';
        this.mqttHost = this.configService.get('MQTT_HOST') || '';
    }
    async sendPoulesData(request) {
        try {
            this.logger.log(`Sending poules data for competition: ${request.competitionId}`);
            const response = await axios_1.default.put(`${this.apiBaseUrl}/unit/raw-update`, { ...request }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-API-Version': '1.0',
                },
                timeout: 10000,
            });
            this.logger.log(`Successfully sent poules data. Status: ${response.status}`);
            return {
                success: true,
                data: response.data,
                message: 'Poules data sent successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to send poules data: ${error.message}`);
            if (axios_1.default.isAxiosError(error)) {
                return {
                    success: false,
                    error: error.message,
                    message: `API Error: ${error.response?.status} - ${error.response?.statusText}`,
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Unknown error occurred while sending data',
            };
        }
    }
    async getResult(unitCode) {
        try {
            const response = await axios_1.default.get(`${this.apiBaseUrl}/result/get-by-code/${unitCode}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-API-Version': '1.0',
                },
            });
            return {
                success: true,
                data: response.data,
                message: `Result sent successfully`,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get result: ${error.message}`);
            if (axios_1.default.isAxiosError(error)) {
                return {
                    success: false,
                    error: error.message,
                    message: `API Error: ${error.response?.status} - ${error.response?.statusText}`,
                };
            }
            return {
                success: false,
                error: error.message,
                message: `Unknown error occurred while getting result`,
            };
        }
    }
    async sendPouleData(poule) {
        try {
            const response = await axios_1.default.put(`${this.apiBaseUrl}/unit/raw-update`, {
                ...poule,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-API-Version': '1.0',
                },
                timeout: 15000,
            });
        }
        catch (error) {
            this.logger.error(`Failed to send poule`);
            if (axios_1.default.isAxiosError(error)) {
                return {
                    success: false,
                    error: error.message,
                    message: `API Error: ${error.response?.status} - ${error.response?.statusText}`,
                };
            }
            return {
                success: false,
                error: error.message,
                message: `Unknown error occurred while sending poule data`,
            };
        }
    }
    async sendStartListData(startList) {
        try {
            const response = await axios_1.default.post(`${this.apiBaseUrl}/start-list/create`, {
                ...startList,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-API-Version': '1.0',
                },
                timeout: 15000,
            });
            return {
                success: true,
                data: response.data,
                message: `Poule start list data sent successfully`,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send poule start list data: ${error.message}`);
            if (axios_1.default.isAxiosError(error)) {
                return {
                    success: false,
                    error: error.message,
                    message: `API Error: ${error.response?.status} - ${error.response?.statusText}`,
                };
            }
            return {
                success: false,
                error: error.message,
                message: `Unknown error occurred while sending poule start list data`,
            };
        }
    }
    async sendResultData(result) {
        try {
            const response = await axios_1.default.put(`${this.apiBaseUrl}/result/update`, {
                ...result,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-API-Version': '1.0',
                },
                timeout: 15000,
            });
            return {
                success: true,
                data: response.data,
                message: `Poule result data sent successfully`,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send poule result data: ${error.message}`);
            if (axios_1.default.isAxiosError(error)) {
                return {
                    success: false,
                    error: error.message,
                    message: `API Error: ${error.response?.status} - ${error.response?.statusText}`,
                };
            }
            return {
                success: false,
                error: error.message,
                message: `Unknown error occurred while sending poule result data`,
            };
        }
    }
    async checkApiHealth() {
        try {
            const response = await axios_1.default.get(`${this.apiBaseUrl}/health`, {
                timeout: 5000,
            });
            return response.status === 200;
        }
        catch (error) {
            this.logger.warn(`API health check failed: ${error.message}`);
            return false;
        }
    }
};
exports.ApiService = ApiService;
exports.ApiService = ApiService = ApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ApiService);
//# sourceMappingURL=api.service.js.map