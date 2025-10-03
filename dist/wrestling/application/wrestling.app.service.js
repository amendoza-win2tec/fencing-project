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
var WrestlingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrestlingService = void 0;
const common_1 = require("@nestjs/common");
const wrestling_to_unit_mapper_1 = require("../application/mapper/wrestling-to-unit.mapper");
const api_service_1 = require("../../fencing/infraestructure/shared/api.service");
const wrestling_to_participant_mapper_1 = require("../../wrestling/application/mapper/wrestling-to-participant.mapper");
const wrestling_to_result_mapper_1 = require("../../wrestling/application/mapper/wrestling-to-result.mapper");
let WrestlingService = WrestlingService_1 = class WrestlingService {
    constructor(apiService, wrestlingToParticipantMapper, wrestlingToResultMapper) {
        this.apiService = apiService;
        this.wrestlingToParticipantMapper = wrestlingToParticipantMapper;
        this.wrestlingToResultMapper = wrestlingToResultMapper;
        this.logger = new common_1.Logger(WrestlingService_1.name);
    }
    async processWrestlingFights(wrestlingFights) {
        try {
            const bouts = wrestlingFights.OdfBody.Competition.Unit;
            const allUnits = [];
            const allStartLists = [];
            const allResults = [];
            bouts.forEach((bout, index) => {
                const status = bout._ScheduleStatus;
                const matchName = bout.ItemName._Value;
                const unit = (0, wrestling_to_unit_mapper_1.mapToW2tecPhases)(bout._Code, matchName, bout._PhaseType, bout._UnitNum, status, bout._StartDate, bout._EndDate, bout._Order, bout._Venue, bout._Medal, bout._Location, bout._SessionCode);
                allUnits.push(unit);
            });
            this.logger.log(`Processed ${allUnits.length} wrestling units`);
            return allUnits;
        }
        catch (error) {
            this.logger.error('Error processing wrestling fights:', error);
            throw error;
        }
    }
    async processWrestlingSchedule(xmlData) {
        try {
            this.logger.log('Processing wrestling schedule from XML...');
            const sessions = xmlData.OdfBody.Competition.Session;
            const units = xmlData.OdfBody.Competition.Unit;
            const processedUnits = [];
            for (const unit of units) {
                const unitData = {
                    code: unit._Code,
                    name: unit.ItemName._Value,
                    phaseType: unit._PhaseType,
                    unitNum: unit._UnitNum,
                    scheduleStatus: unit._ScheduleStatus,
                    startDate: unit._StartDate,
                    endDate: unit._EndDate,
                    order: unit._Order,
                    venue: unit._Venue,
                    medal: unit._Medal,
                    location: unit._Location,
                    sessionCode: unit._SessionCode,
                };
                const unitMapped = (0, wrestling_to_unit_mapper_1.mapToW2tecPhases)(unitData.code, unitData.name, unitData.phaseType, unitData.unitNum, unitData.scheduleStatus, unitData.startDate, unitData.endDate, unitData.order, unitData.venue, unitData.medal, unitData.location, unitData.sessionCode);
                processedUnits.push(unitMapped);
            }
            this.logger.log(`Processed ${processedUnits.length} wrestling units`);
            for (const unit of processedUnits) {
                await this.apiService.sendPouleData(unit);
            }
            for (const unit of processedUnits) {
                await this.apiService.getResult(unit.code);
            }
            return {
                sessions: sessions.length,
                totalUnits: processedUnits.length,
                units: processedUnits
            };
        }
        catch (error) {
            this.logger.error('Error processing wrestling schedule:', error);
            throw error;
        }
    }
    processStartList(startList) {
        const starts = [];
        for (const start of startList.Start) {
            const competitors = [];
            for (const competitor of start.Competitor) {
                const athlete = competitor.Composition[0].Athlete[0];
                const description = athlete.Description[0].$;
                competitors.push({
                    code: competitor.Code,
                    type: competitor.Type,
                    organisation: competitor.Organisation,
                    athlete: {
                        code: athlete.Code,
                        order: athlete.Order,
                        givenName: description.GivenName,
                        familyName: description.FamilyName,
                        gender: description.Gender,
                        organisation: description.Organisation,
                        birthDate: description.BirthDate,
                        ifId: description.IFId
                    }
                });
            }
            starts.push({
                startOrder: start.StartOrder,
                sortOrder: start.SortOrder,
                competitors: competitors
            });
        }
        return starts;
    }
    async sendRawPoulesToApi(wrestlingFights) {
        try {
            this.logger.log('Sending raw poules to API...');
            return {
                success: true,
                message: 'Raw poules data processed successfully',
                data: {
                    sportKey: wrestlingFights.Arme,
                    gender: wrestlingFights.Sexe,
                    processed: true
                }
            };
        }
        catch (error) {
            this.logger.error('Error sending raw poules to API:', error);
            throw error;
        }
    }
    convertRSCCode(code) {
        const discipline = code.slice(0, 3);
        const gender = code.slice(3, 4);
        const sportEvent = code.slice(4, 22).replace(/-/g, '');
        const phase = code.slice(22, 26).replace(/-/g, '');
        const rawUnit = Number(code.slice(26, 34).replace(/-/g, '')) / 100;
        const unit = rawUnit.toString().padStart(4, '0');
        const rscCode = `${discipline}${gender}${sportEvent.padEnd(18, '-')}${phase.padEnd(4, '-')}${unit.padEnd(8, '-')}`;
        const phaseCode = `${discipline}${gender}${sportEvent.padEnd(18, '-')}${phase.padEnd(4, '-')}--------`;
        return {
            discipline,
            gender,
            sportEvent,
            phase,
            phaseCode,
            unit,
            rscCode
        };
    }
};
exports.WrestlingService = WrestlingService;
exports.WrestlingService = WrestlingService = WrestlingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_service_1.ApiService, wrestling_to_participant_mapper_1.WrestlingToParticipantMapper, wrestling_to_result_mapper_1.WrestlingToResultMapper])
], WrestlingService);
//# sourceMappingURL=wrestling.app.service.js.map