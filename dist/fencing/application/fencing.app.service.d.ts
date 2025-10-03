import { FencingAppServicePort } from './ports/fencing.app.service';
import { FencingCompetition, W2TECUnit, ApiResponse, MqttMatchData } from '../domain/interfaces/fencing.interfaces';
import { ApiService } from '../infraestructure/shared/api.service';
import { CreateStartListDto } from '../domain/interfaces/fencing-participant.interfaces';
import { FencingToParticipantMapper } from './mapper/fencing-to-participant.mapper';
import { FencingToResultMapper } from './mapper/fencing-to-result.mapper';
import { CreateResultDto } from '../domain/interfaces/fencing-results.interface';
export declare class FencingService implements FencingAppServicePort {
    private readonly apiService;
    private readonly fencingToParticipantMapper;
    private readonly fencingToResultMapper;
    private readonly logger;
    constructor(apiService: ApiService, fencingToParticipantMapper: FencingToParticipantMapper, fencingToResultMapper: FencingToResultMapper);
    processFencingFights(fencingFights: FencingCompetition): Promise<W2TECUnit[]>;
    sendRawPoulesToApi(fencingFights: FencingCompetition): Promise<ApiResponse>;
    sendPouleToApi(poule: any): Promise<ApiResponse>;
    sendStartListToApi(startList: CreateStartListDto): Promise<ApiResponse>;
    sendResultToApi(resultPayload: CreateResultDto): Promise<ApiResponse>;
    parseIndividualCompetition(payload: MqttMatchData): Promise<void>;
}
