"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FencingModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fencing_app_service_1 = require("./application/fencing.app.service");
const fencing_controller_1 = require("./infraestructure/controllers/fencing.controller");
const participant_controller_1 = require("./infraestructure/controllers/participant.controller");
const api_service_1 = require("./infraestructure/shared/api.service");
const participant_service_1 = require("./infraestructure/shared/participant.service");
const participant_lookup_util_1 = require("./infraestructure/shared/participant-lookup.util");
const fencing_to_participant_mapper_1 = require("./application/mapper/fencing-to-participant.mapper");
const fencing_to_result_mapper_1 = require("./application/mapper/fencing-to-result.mapper");
const bullmq_1 = require("@nestjs/bullmq");
let FencingModule = class FencingModule {
};
exports.FencingModule = FencingModule;
exports.FencingModule = FencingModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule,
            bullmq_1.BullModule.registerQueue({
                name: "fen-mim",
                defaultJobOptions: {
                    attempts: 5,
                    backoff: { type: 'exponential', delay: 1000 },
                    removeOnComplete: 200,
                    removeOnFail: 200,
                },
            }),
        ],
        controllers: [fencing_controller_1.FencingController, participant_controller_1.ParticipantController],
        providers: [
            fencing_app_service_1.FencingService,
            api_service_1.ApiService,
            participant_service_1.ParticipantService,
            participant_lookup_util_1.ParticipantLookupUtil,
            fencing_to_participant_mapper_1.FencingToParticipantMapper,
            fencing_to_result_mapper_1.FencingToResultMapper
        ],
        exports: [
            fencing_app_service_1.FencingService,
            api_service_1.ApiService,
            participant_service_1.ParticipantService,
            participant_lookup_util_1.ParticipantLookupUtil,
            fencing_to_participant_mapper_1.FencingToParticipantMapper,
            fencing_to_result_mapper_1.FencingToResultMapper
        ],
    })
], FencingModule);
//# sourceMappingURL=fencing.module.js.map