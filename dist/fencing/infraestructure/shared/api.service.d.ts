import { ConfigService } from '@nestjs/config';
import { Poule } from '../../domain/interfaces/fencing.interfaces';
import { CreateStartListDto } from 'src/fencing/domain/interfaces/fencing-participant.interfaces';
import { CreateResultDto } from 'src/fencing/domain/interfaces/fencing-results.interface';
export interface ApiResponse {
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
}
export interface PoulesApiRequest {
    competitionId: string;
    poules: Poule[];
    metadata: {
        competitionName: string;
        date: string;
        weapon: string;
        gender: string;
    };
}
export declare class ApiService {
    private readonly configService;
    private readonly logger;
    private readonly apiBaseUrl;
    private readonly apiKey;
    private readonly mqttUser;
    private readonly mqttPassword;
    private readonly mqttHost;
    constructor(configService: ConfigService);
    sendPoulesData(request: PoulesApiRequest): Promise<ApiResponse>;
    sendPouleData(poule: Poule): Promise<ApiResponse>;
    sendStartListData(startList: CreateStartListDto): Promise<ApiResponse>;
    sendResultData(result: CreateResultDto): Promise<ApiResponse>;
    checkApiHealth(): Promise<boolean>;
}
