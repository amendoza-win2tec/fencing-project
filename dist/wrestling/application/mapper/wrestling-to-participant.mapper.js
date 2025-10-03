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
exports.WrestlingToParticipantMapper = void 0;
const common_1 = require("@nestjs/common");
const participant_service_1 = require("../../../fencing/infraestructure/shared/participant.service");
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
    '16': '10000819',
    '17': '10000820',
    '18': '10000821',
    '19': '10000822',
    '20': '10000823',
    '21': '10000824',
    '22': '10000825',
    '23': '10000826',
    '24': '10000827',
    '25': '10000828',
    '26': '10000829',
    '27': '10000830',
    '28': '10000831',
    '29': '10000832',
    '30': '10000833',
    '31': '10000834',
    '32': '10000835',
    '33': '10000836',
    '34': '10000837',
    '35': '10000838',
    '36': '10000839',
    '37': '10000840',
    '38': '10000841',
    '39': '10000842',
    '40': '10000843',
    '41': '10000844',
    '42': '10000845',
    '43': '10000846',
    '44': '10000847',
    '45': '10000848',
    '46': '10000849',
    '47': '10000850',
    '48': '10000851',
    '49': '10000852',
    '50': '10000853',
    '51': '10000854',
    '52': '10000855',
    '53': '10000856',
    '54': '10000857',
    '55': '10000858',
    '56': '10000859',
    '57': '10000860',
    '58': '10000861',
    '59': '10000862',
    '60': '10000863',
    '61': '10000864',
    '62': '10000865',
    '63': '10000866',
    '64': '10000867',
    '65': '10000868',
    '66': '10000869',
    '67': '10000870',
    '68': '10000871',
    '69': '10000872',
    '70': '10000873',
    '71': '10000874',
    '72': '10000875',
    '73': '10000876',
    '74': '10000877',
    '75': '10000878',
    '76': '10000879',
    '77': '10000880',
    '78': '10000881',
    '79': '10000882',
    '80': '10000883',
    '81': '10000884',
    '82': '10000885',
    '83': '10000886',
    '84': '10000887',
    '85': '10000888',
    '86': '10000889',
    '87': '10000890',
    '88': '10000891',
    '89': '10000892',
    '90': '10000893',
    '91': '10000894',
    '92': '10000895',
    '93': '10000896',
    '94': '10000897',
    '95': '10000898',
    '96': '10000899',
    '97': '10000900',
    '98': '10000901',
    '99': '10000902',
    '100': '10000903',
};
let WrestlingToParticipantMapper = class WrestlingToParticipantMapper {
    constructor(participantService) {
        this.participantService = participantService;
    }
    createStartListDto(wrestlers, metadata) {
        const participants = [];
        const groups = [];
        wrestlers.forEach((wrestler, index) => {
            const participantResult = this.participantService.getById(wrestler.REF);
            if (participantResult.participant) {
                const participant = participantResult.participant;
                const participantDto = {
                    participantId: participant.idParticipant,
                    name: participant.name,
                    surname: participant.surname,
                    delegation: participant.organisation.code,
                    startingOrder: index + 1,
                    startingSortOrder: index + 1,
                    bib: wrestler.REF,
                    street: '',
                    decorator: []
                };
                participants.push(participantDto);
            }
        });
        return {
            metadata: {
                discipline: 'WRESTLING',
                gender: metadata.gender || 'M',
                sportEvent: metadata.sportEvent || 'WRESTLING',
                category: metadata.category || '',
                phase: metadata.phase || 'POOL',
                unit: metadata.unit || 'MATCH',
                subUnit: metadata.subUnit,
                phaseCode: metadata.phaseCode || 'POOL',
                unitCode: metadata.unitCode || 'MATCH'
            },
            participants,
            groups
        };
    }
};
exports.WrestlingToParticipantMapper = WrestlingToParticipantMapper;
exports.WrestlingToParticipantMapper = WrestlingToParticipantMapper = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [participant_service_1.ParticipantService])
], WrestlingToParticipantMapper);
//# sourceMappingURL=wrestling-to-participant.mapper.js.map