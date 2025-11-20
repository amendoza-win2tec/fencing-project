import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WrestlingService } from './application/wrestling.app.service';
import { WrestlingController } from './infraestructure/controllers/wrestling.controller';
import { ApiService } from '../fencing/infraestructure/shared/api.service';
import { ParticipantService } from '../fencing/infraestructure/shared/participant.service';
import { ParticipantLookupUtil } from '../fencing/infraestructure/shared/participant-lookup.util';
import { WrestlingToParticipantMapper } from './application/mapper/wrestling-to-participant.mapper';
import { WrestlingToResultMapper } from './application/mapper/wrestling-to-result.mapper';

@Module({
  imports: [ConfigModule],
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
