import { Injectable, Logger } from '@nestjs/common';
import { mapToW2tecPhases, convertPouleToMatch, convertEliminationToMatch } from '../application/mapper/wrestling-to-unit.mapper';
import { WrestlingAppServicePort } from '../application/ports/wrestling.app.service';
import { WrestlingCompetition, W2TECUnit, WrestlerStatus, ApiResponse, PoulesApiRequest, WrestlingXmlData } from '../../wrestling/domain/interfaces/wrestling.interfaces';
import { ApiService } from '../../fencing/infraestructure/shared/api.service';
import { CreateStartListDto } from '../../wrestling/domain/interfaces/wrestling-participant.interfaces';
import { WrestlingToParticipantMapper } from '../../wrestling/application/mapper/wrestling-to-participant.mapper';
import { WrestlingToResultMapper } from '../../wrestling/application/mapper/wrestling-to-result.mapper';
import { CreateResultDto } from '../../wrestling/domain/interfaces/wrestling-results.interface';

@Injectable()
export class WrestlingService implements WrestlingAppServicePort {
  private readonly logger = new Logger(WrestlingService.name);

  constructor(private readonly apiService: ApiService, private readonly wrestlingToParticipantMapper: WrestlingToParticipantMapper, private readonly wrestlingToResultMapper: WrestlingToResultMapper) {}

  async processWrestlingFights(wrestlingFights: WrestlingXmlData): Promise<W2TECUnit[]> {
    try {
      // Process the adapted data and convert to JSON
      const bouts = wrestlingFights.OdfBody.Competition.Unit;
      const allUnits: W2TECUnit[] = [];
      const allStartLists: CreateStartListDto[] = [];
      const allResults: CreateResultDto[] = [];
      // Process each pool
      bouts.forEach((bout, index) => {
          // Create wrestler status for this match
          const status = bout._ScheduleStatus;
          
          const matchName = bout.ItemName._Value;
          const unit = mapToW2tecPhases(
            bout._Code,
            matchName,
            bout._PhaseType,
            bout._UnitNum,
            status,
            bout._StartDate,
            bout._EndDate,
            bout._Order,
            bout._Venue,
            bout._Medal,
            bout._Location,
            bout._SessionCode
          );

          // const startList = this.wrestlingToParticipantMapper.createStartListDto(match.Tireur, {...unit.metadata, unitCode: unit.code });
          // const result = this.wrestlingToResultMapper.createResultDto(match.Tireur, {...unit.metadata, unitCode: unit.code });

          allUnits.push(unit);
          // allStartLists.push(startList);
          // allResults.push(result);
      });

      this.logger.log(`Processed ${allUnits.length} wrestling units`);
      return allUnits;
    } catch (error) {
      this.logger.error('Error processing wrestling fights:', error);
      throw error;
    }
  }

  async processWrestlingSchedule(xmlData: WrestlingXmlData): Promise<any> {
    try {
      this.logger.log('Processing wrestling schedule from XML...');
      
      const sessions = xmlData.OdfBody.Competition.Session;
      const units = xmlData.OdfBody.Competition.Unit;
      const processedUnits: W2TECUnit[] = [];
      
      for (const unit of units) {        
        const unitData = {
          code: unit._Code,
          name: unit.ItemName._Value,
          phaseType: unit._PhaseType,
          unitNum: unit._UnitNum,
          scheduleStatus: unit._ScheduleStatus,
          startDate: unit._StartDate,
          endDate: unit._EndDate,
          order: unit._Order,
          venue: unit._Venue,
          medal: unit._Medal,
          location: unit._Location,
          sessionCode: unit._SessionCode,
          // startList: unit.StartList ? this.processStartList(unit.StartList) : null
        };
        const unitMapped = mapToW2tecPhases(
          unitData.code,
          unitData.name,
          unitData.phaseType,
          unitData.unitNum,
          unitData.scheduleStatus,
          unitData.startDate,
          unitData.endDate,
          unitData.order,
          unitData.venue,
          unitData.medal,
          unitData.location,
          unitData.sessionCode
        );
        processedUnits.push(unitMapped);
      }
      
      this.logger.log(`Processed ${processedUnits.length} wrestling units`);
      
      for (const unit of processedUnits) {
        await this.apiService.sendPouleData(unit);
      }
      for (const unit of processedUnits) {
        await this.apiService.getResult(unit.code);
      }
      // await 
      // this.apiService.sendPouleData(processedUnits);
      return {
        sessions: sessions.length,
        totalUnits: processedUnits.length,
        units: processedUnits
      };
    } catch (error) {
      this.logger.error('Error processing wrestling schedule:', error);
      throw error;
    }
  }

  private processStartList(startList: any): any[] {
    const starts: any[] = [];
    
    for (const start of startList.Start) {
      const competitors: any[] = [];
      
      for (const competitor of start.Competitor) {
        const athlete = competitor.Composition[0].Athlete[0];
        const description = athlete.Description[0].$;
        
        competitors.push({
          code: competitor.Code,
          type: competitor.Type,
          organisation: competitor.Organisation,
          athlete: {
            code: athlete.Code,
            order: athlete.Order,
            givenName: description.GivenName,
            familyName: description.FamilyName,
            gender: description.Gender,
            organisation: description.Organisation,
            birthDate: description.BirthDate,
            ifId: description.IFId
          }
        });
      }
      
      starts.push({
        startOrder: start.StartOrder,
        sortOrder: start.SortOrder,
        competitors: competitors
      });
    }
    
    return starts;
  }

  async sendRawPoulesToApi(wrestlingFights: WrestlingCompetition): Promise<ApiResponse> {
    try {
      this.logger.log('Sending raw poules to API...');
      
      // For now, return a success response
      // This method can be implemented later when the API structure is defined
      return {
        success: true,
        message: 'Raw poules data processed successfully',
        data: {
          sportKey: wrestlingFights.Arme,
          gender: wrestlingFights.Sexe,
          processed: true
        }
      };
    } catch (error) {
      this.logger.error('Error sending raw poules to API:', error);
      throw error;
    }
  }

  private convertRSCCode(code: string): Record<string, string> {
    const discipline = code.slice(0, 3);
    const gender = code.slice(3, 4);
    const sportEvent = code.slice(4, 22).replace(/-/g, '');
    const phase = code.slice(22, 26).replace(/-/g, '');
    const rawUnit = Number(code.slice(26, 34).replace(/-/g, ''))/100;
    const unit = rawUnit.toString().padStart(4, '0');
    const rscCode = `${discipline}${gender}${sportEvent.padEnd(18, '-')}${phase.padEnd(4, '-')}${unit.padEnd(8, '-')}`;
    const phaseCode = `${discipline}${gender}${sportEvent.padEnd(18, '-')}${phase.padEnd(4, '-')}--------`;
    return {
      discipline,
      gender,
      sportEvent,
      phase,
      phaseCode,
      unit,
      rscCode
    }
  }
}
