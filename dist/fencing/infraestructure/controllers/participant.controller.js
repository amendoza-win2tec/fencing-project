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
var ParticipantController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantController = void 0;
const common_1 = require("@nestjs/common");
const participant_service_1 = require("../shared/participant.service");
let ParticipantController = ParticipantController_1 = class ParticipantController {
    constructor(participantService) {
        this.participantService = participantService;
        this.logger = new common_1.Logger(ParticipantController_1.name);
    }
    getAllParticipants() {
        this.logger.log('Getting all participants');
        return {
            participants: this.participantService.getAll(),
            total: this.participantService.getTotalCount()
        };
    }
    getParticipantById(id) {
        this.logger.log(`Getting participant by ID: ${id}`);
        const result = this.participantService.getById(id);
        return result;
    }
    getParticipantByCode(code) {
        this.logger.log(`Getting participant by code: ${code}`);
        const result = this.participantService.getByCode(code);
        return result;
    }
    getParticipantsByName(name) {
        this.logger.log(`Getting participants by name: ${name}`);
        return this.participantService.getByName(name);
    }
    getParticipantsBySurname(surname) {
        this.logger.log(`Getting participants by surname: ${surname}`);
        return this.participantService.getBySurname(surname);
    }
    getParticipantsByFullName(name, surname) {
        this.logger.log(`Getting participants by full name: ${name} ${surname}`);
        return this.participantService.getByFullName(name, surname);
    }
    getParticipantsByOrganisation(organisation) {
        this.logger.log(`Getting participants by organisation: ${organisation}`);
        return this.participantService.getByOrganisation(organisation);
    }
    getParticipantsByOrganisationWithStats(organisation) {
        this.logger.log(`Getting participants by organisation with stats: ${organisation}`);
        return this.participantService.getByOrganisationWithStats(organisation);
    }
    getParticipantsByGender(gender) {
        this.logger.log(`Getting participants by gender: ${gender}`);
        return this.participantService.getByGender(gender);
    }
    searchParticipants(filters) {
        this.logger.log(`Searching participants with filters:`, filters);
        return this.participantService.search(filters);
    }
    getOrganisationCodes() {
        this.logger.log('Getting all organisation codes');
        return this.participantService.getOrganisationCodes();
    }
    getGenderCodes() {
        this.logger.log('Getting all gender codes');
        return this.participantService.getGenderCodes();
    }
    getStatistics() {
        this.logger.log('Getting participant statistics');
        return this.participantService.getStatistics();
    }
};
exports.ParticipantController = ParticipantController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ParticipantController.prototype, "getAllParticipants", null);
__decorate([
    (0, common_1.Get)('id/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipantController.prototype, "getParticipantById", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipantController.prototype, "getParticipantByCode", null);
__decorate([
    (0, common_1.Get)('name/:name'),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipantController.prototype, "getParticipantsByName", null);
__decorate([
    (0, common_1.Get)('surname/:surname'),
    __param(0, (0, common_1.Param)('surname')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipantController.prototype, "getParticipantsBySurname", null);
__decorate([
    (0, common_1.Get)('fullname/:name/:surname'),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, common_1.Param)('surname')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ParticipantController.prototype, "getParticipantsByFullName", null);
__decorate([
    (0, common_1.Get)('organisation/:organisation'),
    __param(0, (0, common_1.Param)('organisation')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipantController.prototype, "getParticipantsByOrganisation", null);
__decorate([
    (0, common_1.Get)('organisation/:organisation/stats'),
    __param(0, (0, common_1.Param)('organisation')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipantController.prototype, "getParticipantsByOrganisationWithStats", null);
__decorate([
    (0, common_1.Get)('gender/:gender'),
    __param(0, (0, common_1.Param)('gender')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipantController.prototype, "getParticipantsByGender", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParticipantController.prototype, "searchParticipants", null);
__decorate([
    (0, common_1.Get)('organisations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ParticipantController.prototype, "getOrganisationCodes", null);
__decorate([
    (0, common_1.Get)('genders'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ParticipantController.prototype, "getGenderCodes", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ParticipantController.prototype, "getStatistics", null);
exports.ParticipantController = ParticipantController = ParticipantController_1 = __decorate([
    (0, common_1.Controller)('participants'),
    __metadata("design:paramtypes", [participant_service_1.ParticipantService])
], ParticipantController);
//# sourceMappingURL=participant.controller.js.map