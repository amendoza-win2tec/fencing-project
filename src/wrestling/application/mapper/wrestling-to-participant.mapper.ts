import { Injectable } from '@nestjs/common';
import { ParticipantRequestStartListDto, CreateStartListDto } from 'src/wrestling/domain/interfaces/wrestling-participant.interfaces';
import { WrestlerInMatch } from 'src/wrestling/domain/interfaces/wrestling.interfaces';
import { ParticipantService } from 'src/fencing/infraestructure/shared/participant.service';
import * as fs from 'fs';
import * as path from 'path';

// Type aliases for compatibility
type TireurInMatch = WrestlerInMatch;
type Participant = any;

// Mock participant dictionary - this should be replaced with actual data source
const participantDictionary: Record<string, string> = {};
@Injectable()
export class WrestlingToParticipantMapper {
  constructor(private readonly participantService: ParticipantService) {}

  
  /**
   * Map tireur to participant using the participant service
   */
  mapToParticipant(tireur: WrestlerInMatch, index: number, street: string): ParticipantRequestStartListDto | null {
    // Primero intentar obtener el código del diccionario usando el ID del tireur
    const participantCode = participantDictionary[tireur.REF];
    
    // Si encontramos el código en el diccionario, buscar por código
    if (participantCode) {
      const result = this.participantService.getByCode(participantCode);
      if (result.participant) {
        return {
          participantId: result.participant.idParticipant,
          name: result.participant.name,
          surname: result.participant.surname,
          delegation: result.participant.organisation.code,
          startingOrder: index + 1,
          startingSortOrder: index,
          bib: "",
          street: street,
          decorator: [],
        };
      }
    }
    return null;
  }

  /**
   * Map multiple tireurs to participants
   */
  mapToParticipants(tireurs: TireurInMatch[], street: string = ''): ParticipantRequestStartListDto[] {
    const streetDict = ["D", "G"]
    return tireurs
      .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2]))
      .filter((participant): participant is ParticipantRequestStartListDto => participant !== null);
  }

  /**
   * Find participant by tireur ID
   */
  findParticipantByTireurId(tireurId: string): Participant | null {
    const result = this.participantService.getById(tireurId);
    return result.participant;
  }

  /**
   * Search participants by tireur name
   */
  searchParticipantsByTireurName(name: string, surname?: string): Participant[] {
    if (surname) {
      return this.participantService.getByFullName(name, surname);
    }
    return this.participantService.getByName(name);
  }

  /**
   * Get participant code from tireur ID using the dictionary
   */
  getParticipantCodeFromTireurId(tireurId: string): string | null {
    return participantDictionary[tireurId] || null;
  }

  /**
   * Get all available tireur IDs from the dictionary
   */
  getAvailableTireurIds(): string[] {
    return Object.keys(participantDictionary);
  }

  /**
   * Get all participant codes from the dictionary
   */
  getParticipantCodesFromDictionary(): string[] {
    return Object.values(participantDictionary);
  }

  /**
   * Create CreateStartListDto from tireurs with default values
   */
  createStartListDto(
    tireurs: TireurInMatch[], 
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
  ): CreateStartListDto {
    const streetDict = ["D", "G"];
    const participants = tireurs
      .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2]))
      .filter((participant): participant is ParticipantRequestStartListDto => participant !== null);

    return {
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
  }

  /**
   * Create CreateStartListDto with custom competitor type
   */
  createStartListDtoWithCustomType(
    tireurs: TireurInMatch[], 
    competitorType: string,
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
    },
    hasBye: boolean = false
  ): CreateStartListDto {
    const streetDict = ["D", "G"];
    const participants = tireurs
      .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2]))
      .filter((participant): participant is ParticipantRequestStartListDto => participant !== null);

    return {
      competitorType: competitorType,
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
      hasBye: hasBye
    };
  }

  /**
   * Load participants from WRE participants JSON file
   */
  loadWreParticipants(): any[] {
    try {
      const filePath = path.join(process.cwd(), 'src', 'wrestling', 'application', 'examples', 'wre-participants.json');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Error loading WRE participants:', error);
      return [];
    }
  }

  /**
   * Map WRE participants to startListDto
   */
  mapWreParticipantsToStartList(
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
    },
    competitorType: string = 'Individual',
    hasBye: boolean = false
  ): CreateStartListDto {
    const wreParticipants = this.loadWreParticipants();
    const participants: ParticipantRequestStartListDto[] = wreParticipants.map((participant, index) => ({
      participantId: participant.idParticipant,
      name: participant.name,
      surname: participant.surname,
      delegation: participant.organisation.code,
      startingOrder: index + 1,
      startingSortOrder: index,
      bib: participant.code,
      street: index % 2 === 0 ? 'D' : 'G',
      decorator: [],
    }));

    return {
      competitorType: competitorType,
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
      hasBye: hasBye
    };
  }

  /**
   * Map WRE participants filtered by gender to startListDto
   */
  mapWreParticipantsByGenderToStartList(
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
    },
    competitorType: string = 'Individual',
    hasBye: boolean = false
  ): CreateStartListDto {
    const wreParticipants = this.loadWreParticipants();
    const filteredParticipants = wreParticipants.filter(participant => participant.gender.code === gender);
    
    const participants: ParticipantRequestStartListDto[] = filteredParticipants.map((participant, index) => ({
      participantId: participant.idParticipant,
      name: participant.name,
      surname: participant.surname,
      delegation: participant.organisation.code,
      startingOrder: index + 1,
      startingSortOrder: index,
      bib: participant.code,
      street: index % 2 === 0 ? 'D' : 'G',
      decorator: [],
    }));

    return {
      competitorType: competitorType,
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
      hasBye: hasBye
    };
  }
}