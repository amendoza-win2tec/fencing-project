import { RawBodyRequest } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Request } from 'express';
import { WrestlingService } from '../../application/wrestling.app.service';
import { WrestlingProcessResponse, ApiResponse } from '../../domain/interfaces/wrestling.interfaces';
export declare class WrestlingController {
    private readonly wrestlingMiMQueue;
    private readonly wrestlingService;
    private readonly logger;
    constructor(wrestlingMiMQueue: Queue, wrestlingService: WrestlingService);
    processWrestlingXml(req: RawBodyRequest<Request>): Promise<WrestlingProcessResponse>;
    processWrestlingFile(body: {
        xmlFile: string;
    }): Promise<{
        success: boolean;
        data: Promise<import("../../domain/interfaces/wrestling.interfaces").W2TECUnit[]>;
        message: string;
    }>;
    sendRawPoulesToApi(req: RawBodyRequest<Request>): Promise<ApiResponse>;
}
