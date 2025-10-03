import { Injectable } from '@nestjs/common';
import { ParticipantService } from '../../infraestructure/shared/participant.service';
import { Participant } from '../../domain/interfaces/participant.interfaces';
import { ParticipantRequestStartListDto, CreateStartListDto } from 'src/fencing/domain/interfaces/fencing-participant.interfaces';
import { TireurInMatch } from 'src/fencing/domain/interfaces/fencing.interfaces';

export interface Tireur {
  ID: string;
  Nom: string;
  Prenom?: string;
  Code?: string;
}

// Diccionario para mapear IDs de tireurs a códigos de participantes
// const participantDictionary: Record<string, string> = {
//   '1': '10000817',
//   '2': '10000815',
//   '3': '10007949',
//   '4': '10003628',
//   '5': '10005257',
//   '6': '10003630',
//   '7': '10003631',
//   '8': '10007931',
//   '9': '10007950',
//   '10': '10005262',
//   '11': '10007947',
//   '12': '10007944',
//   '13': '10003537',
//   '14': '10003538',
//   '15': '10000818',
//   '16': '10007948',
//   '17': '10003629',
//   '18': '10007945',
//   '19': '10005259',
//   '20': '10007946',
//   '21': '10003536',
//   '22': '10005256',
//   '23': '10000816',
//   '24': '10003535',
// };

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
  mapToParticipant(tireur: TireurInMatch, index: number, street: string): ParticipantRequestStartListDto | null {
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
}