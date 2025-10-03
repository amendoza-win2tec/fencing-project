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
exports.FencingToParticipantMapper = void 0;
const common_1 = require("@nestjs/common");
const participant_service_1 = require("../../infraestructure/shared/participant.service");
const participantDictionary = {
    '1': '10000817',
    '2': '10000815',
    '3': '10007949',
    '4': '10003628',
    '5': '10005257',
    '6': '10003630',
    '7': '10003631',
    '8': '10007931',
    '9': '10007950',
    '10': '10005262',
    '11': '10007947',
    '12': '10007944',
    '13': '10003537',
    '14': '10003538',
    '15': '10000818',
    '16': '10007948',
    '17': '10003629',
    '18': '10007945',
    '19': '10005259',
    '20': '10007946',
    '21': '10003536',
    '22': '10005256',
    '23': '10000816',
    '24': '10003535',
};
let FencingToParticipantMapper = class FencingToParticipantMapper {
    constructor(participantService) {
        this.participantService = participantService;
    }
    mapToParticipant(tireur, index, street) {
        const participantCode = participantDictionary[tireur.REF];
        if (participantCode) {
            const result = this.participantService.getByCode(participantCode);
            if (result.participant) {
                return {
                    participantId: result.participant.idParticipant,
                    name: result.participant.name,
                    surname: result.participant.surname,
                    delegation: result.participant.organisation.code,
                    startingOrder: index + 1,
                    startingSortOrder: index,
                    bib: "",
                    street: street,
                    decorator: [],
                };
            }
        }
        return null;
    }
    mapToParticipants(tireurs, street = '') {
        const streetDict = ["D", "G"];
        return tireurs
            .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2]))
            .filter((participant) => participant !== null);
    }
    findParticipantByTireurId(tireurId) {
        const result = this.participantService.getById(tireurId);
        return result.participant;
    }
    searchParticipantsByTireurName(name, surname) {
        if (surname) {
            return this.participantService.getByFullName(name, surname);
        }
        return this.participantService.getByName(name);
    }
    getParticipantCodeFromTireurId(tireurId) {
        return participantDictionary[tireurId] || null;
    }
    getAvailableTireurIds() {
        return Object.keys(participantDictionary);
    }
    getParticipantCodesFromDictionary() {
        return Object.values(participantDictionary);
    }
    createStartListDto(tireurs, metadata) {
        const streetDict = ["D", "G"];
        const participants = tireurs
            .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2]))
            .filter((participant) => participant !== null);
        return {
            competitorType: 'Individual',
            metadata: {
                discipline: metadata.discipline,
                gender: metadata.gender,
                sportEvent: metadata.sportEvent,
                category: metadata.category,
                phase: metadata.phase,
                unit: metadata.unit,
                subUnit: metadata.subUnit,
                phaseCode: metadata.phaseCode,
                unitCode: metadata.unitCode,
            },
            groups: [],
            participants: participants,
            hasBye: false
        };
    }
    createStartListDtoWithCustomType(tireurs, competitorType, metadata, hasBye = false) {
        const streetDict = ["D", "G"];
        const participants = tireurs
            .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2]))
            .filter((participant) => participant !== null);
        return {
            competitorType: competitorType,
            metadata: {
                discipline: metadata.discipline,
                gender: metadata.gender,
                sportEvent: metadata.sportEvent,
                category: metadata.category,
                phase: metadata.phase,
                unit: metadata.unit,
                subUnit: metadata.subUnit,
                phaseCode: metadata.phaseCode,
                unitCode: metadata.unitCode,
            },
            groups: [],
            participants: participants,
            hasBye: hasBye
        };
    }
};
exports.FencingToParticipantMapper = FencingToParticipantMapper;
exports.FencingToParticipantMapper = FencingToParticipantMapper = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [participant_service_1.ParticipantService])
], FencingToParticipantMapper);
//# sourceMappingURL=fencing-to-participant.mapper.js.map