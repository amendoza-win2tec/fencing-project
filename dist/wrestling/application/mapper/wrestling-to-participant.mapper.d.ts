import { ParticipantService } from '../../../fencing/infraestructure/shared/participant.service';
import { CreateStartListDto } from 'src/wrestling/domain/interfaces/wrestling-participant.interfaces';
import { WrestlerInMatch } from 'src/wrestling/domain/interfaces/wrestling.interfaces';
export interface Wrestler {
    ID: string;
    Nom: string;
    Prenom?: string;
    Code?: string;
}
export declare class WrestlingToParticipantMapper {
    private readonly participantService;
    constructor(participantService: ParticipantService);
    createStartListDto(wrestlers: WrestlerInMatch[], metadata: any): CreateStartListDto;
}
