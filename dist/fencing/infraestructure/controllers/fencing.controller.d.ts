import { RawBodyRequest } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Request } from 'express';
import { FencingService } from '../../application/fencing.app.service';
import { FencingProcessResponse, ApiResponse, MqttFencingData, MqttMatchData } from '../../domain/interfaces/fencing.interfaces';
export declare class FencingController {
    private readonly fenMiMQueue;
    private readonly fencingService;
    private readonly logger;
    constructor(fenMiMQueue: Queue, fencingService: FencingService);
    processFencingXml(req: RawBodyRequest<Request>): Promise<FencingProcessResponse>;
    processFencingFile(body: {
        xmlFile: string;
    }): Promise<{
        success: boolean;
        data: Promise<import("../../domain/interfaces/fencing.interfaces").W2TECUnit[]>;
        message: string;
    }>;
    sendRawPoulesToApi(req: RawBodyRequest<Request>): Promise<ApiResponse>;
    testMqttData(body: MqttFencingData): Promise<{
        success: boolean;
        message: string;
        data?: MqttMatchData;
    }>;
    handleJudData(payload: MqttFencingData): Promise<void>;
    private transformMqttData;
}
