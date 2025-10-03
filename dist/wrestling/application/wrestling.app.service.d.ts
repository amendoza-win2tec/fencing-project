import { WrestlingAppServicePort } from '../application/ports/wrestling.app.service';
import { WrestlingCompetition, W2TECUnit, ApiResponse, WrestlingXmlData } from '../../wrestling/domain/interfaces/wrestling.interfaces';
import { ApiService } from '../../fencing/infraestructure/shared/api.service';
import { WrestlingToParticipantMapper } from '../../wrestling/application/mapper/wrestling-to-participant.mapper';
import { WrestlingToResultMapper } from '../../wrestling/application/mapper/wrestling-to-result.mapper';
export declare class WrestlingService implements WrestlingAppServicePort {
    private readonly apiService;
    private readonly wrestlingToParticipantMapper;
    private readonly wrestlingToResultMapper;
    private readonly logger;
    constructor(apiService: ApiService, wrestlingToParticipantMapper: WrestlingToParticipantMapper, wrestlingToResultMapper: WrestlingToResultMapper);
    processWrestlingFights(wrestlingFights: WrestlingXmlData): Promise<W2TECUnit[]>;
    processWrestlingSchedule(xmlData: WrestlingXmlData): Promise<any>;
    private processStartList;
    sendRawPoulesToApi(wrestlingFights: WrestlingCompetition): Promise<ApiResponse>;
    private convertRSCCode;
}
