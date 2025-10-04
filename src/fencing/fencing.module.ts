import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FencingService } from './application/fencing.app.service';
import { FencingController } from './infraestructure/controllers/fencing.controller';
import { ParticipantController } from './infraestructure/controllers/participant.controller';
import { ApiService } from './infraestructure/shared/api.service';
import { ParticipantService } from './infraestructure/shared/participant.service';
import { ParticipantLookupUtil } from './infraestructure/shared/participant-lookup.util';
import { GroupService } from './infraestructure/shared/group.service';
import { FencingToParticipantMapper } from './application/mapper/fencing-to-participant.mapper';
import { FencingToResultMapper } from './application/mapper/fencing-to-result.mapper';
import { FencingTeamToResultMapper } from './application/mapper/fencing-team-to-result.mapper';
import { FencingTeamToParticipantMapper } from './application/mapper/fencing-team-to-participant.mapper';
import { FencingTeamToUnitMapper } from './application/mapper/fencing-team-to-unit.mapper';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [ConfigModule,
    BullModule.registerQueue({
      name: "fen-mim",
      defaultJobOptions: {
        attempts: 5,                                   // Retries on failure
        backoff: { type: 'exponential', delay: 1000 }, // 1s,2s,4s...
        removeOnComplete: 200,                         // Keep last 200 completed jobs
        removeOnFail: 200,                             // Keep last 200 failed jobs
      },
    }),
  ],
  controllers: [FencingController, ParticipantController],
  providers: [
    FencingService, 
    ApiService, 
    ParticipantService, 
    ParticipantLookupUtil,
    GroupService,
    FencingToParticipantMapper,
    FencingToResultMapper,
    FencingTeamToResultMapper,
    FencingTeamToParticipantMapper,
    FencingTeamToUnitMapper
  ],
  exports: [
    FencingService, 
    ApiService, 
    ParticipantService, 
    ParticipantLookupUtil,
    GroupService,
    FencingToParticipantMapper,
    FencingToResultMapper,
    FencingTeamToResultMapper,
    FencingTeamToParticipantMapper,
    FencingTeamToUnitMapper
  ],
})
export class FencingModule {}

