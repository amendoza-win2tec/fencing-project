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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantLookupUtil = void 0;
const common_1 = require("@nestjs/common");
const participant_service_1 = require("./participant.service");
let ParticipantLookupUtil = class ParticipantLookupUtil {
    constructor(participantService) {
        this.participantService = participantService;
    }
    quickLookup(identifier) {
        let result = this.participantService.getById(identifier);
        if (result.participant)
            return result.participant;
        result = this.participantService.getByCode(identifier);
        if (result.participant)
            return result.participant;
        const byName = this.participantService.getByName(identifier);
        if (byName.length > 0)
            return byName[0];
        return null;
    }
    findByPartialName(partialName) {
        const allParticipants = this.participantService.getAll();
        const searchTerm = partialName.toLowerCase();
        return allParticipants.filter(participant => participant.name.toLowerCase().includes(searchTerm) ||
            participant.surname.toLowerCase().includes(searchTerm) ||
            `${participant.name} ${participant.surname}`.toLowerCase().includes(searchTerm));
    }
    findByOrganisationAndName(organisationCode, nameSearch) {
        let participants = this.participantService.getByOrganisation(organisationCode);
        if (nameSearch) {
            const searchTerm = nameSearch.toLowerCase();
            participants = participants.filter(participant => participant.name.toLowerCase().includes(searchTerm) ||
                participant.surname.toLowerCase().includes(searchTerm));
        }
        return participants;
    }
    getByCodes(codes) {
        return codes
            .map(code => this.participantService.getByCode(code))
            .filter(result => result.participant !== null)
            .map(result => result.participant);
    }
    getByIds(ids) {
        return ids
            .map(id => this.participantService.getById(id))
            .filter(result => result.participant !== null)
            .map(result => result.participant);
    }
    advancedSearch(criteria) {
        const filters = {};
        if (criteria.name)
            filters.name = criteria.name;
        if (criteria.surname)
            filters.surname = criteria.surname;
        if (criteria.code)
            filters.code = criteria.code;
        if (criteria.organisation)
            filters.organisation = criteria.organisation;
        if (criteria.gender)
            filters.gender = criteria.gender;
        if (criteria.function)
            filters.function = criteria.function;
        let results = this.participantService.search(filters).participants;
        if (criteria.partialName) {
            const searchTerm = criteria.partialName.toLowerCase();
            results = results.filter(participant => participant.name.toLowerCase().includes(searchTerm) ||
                participant.surname.toLowerCase().includes(searchTerm));
        }
        return results;
    }
    getGroupedByOrganisation() {
        const allParticipants = this.participantService.getAll();
        const grouped = {};
        allParticipants.forEach(participant => {
            const orgCode = participant.organisation.code;
            if (!grouped[orgCode]) {
                grouped[orgCode] = [];
            }
            grouped[orgCode].push(participant);
        });
        return grouped;
    }
    getGroupedByGender() {
        const allParticipants = this.participantService.getAll();
        const grouped = {};
        allParticipants.forEach(participant => {
            const genderCode = participant.gender.code;
            if (!grouped[genderCode]) {
                grouped[genderCode] = [];
            }
            grouped[genderCode].push(participant);
        });
        return grouped;
    }
    findSimilar(participant) {
        const allParticipants = this.participantService.getAll();
        return allParticipants.filter(p => p.idParticipant !== participant.idParticipant && (p.name.toLowerCase() === participant.name.toLowerCase() ||
            p.surname.toLowerCase() === participant.surname.toLowerCase()));
    }
    getIncompleteParticipants() {
        const allParticipants = this.participantService.getAll();
        return allParticipants.filter(participant => !participant.name ||
            !participant.surname ||
            !participant.code ||
            !participant.organisation.code ||
            !participant.gender.code);
    }
    getByNamePattern(pattern) {
        const allParticipants = this.participantService.getAll();
        const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
        return allParticipants.filter(participant => regex.test(participant.name) ||
            regex.test(participant.surname) ||
            regex.test(`${participant.name} ${participant.surname}`));
    }
};
exports.ParticipantLookupUtil = ParticipantLookupUtil;
exports.ParticipantLookupUtil = ParticipantLookupUtil = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [participant_service_1.ParticipantService])
], ParticipantLookupUtil);
//# sourceMappingURL=participant-lookup.util.js.map