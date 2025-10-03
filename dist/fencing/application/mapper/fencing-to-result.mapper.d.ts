import { ParticipantService } from '../../infraestructure/shared/participant.service';
import { Participant } from '../../domain/interfaces/participant.interfaces';
import { CreateResultDto, ParticipantRequestResultDto } from '../../domain/interfaces/fencing-results.interface';
import { Poule, TireurInMatch } from '../../domain/interfaces/fencing.interfaces';
import { MqttFencingData } from '../../domain/interfaces/fencing.interfaces';
export interface Tireur {
    ID: string;
    Nom: string;
    Prenom?: string;
    Code?: string;
}
export declare class FencingToResultMapper {
    private readonly participantService;
    constructor(participantService: ParticipantService);
    mapToParticipant(tireur: TireurInMatch, index: number, street: string): ParticipantRequestResultDto | null;
    mapToParticipants(tireurs: TireurInMatch[], street?: string): ParticipantRequestResultDto[];
    findParticipantByTireurId(tireurId: string): Participant | null;
    searchParticipantsByTireurName(name: string, surname?: string): Participant[];
    getParticipantCodeFromTireurId(tireurId: string): string | null;
    getAvailableTireurIds(): string[];
    getParticipantCodesFromDictionary(): string[];
    buildPeriodResult(tireurs: TireurInMatch[]): string;
    createResultDto(tireurs: TireurInMatch[], metadata: {
        discipline: string;
        gender: string;
        sportEvent: string;
        category: string;
        phase: string;
        unit: string;
        subUnit?: string;
        phaseCode: string;
        unitCode: string;
    }): CreateResultDto;
    mapMqttToPouleMatchData(payload: MqttFencingData): Poule;
}
