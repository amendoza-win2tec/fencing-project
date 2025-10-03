"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrestlingModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const wrestling_app_service_1 = require("./application/wrestling.app.service");
const wrestling_controller_1 = require("./infraestructure/controllers/wrestling.controller");
const api_service_1 = require("../fencing/infraestructure/shared/api.service");
const participant_service_1 = require("../fencing/infraestructure/shared/participant.service");
const participant_lookup_util_1 = require("../fencing/infraestructure/shared/participant-lookup.util");
const wrestling_to_participant_mapper_1 = require("./application/mapper/wrestling-to-participant.mapper");
const wrestling_to_result_mapper_1 = require("./application/mapper/wrestling-to-result.mapper");
const bullmq_1 = require("@nestjs/bullmq");
let WrestlingModule = class WrestlingModule {
};
exports.WrestlingModule = WrestlingModule;
exports.WrestlingModule = WrestlingModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule,
            bullmq_1.BullModule.registerQueue({
                name: "wrestling-mim",
                defaultJobOptions: {
                    attempts: 5,
                    backoff: { type: 'exponential', delay: 1000 },
                    removeOnComplete: 200,
                    removeOnFail: 200,
                },
            }),
        ],
        controllers: [wrestling_controller_1.WrestlingController],
        providers: [
            wrestling_app_service_1.WrestlingService,
            api_service_1.ApiService,
            participant_service_1.ParticipantService,
            participant_lookup_util_1.ParticipantLookupUtil,
            wrestling_to_participant_mapper_1.WrestlingToParticipantMapper,
            wrestling_to_result_mapper_1.WrestlingToResultMapper
        ],
        exports: [
            wrestling_app_service_1.WrestlingService,
            api_service_1.ApiService,
            participant_service_1.ParticipantService,
            participant_lookup_util_1.ParticipantLookupUtil,
            wrestling_to_participant_mapper_1.WrestlingToParticipantMapper,
            wrestling_to_result_mapper_1.WrestlingToResultMapper
        ],
    })
], WrestlingModule);
//# sourceMappingURL=wrestling.module.js.map