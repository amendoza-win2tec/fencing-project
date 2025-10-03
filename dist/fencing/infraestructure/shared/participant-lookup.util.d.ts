import { ParticipantService } from './participant.service';
import { Participant } from '../../domain/interfaces/participant.interfaces';
export declare class ParticipantLookupUtil {
    private readonly participantService;
    constructor(participantService: ParticipantService);
    quickLookup(identifier: string): Participant | null;
    findByPartialName(partialName: string): Participant[];
    findByOrganisationAndName(organisationCode: string, nameSearch?: string): Participant[];
    getByCodes(codes: string[]): Participant[];
    getByIds(ids: string[]): Participant[];
    advancedSearch(criteria: {
        name?: string;
        surname?: string;
        code?: string;
        organisation?: string;
        gender?: string;
        function?: string;
        partialName?: string;
    }): Participant[];
    getGroupedByOrganisation(): {
        [organisationCode: string]: Participant[];
    };
    getGroupedByGender(): {
        [genderCode: string]: Participant[];
    };
    findSimilar(participant: Participant): Participant[];
    getIncompleteParticipants(): Participant[];
    getByNamePattern(pattern: string): Participant[];
}
