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
var FencingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FencingService = void 0;
const common_1 = require("@nestjs/common");
const fencing_to_unit_mapper_1 = require("./mapper/fencing-to-unit.mapper");
const api_service_1 = require("../infraestructure/shared/api.service");
const fencing_to_participant_mapper_1 = require("./mapper/fencing-to-participant.mapper");
const fencing_to_result_mapper_1 = require("./mapper/fencing-to-result.mapper");
let FencingService = FencingService_1 = class FencingService {
    constructor(apiService, fencingToParticipantMapper, fencingToResultMapper) {
        this.apiService = apiService;
        this.fencingToParticipantMapper = fencingToParticipantMapper;
        this.fencingToResultMapper = fencingToResultMapper;
        this.logger = new common_1.Logger(FencingService_1.name);
    }
    async processFencingFights(fencingFights) {
        try {
            const rawPoules = fencingFights.Phases.TourDePoules;
            const rawEliminations = fencingFights.Phases?.PhaseDeTableaux;
            const sportEvent = fencingFights.Arme;
            const gender = fencingFights.Sexe;
            const allUnits = [];
            const allStartLists = [];
            const allResults = [];
            rawPoules.Poule.forEach((poule, index) => {
                const convertedMatches = (0, fencing_to_unit_mapper_1.convertPouleToMatch)(poule, sportEvent);
                convertedMatches.forEach((match, matchIndex) => {
                    const tireurStatus = match.Tireur.map(tireur => ({
                        ref: tireur.REF,
                        score: tireur.Score ?? '0',
                        status: tireur.Statut ?? ''
                    }));
                    const matchName = `Pool ${poule.ID} - Bout ${match.ID}`;
                    const unit = (0, fencing_to_unit_mapper_1.mapToW2tecPhases)(match, matchName, `${matchIndex}`, tireurStatus, `Bout ${match.ID}`, gender);
                    const startList = this.fencingToParticipantMapper.createStartListDto(match.Tireur, { ...unit.metadata, unitCode: unit.code });
                    const result = this.fencingToResultMapper.createResultDto(match.Tireur, { ...unit.metadata, unitCode: unit.code });
                    allUnits.push(unit);
                    allResults.push(result);
                    allStartLists.push(startList);
                });
            });
            const rawEliminationToArray = Array.isArray(rawEliminations?.SuiteDeTableaux) ? rawEliminations?.SuiteDeTableaux : [rawEliminations?.SuiteDeTableaux];
            rawEliminationToArray.forEach((elimination, eliminationIndex) => {
                if (!elimination)
                    return;
                const convertedMatches = (0, fencing_to_unit_mapper_1.convertEliminationToMatch)(elimination, sportEvent, gender);
                convertedMatches.forEach((match, matchIndex) => {
                    const tireurStatus = match.Tireur.map(tireur => ({
                        ref: tireur.REF,
                        score: tireur.Score || '0',
                        status: tireur.Statut || ''
                    }));
                    const matchName = `${match.phase} - Bout ${match.ID}`;
                    const unit = (0, fencing_to_unit_mapper_1.mapToW2tecPhases)(match, matchName, `${match.ID}`, tireurStatus, `Bout ${match.ID}`, gender);
                    const startList = this.fencingToParticipantMapper.createStartListDto(match.Tireur, { ...unit.metadata, unitCode: unit.code });
                    const result = this.fencingToResultMapper.createResultDto(match.Tireur, { ...unit.metadata, unitCode: unit.code });
                    allUnits.push(unit);
                    allResults.push(result);
                    allStartLists.push(startList);
                });
            });
            for (const unit of allUnits) {
                await this.sendPouleToApi(unit);
            }
            for (const startList of allStartLists) {
                await this.sendStartListToApi(startList);
            }
            for (const result of allResults) {
                await this.sendResultToApi(result);
            }
            for (const unit of allUnits) {
                await this.sendPouleToApi(unit);
            }
            return allUnits;
        }
        catch (error) {
            console.error('Error processing fencing fights:', error);
            throw new Error(`Failed to process fencing fights: ${error.message}`);
        }
    }
    async sendRawPoulesToApi(fencingFights) {
        try {
            this.logger.log(`Sending raw poules data for competition: ${fencingFights.Championnat}`);
            const rawPoules = fencingFights.Phases.TourDePoules;
            const competitionId = `${fencingFights.Championnat}-${fencingFights.Annee}-${fencingFights.Arme}`;
            const apiRequest = {
                competitionId,
                poules: rawPoules.Poule,
                metadata: {
                    competitionName: fencingFights.Championnat,
                    date: fencingFights.Date,
                    weapon: fencingFights.Arme,
                    gender: fencingFights.Sexe,
                },
            };
            const result = await this.apiService.sendPoulesData(apiRequest);
            if (result.success) {
                this.logger.log(`Successfully sent ${rawPoules.Poule.length} poules to API`);
            }
            else {
                this.logger.error(`Failed to send poules to API: ${result.message}`);
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Error sending raw poules to API: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Failed to send raw poules data to API',
            };
        }
    }
    async sendPouleToApi(poule) {
        try {
            const result = await this.apiService.sendPouleData(poule);
            if (result.success) {
                this.logger.log(`Successfully sent poule ${poule.ID} to API`);
            }
            else {
                this.logger.error(`Failed to send poule ${poule.ID} to API: ${result.message}`);
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Error sending poule ${poule.ID} to API: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: `Failed to send poule ${poule.ID} data to API`,
            };
        }
    }
    async sendStartListToApi(startList) {
        try {
            const result = await this.apiService.sendStartListData(startList);
            if (result.success) {
                this.logger.log(`Successfully sent start list to API`);
            }
            else {
                this.logger.error(`Failed to send start list to API: ${result.message}`);
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Error sending start list to API: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: `Failed to send start list data to API`,
            };
        }
    }
    async sendResultToApi(resultPayload) {
        try {
            const result = await this.apiService.sendResultData(resultPayload);
            if (result.success) {
                this.logger.log(`Successfully sent result to API`);
            }
            else {
                this.logger.error(`Failed to send result to API: ${result.message}`);
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Error sending result to API: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: `Failed to send result data to API`,
            };
        }
    }
    async parseIndividualCompetition(payload) {
        const data = payload;
        console.log("data: ", data);
        return;
    }
};
exports.FencingService = FencingService;
exports.FencingService = FencingService = FencingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_service_1.ApiService, fencing_to_participant_mapper_1.FencingToParticipantMapper, fencing_to_result_mapper_1.FencingToResultMapper])
], FencingService);
//# sourceMappingURL=fencing.app.service.js.map