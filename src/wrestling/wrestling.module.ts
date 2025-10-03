import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WrestlingService } from './application/wrestling.app.service';
import { WrestlingController } from './infraestructure/controllers/wrestling.controller';
import { ApiService } from '../fencing/infraestructure/shared/api.service';
import { ParticipantService } from '../fencing/infraestructure/shared/participant.service';
import { ParticipantLookupUtil } from '../fencing/infraestructure/shared/participant-lookup.util';
import { WrestlingToParticipantMapper } from './application/mapper/wrestling-to-participant.mapper';
import { WrestlingToResultMapper } from './application/mapper/wrestling-to-result.mapper';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [ConfigModule,
    BullModule.registerQueue({
      name: "wrestling-mim",
      defaultJobOptions: {
        attempts: 5,                                   // Retries on failure
        backoff: { type: 'exponential', delay: 1000 }, // 1s,2s,4s...
        removeOnComplete: 200,                         // Keep last 200 completed jobs
        removeOnFail: 200,                             // Keep last 200 failed jobs
      },
    }),
  ],
  controllers: [WrestlingController],
  providers: [
    WrestlingService, 
    ApiService, 
    ParticipantService, 
    ParticipantLookupUtil,
    WrestlingToParticipantMapper,
    WrestlingToResultMapper
  ],
  exports: [
    WrestlingService, 
    ApiService, 
    ParticipantService, 
    ParticipantLookupUtil,
    WrestlingToParticipantMapper,
    WrestlingToResultMapper
  ],
})
export class WrestlingModule {}
