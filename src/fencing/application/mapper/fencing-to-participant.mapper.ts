import { Injectable } from '@nestjs/common';
import { ParticipantService } from '../../infraestructure/shared/participant.service';
import { Participant } from '../../domain/interfaces/participant.interfaces';
import { ParticipantRequestStartListDto, CreateStartListDto } from 'src/fencing/domain/interfaces/fencing-participant.interfaces';
import { TireurInMatch } from 'src/fencing/domain/interfaces/fencing.interfaces';
import participantsData from '../../../wrestling/application/examples/grs_db.participants-FEN.json';
export interface Tireur {
  ID: string;
  Nom: string;
  Prenom?: string;
  Code?: string;
}

const participantDictionary: Record<string, string> = {
  '1': '10007923',
  '2': '10005263',
  '3': '10007920',
  '4': '10007924',
  '5': '10007927',
  '6': '10005265',
  '7': '10005260',
  '8': '10000565',
  '9': '10007925',
  '10': '10007921',
  '11': '10003642',
  '12': '10007944',
  '13': '10003632',
  '14': '10007922',
  '15': '10007926',
  '16': '10003651',
  '17': '10000564',
  '18': '10003647',
  '19': '10005261',
  '20': '10000566',
};

@Injectable()
export class FencingToParticipantMapper {
  constructor(private readonly participantService: ParticipantService) {}
  /**
   * Map tireur to participant using the participant service
  */
 mapToParticipant(tireur: TireurInMatch, index: number, street: string, Licence: string): ParticipantRequestStartListDto | null {
    // Primero intentar obtener el código del diccionario usando el ID del tireur
    const participantCode = Licence;
    
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
  mapToParticipants(tireurs: TireurInMatch[], street: string = '', Licence: string): ParticipantRequestStartListDto[] {
    const streetDict = ["D", "G"]
    return tireurs
      .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2], Licence))
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
    },
    tireusAll: {ID: string, Licence: string}[]
  ): CreateStartListDto {
    const streetDict = ["D", "G"];
    const participants = tireurs
      .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2], tireusAll.find(_tireur => _tireur.ID === tireur.REF)?.Licence))
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
      .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2], ''))
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
}