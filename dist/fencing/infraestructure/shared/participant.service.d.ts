import { Participant, ParticipantLookupResult, ParticipantSearchFilters, ParticipantSearchResult } from '../../domain/interfaces/participant.interfaces';
export declare class ParticipantService {
    private readonly logger;
    private readonly participants;
    private readonly byIdIndex;
    private readonly byCodeIndex;
    private readonly byNameIndex;
    private readonly bySurnameIndex;
    private readonly byOrganisationIndex;
    private readonly byGenderIndex;
    constructor();
    private loadParticipants;
    private buildIndexes;
    getById(id: string): ParticipantLookupResult;
    getByCode(code: string): ParticipantLookupResult;
    getByName(name: string): Participant[];
    getBySurname(surname: string): Participant[];
    getByFullName(name: string, surname: string): Participant[];
    getByOrganisation(organisationCode: string): Participant[];
    getByGender(genderCode: string): Participant[];
    search(filters: ParticipantSearchFilters): ParticipantSearchResult;
    getAll(): Participant[];
    getTotalCount(): number;
    getByOrganisationWithStats(organisationCode: string): {
        participants: Participant[];
        total: number;
        genderBreakdown: {
            [key: string]: number;
        };
    };
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
