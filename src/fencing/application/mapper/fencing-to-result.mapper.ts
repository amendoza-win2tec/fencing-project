import { Injectable } from '@nestjs/common';
import { ParticipantService } from '../../infraestructure/shared/participant.service';
import { Participant } from '../../domain/interfaces/participant.interfaces';
import { CreateResultDto, ParticipantRequestResultDto } from '../../domain/interfaces/fencing-results.interface';
import { Poule, TireurInMatch } from '../../domain/interfaces/fencing.interfaces';
import { MqttFencingData } from '../../domain/interfaces/fencing.interfaces';

export interface Tireur {
  ID: string;
  Nom: string;
  Prenom?: string;
  Code?: string;
}

// Diccionario para mapear IDs de tireurs a códigos de participantes
const participantDictionary: Record<string, string> = {
  '1': '10000817',
  '2': '10000815',
  '3': '10007949',
  '4': '10003628',
  '5': '10005257',
  '6': '10003630',
  '7': '10003631',
  '8': '10007931',
  '9': '10007950',
  '10': '10005262',
  '11': '10007947',
  '12': '10007944',
  '13': '10003537',
  '14': '10003538',
  '15': '10000818',
  '16': '10007948',
  '17': '10003629',
  '18': '10007945',
  '19': '10005259',
  '20': '10007946',
  '21': '10003536',
  '22': '10005256',
  '23': '10000816',
  '24': '10003535',
};

const sportEventDictionary: Record<string, string> = {
  S: 'SABRE',
  E: 'EPEE',
  F: 'FOIL',
};

@Injectable()
export class FencingToResultMapper {
  constructor(private readonly participantService: ParticipantService) {}

  /**
   * Map tireur to participant using the participant service
   */
  mapToParticipant(tireur: TireurInMatch, index: number, street: string): ParticipantRequestResultDto | null {
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
          startingOrder: (index + 1).toString(),
          startingSortOrder: index,
          bib: "",
          street: tireur.Cote,
          decorator: [],
          rk: tireur.Statut === 'V' ? "1" : tireur.Statut === 'D' ? "2" : "",
          rkPo: tireur.Statut === 'V' ? 0 : tireur.Statut === 'D' ? 1 : 99,
          result: tireur.Score ?? "",
          irm: "",
          winner: tireur.Statut === 'V' ? true : tireur.Statut === 'D' ? false : false,
          wlt: tireur.Statut === 'V' ? "W" : tireur.Statut === 'D' ? "L" : "",
          qualified: "",
          difference: "",
          accumulatedResult: "",
        };
      }
    }
    return null;
  }

  /**
   * Map multiple tireurs to participants
   */
  mapToParticipants(tireurs: TireurInMatch[], street: string = ''): ParticipantRequestResultDto[] {
    const streetDict = ["D", "G"]
    return tireurs
      .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2]))
      .filter((participant): participant is ParticipantRequestResultDto => participant !== null);
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

  buildPeriodResult(tireurs: TireurInMatch[]) {
    const tireur1 = tireurs[0]?.Score;
    const tireur2 = tireurs[1]?.Score;

    if (tireur1 !== undefined && tireur2 !== undefined) {
      return `${tireur1} - ${tireur2}`;
    }
    return "";
  }
  /**
   * Create CreateStartListDto from tireurs with default values
   */
  createResultDto(
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
  ): CreateResultDto {
    const streetDict = ["D", "G"];

    return {
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
      periods: [
        {
          result: this.buildPeriodResult(tireurs),
          name: "R1",
          order: 0,
          periodId: "period_1",
          participants: tireurs
          .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2])),
          groups: [],
          decorator: [],
          duration: "",
          distance: "",
          resHome: tireurs[0]?.Score ?? '',
          resAway: tireurs[1]?.Score ?? '',
          totalHome: tireurs[0]?.Score ?? '',
          totalAway: tireurs[1]?.Score ?? '',
        }
      ],
      splits: [],
      globalResult: {
        result: this.buildPeriodResult(tireurs),
        groups: [],
        participants: tireurs
        .map((tireur, index) => this.mapToParticipant(tireur, index, streetDict[index % 2])),
        decorator: [],
        current: "",
        currentPeriod: "1",
        last: "",
        duration: "",
      },
      decorator: [],
      hasStats: false,
      stats: {},
      officials: [],
    };
  }

  mapMqttToPouleMatchData(payload: MqttFencingData): Poule {
    const sportEvent = sportEventDictionary[payload.DataDic.Weapon];
    let phaseType = ""
    if ( payload.DataDic.Phase === "1") {
      phaseType = "POULE"
    }
    else if ( payload.DataDic.Phase === "2") {
      phaseType = "A32"
    }
    else if ( payload.DataDic.Phase === "3") {
      phaseType = "A16"
    }
    else if ( payload.DataDic.Phase === "4") {
      phaseType = "A8"
    }
    else if ( payload.DataDic.Phase === "5") {
      phaseType = "A4"
    }
    else if ( payload.DataDic.Phase === "6") {
      phaseType = "A2"
    }
    else if ( payload.DataDic.Phase === "7") {
      phaseType = "B2"
    }

    const poule: Poule = {
      ID: payload.DataDic.PoulTab,
      Piste: payload.DataDic.Piste,
      Date: payload.DataDic.Time,
      Heure: payload.DataDic.Stopwatch,
      Tireur: [
        {
          REF: payload.DataDic.RightId,
          NoDansLaPoule: "",
          NbVictoires: "",
          NbMatches: "",
          TD: "",
          TR: "",
          RangPoule: "",
        },
        {
          REF: payload.DataDic.LeftId,
          NoDansLaPoule: "",
          NbVictoires: "",
          NbMatches: "",
          TD: "",
          TR: "",
          RangPoule: ""
        }
      ],
      Match: [
        {
          ID: payload.DataDic.Match,
          Tireur: [
            {
              REF: payload.DataDic.RightId,
              Score: payload.DataDic.Rscore,
              Statut: payload.DataDic.Rstatus as "V" | "D" | "",
              Cote: "D",
            },
            {
              REF: payload.DataDic.LeftId,
              Score: payload.DataDic.Lscore,
              Statut: payload.DataDic.Lstatus as "V" | "D" | "",
              Cote: "G",
            }
          ]
        }
      ]
    }
    return poule;
  }
}