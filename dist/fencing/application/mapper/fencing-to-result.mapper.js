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
exports.FencingToResultMapper = void 0;
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
const sportEventDictionary = {
    S: 'SABRE',
    E: 'EPEE',
    F: 'FOIL',
};
let FencingToResultMapper = class FencingToResultMapper {
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
                    startingOrder: (index + 1).toString(),
                    startingSortOrder: index,
                    bib: "",
                    street: tireur.Cote,
                    decorator: [],
                    rk: tireur.Statut === 'V' ? "1" : tireur.Statut === 'D' ? "2" : "",
                    rkPo: tireur.Statut === 'V' ? 0 : tireur.Statut === 'D' ? 1 : 99,
                    result: tireur.Score ?? "",
                    irm: "",
                    winner: tireur.Statut === 'V' ? true : tireur.Statut === 'D' ? false : false,
                    wlt: tireur.Statut === 'V' ? "W" : tireur.Statut === 'D' ? "L" : "",
                    qualified: "",
                    difference: "",
                    accumulatedResult: "",
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
    buildPeriodResult(tireurs) {
        const tireur1 = tireurs[0]?.Score;
        const tireur2 = tireurs[1]?.Score;
        if (tireur1 !== undefined && tireur2 !== undefined) {
            return `${tireur1} - ${tireur2}`;
        }
        return "";
    }
    createResultDto(tireurs, metadata) {
        const streetDict = ["D", "G"];
        return {
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
            periods: [
                {
                    result: this.buildPeriodResult(tireurs),
                    name: "R1",
                    order: 0,
                    periodId: "period_1",
                    participants: tireurs
                        .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2])),
                    groups: [],
                    decorator: [],
                    duration: "",
                    distance: "",
                    resHome: tireurs[0]?.Score ?? '',
                    resAway: tireurs[1]?.Score ?? '',
                    totalHome: tireurs[0]?.Score ?? '',
                    totalAway: tireurs[1]?.Score ?? '',
                }
            ],
            splits: [],
            globalResult: {
                result: this.buildPeriodResult(tireurs),
                groups: [],
                participants: tireurs
                    .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2])),
                decorator: [],
                current: "",
                currentPeriod: "1",
                last: "",
                duration: "",
            },
            decorator: [],
            hasStats: false,
            stats: {},
            officials: [],
        };
    }
    mapMqttToPouleMatchData(payload) {
        const sportEvent = sportEventDictionary[payload.DataDic.Weapon];
        let phaseType = "";
        if (payload.DataDic.Phase === "1") {
            phaseType = "POULE";
        }
        else if (payload.DataDic.Phase === "2") {
            phaseType = "A32";
        }
        else if (payload.DataDic.Phase === "3") {
            phaseType = "A16";
        }
        else if (payload.DataDic.Phase === "4") {
            phaseType = "A8";
        }
        else if (payload.DataDic.Phase === "5") {
            phaseType = "A4";
        }
        else if (payload.DataDic.Phase === "6") {
            phaseType = "A2";
        }
        else if (payload.DataDic.Phase === "7") {
            phaseType = "B2";
        }
        const poule = {
            ID: payload.DataDic.PoulTab,
            Piste: payload.DataDic.Piste,
            Date: payload.DataDic.Time,
            Heure: payload.DataDic.Stopwatch,
            Tireur: [
                {
                    REF: payload.DataDic.RightId,
                    NoDansLaPoule: "",
                    NbVictoires: "",
                    NbMatches: "",
                    TD: "",
                    TR: "",
                    RangPoule: "",
                },
                {
                    REF: payload.DataDic.LeftId,
                    NoDansLaPoule: "",
                    NbVictoires: "",
                    NbMatches: "",
                    TD: "",
                    TR: "",
                    RangPoule: ""
                }
            ],
            Match: [
                {
                    ID: payload.DataDic.Match,
                    Tireur: [
                        {
                            REF: payload.DataDic.RightId,
                            Score: payload.DataDic.Rscore,
                            Statut: payload.DataDic.Rstatus,
                            Cote: "D",
                        },
                        {
                            REF: payload.DataDic.LeftId,
                            Score: payload.DataDic.Lscore,
                            Statut: payload.DataDic.Lstatus,
                            Cote: "G",
                        }
                    ]
                }
            ]
        };
        return poule;
    }
};
exports.FencingToResultMapper = FencingToResultMapper;
exports.FencingToResultMapper = FencingToResultMapper = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [participant_service_1.ParticipantService])
], FencingToResultMapper);
//# sourceMappingURL=fencing-to-result.mapper.js.map