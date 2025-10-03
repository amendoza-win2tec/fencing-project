import { Injectable, Logger } from '@nestjs/common';
import { mapToW2tecPhases, convertPouleToMatch, convertEliminationToMatch } from './mapper/fencing-to-unit.mapper';
import { FencingAppServicePort } from './ports/fencing.app.service';
import { FencingCompetition, W2TECUnit, TireurStatus, ApiResponse, PoulesApiRequest, MqttFencingData, MqttMatchData } from '../domain/interfaces/fencing.interfaces';
import { ApiService } from '../infraestructure/shared/api.service';
import { CreateStartListDto } from '../domain/interfaces/fencing-participant.interfaces';
import { FencingToParticipantMapper } from './mapper/fencing-to-participant.mapper';
import { FencingToResultMapper } from './mapper/fencing-to-result.mapper';
import { CreateResultDto } from '../domain/interfaces/fencing-results.interface';

@Injectable()
export class FencingService implements FencingAppServicePort {
  private readonly logger = new Logger(FencingService.name);

  constructor(private readonly apiService: ApiService, private readonly fencingToParticipantMapper: FencingToParticipantMapper, private readonly fencingToResultMapper: FencingToResultMapper) {}

  async processFencingFights(fencingFights: FencingCompetition): Promise<W2TECUnit[]> {
    try {
      // Process the adapted data and convert to JSON
      const rawPoules = fencingFights.Phases.TourDePoules;
      const rawEliminations = fencingFights.Phases?.PhaseDeTableaux;
      const sportEvent = fencingFights.Arme;
      const gender = fencingFights.Sexe;
      const allUnits: W2TECUnit[] = [];
      const allStartLists: CreateStartListDto[] = [];
      const allResults: CreateResultDto[] = [];
      
      // Process each pool
      rawPoules.Poule.forEach((poule, index) => {
        const convertedMatches = convertPouleToMatch(poule, sportEvent);
        
        convertedMatches.forEach((match, matchIndex) => {
          // Create tireur status for this match
          const tireurStatus: TireurStatus[] = match.Tireur.map(tireur => ({
            ref: tireur.REF,
            score: tireur.Score ?? '0', // Default score
            status: tireur.Statut ?? '' as const
          }));
          
          const matchName = `Pool ${poule.ID} - Bout ${match.ID}`;
          const unit = mapToW2tecPhases(
            match,
            matchName,
            `${matchIndex}`,
            tireurStatus,
            `Bout ${match.ID}`,
            gender
          );

          const startList = this.fencingToParticipantMapper.createStartListDto(match.Tireur, {...unit.metadata, unitCode: unit.code });
          const result = this.fencingToResultMapper.createResultDto(match.Tireur, {...unit.metadata, unitCode: unit.code });
          allUnits.push(unit);
          allResults.push(result);
          allStartLists.push(startList);
        });
      });

      const rawEliminationToArray = Array.isArray(rawEliminations?.SuiteDeTableaux) ? rawEliminations?.SuiteDeTableaux : [rawEliminations?.SuiteDeTableaux];

      // Process elimination phases
      rawEliminationToArray.forEach((elimination, eliminationIndex) => {
        if (!elimination) return;
        const convertedMatches = convertEliminationToMatch(elimination, sportEvent, gender);
        convertedMatches.forEach((match, matchIndex) => {
          // Create tireur status for this elimination match
          const tireurStatus: TireurStatus[] = match.Tireur.map(tireur => ({
            ref: tireur.REF,
            score: tireur.Score || '0',
            status: tireur.Statut || '' as const
          }));
          
          const matchName = `${match.phase} - Bout ${match.ID}`;
          const unit = mapToW2tecPhases(
            match,
            matchName,
            `${match.ID}`,
            tireurStatus,
            `Bout ${match.ID}`,
            gender
          );

          const startList = this.fencingToParticipantMapper.createStartListDto(match.Tireur, {...unit.metadata, unitCode: unit.code });
          const result = this.fencingToResultMapper.createResultDto(match.Tireur, {...unit.metadata, unitCode: unit.code });
          
          allUnits.push(unit);
          allResults.push(result);
          allStartLists.push(startList);
        });
      });

      for(const unit of allUnits) {
        await this.sendPouleToApi(unit);
      }
      for(const startList of allStartLists) {
        await this.sendStartListToApi(startList);
      }
      for(const result of allResults) {
        await this.sendResultToApi(result);
      }
      for(const unit of allUnits) {
        await this.sendPouleToApi(unit);
      }
      return allUnits;
    } catch (error) {
      console.error('Error processing fencing fights:', error);
      throw new Error(
        `Failed to process fencing fights: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Send raw Poules data to external API
   */
  async sendRawPoulesToApi(fencingFights: FencingCompetition): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending raw poules data for competition: ${fencingFights.Championnat}`);
      
      const rawPoules = fencingFights.Phases.TourDePoules;
      const competitionId = `${fencingFights.Championnat}-${fencingFights.Annee}-${fencingFights.Arme}`;
      
      const apiRequest: PoulesApiRequest = {
        competitionId,
        poules: rawPoules.Poule,
        metadata: {
          competitionName: fencingFights.Championnat,
          date: fencingFights.Date,
          weapon: fencingFights.Arme,
          gender: fencingFights.Sexe,
        },
      };

      const result = await this.apiService.sendPoulesData(apiRequest);
      
      if (result.success) {
        this.logger.log(`Successfully sent ${rawPoules.Poule.length} poules to API`);
      } else {
        this.logger.error(`Failed to send poules to API: ${result.message}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error sending raw poules to API: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send raw poules data to API',
      };
    }
  }

  /**
   * Send individual Poule data to API
   */
  async sendPouleToApi(poule: any): Promise<ApiResponse> {
    try {
      const result = await this.apiService.sendPouleData(poule);
      
      if (result.success) {
        this.logger.log(`Successfully sent poule ${poule.ID} to API`);
      } else {
        this.logger.error(`Failed to send poule ${poule.ID} to API: ${result.message}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error sending poule ${poule.ID} to API: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: `Failed to send poule ${poule.ID} data to API`,
      };
    }
  }

  async sendStartListToApi(startList: CreateStartListDto): Promise<ApiResponse> {
    try {
      const result = await this.apiService.sendStartListData(startList);
      if (result.success) {
        this.logger.log(`Successfully sent start list to API`);
      } else {
        this.logger.error(`Failed to send start list to API: ${result.message}`);
      }
      return result;
    }
    catch (error) {
      this.logger.error(`Error sending start list to API: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: `Failed to send start list data to API`,
      };
    }
  }

  async sendResultToApi(resultPayload: CreateResultDto): Promise<ApiResponse> {
    try {
      const result = await this.apiService.sendResultData(resultPayload);
      if (result.success) {
        this.logger.log(`Successfully sent result to API`);
      } else {
        this.logger.error(`Failed to send result to API: ${result.message}`);
      }
      return result;
    } catch (error) {
      this.logger.error(`Error sending result to API: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: `Failed to send result data to API`,
      };
    }
  }

    /**
   * Parse individual competition
   * @param payload - The payload to parse
   */
    public async parseIndividualCompetition(payload: MqttMatchData): Promise<void> {
      const data = payload;
      // const sportKey = payload.;
  
      // const campos = payload.Campos;
  
      // console.log("sportKey: ", sportKey);
      // console.log("campos: ", campos);
      // console.log("data: ", data);

      console.log("data: ", data);
      // campos[0] == "clk" || campos[0] == "brk" || 
      // if(campos.length == 1 && (campos[0] == "ij0" || campos[0] == "brk" || campos[0] == "clk")) {
      //   return;
      // }
      return;
    }
}

