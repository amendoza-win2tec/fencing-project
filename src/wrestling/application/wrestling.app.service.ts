import { Injectable, Logger } from '@nestjs/common';
import { mapToW2tecPhases, convertPouleToMatch, convertEliminationToMatch } from '../application/mapper/wrestling-to-unit.mapper';
import { WrestlingAppServicePort } from '../application/ports/wrestling.app.service';
import { WrestlingCompetition, W2TECUnit, WrestlerStatus, ApiResponse, PoulesApiRequest, WrestlingXmlData } from '../../wrestling/domain/interfaces/wrestling.interfaces';
import { ApiService } from '../../fencing/infraestructure/shared/api.service';
import { CreateStartListDto, ParticipantRequestStartListDto } from '../../wrestling/domain/interfaces/wrestling-participant.interfaces';
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
      
      // Create start list using XML StartList data and processed units metadata
      let startList: CreateStartListDto | null = null;
      
      // Look for units with StartList data
      for (const unit of units) {
        if (unit.StartList) {
          // Extract metadata from the first processed unit
          const firstUnit = processedUnits[0];
          if (firstUnit) {
            const startListMetadata = {
              discipline: firstUnit.metadata.discipline,
              gender: firstUnit.metadata.gender,
              sportEvent: firstUnit.metadata.sportEvent,
              category: firstUnit.metadata.category,
              phase: firstUnit.metadata.phase,
              unit: firstUnit.metadata.unit,
              phaseCode: firstUnit.metadata.phaseCode,
              unitCode: firstUnit.code
            };
            
            startList = await this.processXmlStartListToStartList(unit.StartList, startListMetadata);
            this.logger.log(`Created start list from XML with ${startList.participants.length} participants`);
            break; // Use the first unit with StartList data
          }
        }
      }
      
      // Fallback to WRE participants if no XML StartList found
      if (!startList) {
        const firstUnit = processedUnits[0];
        if (firstUnit) {
          const startListMetadata = {
            discipline: firstUnit.metadata.discipline,
            gender: firstUnit.metadata.gender,
            sportEvent: firstUnit.metadata.sportEvent,
            category: firstUnit.metadata.category,
            phase: firstUnit.metadata.phase,
            unit: firstUnit.metadata.unit,
            phaseCode: firstUnit.metadata.phaseCode,
            unitCode: firstUnit.code
          };
          
          startList = await this.processWreParticipantsToStartList(startListMetadata);
          this.logger.log(`Created start list from WRE participants with ${startList.participants.length} participants`);
        }
      }
      
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
        units: processedUnits,
        startList: startList
      };
    } catch (error) {
      this.logger.error('Error processing wrestling schedule:', error);
      throw error;
    }
  }

  /**
   * Process XML StartList data and create start list
   */
  async processXmlStartListToStartList(
    xmlStartList: any,
    metadata: {
      discipline: string;
      gender: string;
      sportEvent: string;
      category: string;
      phase: string;
      unit: string;
      subUnit?: string;
      phaseCode: string;
      unitCode: string;
    }
  ): Promise<CreateStartListDto> {
    try {
      this.logger.log('Processing XML StartList to start list...');
      
      if (!xmlStartList || !xmlStartList.Start) {
        this.logger.warn('No StartList data found in XML, using WRE participants as fallback');
        return await this.processWreParticipantsToStartList(metadata);
      }

      const participants: ParticipantRequestStartListDto[] = [];
      
      for (const start of xmlStartList.Start) {
        for (const competitor of start.Competitor) {
          const athlete = competitor.Composition[0].Athlete[0];
          const description = athlete.Description[0].$;
          
          participants.push({
            participantId: athlete.Code,
            name: description.GivenName,
            surname: description.FamilyName,
            delegation: description.Organisation,
            startingOrder: parseInt(start._StartOrder),
            startingSortOrder: parseInt(start._SortOrder),
            bib: athlete.Code,
            street: participants.length % 2 === 0 ? 'D' : 'G',
            decorator: [],
          });
        }
      }

      const startList: CreateStartListDto = {
        competitorType: 'Individual',
        metadata: {
          discipline: metadata.discipline,
          gender: metadata.gender,
          sportEvent: metadata.sportEvent,
          category: metadata.category,
          phase: metadata.phase,
          unit: metadata.unit,
          subUnit: metadata.subUnit,
          phaseCode: metadata.phaseCode,
          unitCode: metadata.unitCode,
        },
        groups: [],
        participants: participants,
        hasBye: false
      };
      
      this.logger.log(`Created start list with ${startList.participants.length} participants from XML`);
      return startList;
    } catch (error) {
      this.logger.error('Error processing XML StartList to start list:', error);
      // Fallback to WRE participants if XML processing fails
      return await this.processWreParticipantsToStartList(metadata);
    }
  }

  /**
   * Process WRE participants and create start list
   */
  async processWreParticipantsToStartList(metadata: {
    discipline: string;
    gender: string;
    sportEvent: string;
    category: string;
    phase: string;
    unit: string;
    subUnit?: string;
    phaseCode: string;
    unitCode: string;
  }): Promise<CreateStartListDto> {
    try {
      this.logger.log('Processing WRE participants to start list...');
      
      const startList = this.wrestlingToParticipantMapper.mapWreParticipantsToStartList(metadata);
      
      this.logger.log(`Created start list with ${startList.participants.length} participants`);
      return startList;
    } catch (error) {
      this.logger.error('Error processing WRE participants to start list:', error);
      throw error;
    }
  }

  /**
   * Process WRE participants filtered by gender and create start list
   */
  async processWreParticipantsByGenderToStartList(
    gender: 'M' | 'F',
    metadata: {
      discipline: string;
      gender: string;
      sportEvent: string;
      category: string;
      phase: string;
      unit: string;
      subUnit?: string;
      phaseCode: string;
      unitCode: string;
    }
  ): Promise<CreateStartListDto> {
    try {
      this.logger.log(`Processing WRE participants (${gender}) to start list...`);
      
      const startList = this.wrestlingToParticipantMapper.mapWreParticipantsByGenderToStartList(gender, metadata);
      
      this.logger.log(`Created start list with ${startList.participants.length} participants for gender ${gender}`);
      return startList;
    } catch (error) {
      this.logger.error('Error processing WRE participants by gender to start list:', error);
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
