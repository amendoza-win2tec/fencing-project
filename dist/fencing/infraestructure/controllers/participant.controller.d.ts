import { ParticipantService } from '../shared/participant.service';
import { ParticipantSearchFilters } from '../../domain/interfaces/participant.interfaces';
export declare class ParticipantController {
    private readonly participantService;
    private readonly logger;
    constructor(participantService: ParticipantService);
    getAllParticipants(): {
        participants: import("../../domain/interfaces/participant.interfaces").Participant[];
        total: number;
    };
    getParticipantById(id: string): import("../../domain/interfaces/participant.interfaces").ParticipantLookupResult;
    getParticipantByCode(code: string): import("../../domain/interfaces/participant.interfaces").ParticipantLookupResult;
    getParticipantsByName(name: string): import("../../domain/interfaces/participant.interfaces").Participant[];
    getParticipantsBySurname(surname: string): import("../../domain/interfaces/participant.interfaces").Participant[];
    getParticipantsByFullName(name: string, surname: string): import("../../domain/interfaces/participant.interfaces").Participant[];
    getParticipantsByOrganisation(organisation: string): import("../../domain/interfaces/participant.interfaces").Participant[];
    getParticipantsByOrganisationWithStats(organisation: string): {
        participants: import("../../domain/interfaces/participant.interfaces").Participant[];
        total: number;
        genderBreakdown: {
            [key: string]: number;
        };
    };
    getParticipantsByGender(gender: string): import("../../domain/interfaces/participant.interfaces").Participant[];
    searchParticipants(filters: ParticipantSearchFilters): import("../../domain/interfaces/participant.interfaces").ParticipantSearchResult;
    getOrganisationCodes(): string[];
    getGenderCodes(): string[];
    getStatistics(): {
        total: number;
        organisations: {
            [key: string]: number;
        };
        genders: {
            [key: string]: number;
        };
        functions: {
            [key: string]: number;
        };
    };
}
