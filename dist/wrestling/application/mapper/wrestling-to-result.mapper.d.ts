import { ParticipantService } from '../../../fencing/infraestructure/shared/participant.service';
import { CreateResultDto } from '../../domain/interfaces/wrestling-results.interface';
import { WrestlerInMatch } from '../../domain/interfaces/wrestling.interfaces';
export interface Wrestler {
    ID: string;
    Nom: string;
    Prenom?: string;
    Code?: string;
}
export declare class WrestlingToResultMapper {
    private readonly participantService;
    constructor(participantService: ParticipantService);
    createResultDto(wrestlers: WrestlerInMatch[], metadata: any): CreateResultDto;
}
