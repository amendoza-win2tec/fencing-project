import { ParticipantService } from '../../infraestructure/shared/participant.service';
import { Participant } from '../../domain/interfaces/participant.interfaces';
import { ParticipantRequestStartListDto, CreateStartListDto } from 'src/fencing/domain/interfaces/fencing-participant.interfaces';
import { TireurInMatch } from 'src/fencing/domain/interfaces/fencing.interfaces';
export interface Tireur {
    ID: string;
    Nom: string;
    Prenom?: string;
    Code?: string;
}
export declare class FencingToParticipantMapper {
    private readonly participantService;
    constructor(participantService: ParticipantService);
    mapToParticipant(tireur: TireurInMatch, index: number, street: string): ParticipantRequestStartListDto | null;
    mapToParticipants(tireurs: TireurInMatch[], street?: string): ParticipantRequestStartListDto[];
    findParticipantByTireurId(tireurId: string): Participant | null;
    searchParticipantsByTireurName(name: string, surname?: string): Participant[];
    getParticipantCodeFromTireurId(tireurId: string): string | null;
    getAvailableTireurIds(): string[];
    getParticipantCodesFromDictionary(): string[];
    createStartListDto(tireurs: TireurInMatch[], metadata: {
        discipline: string;
        gender: string;
        sportEvent: string;
        category: string;
        phase: string;
        unit: string;
        subUnit?: string;
        phaseCode: string;
        unitCode: string;
    }): CreateStartListDto;
    createStartListDtoWithCustomType(tireurs: TireurInMatch[], competitorType: string, metadata: {
        discipline: string;
        gender: string;
        sportEvent: string;
        category: string;
        phase: string;
        unit: string;
        subUnit?: string;
        phaseCode: string;
        unitCode: string;
    }, hasBye?: boolean): CreateStartListDto;
}
