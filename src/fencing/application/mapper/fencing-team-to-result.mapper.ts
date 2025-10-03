import { Injectable } from '@nestjs/common';
import { ParticipantService } from '../../infraestructure/shared/participant.service';
import { Participant } from '../../domain/interfaces/participant.interfaces';
import { 
  CreateResultDto, 
  ParticipantRequestResultDto, 
  GroupRequestResultDto,
  PeriodResultRequestResultDto,
  GlobalResultRequestResultDto,
  MetadataRequestResultDto
} from '../../domain/interfaces/fencing-results.interface';

// Team competition interfaces based on the XML structure
export interface TeamMember {
  ID: string;
  Nom: string;
  Prenom: string;
  DateNaissance?: string;
  Sexe: 'M' | 'F';
  Lateralite: 'I' | 'D';
  Nation: string;
  LicenceNat?: string;
  dossard: string;
  IdOrigine: string;
}

export interface Team {
  ID: string;
  Nom: string;
  Nation: string;
  Tireur: TeamMember[];
}

export interface TeamInMatch {
  REF: string;
  Statut?: 'V' | 'D' | '';
  Place?: string;
  Cote?: 'D' | 'G';
}

export interface TeamMatch {
  ID: string;
  Date: string;
  Heure?: string;
  Piste?: string;
  Equipe: TeamInMatch[];
}

export interface TeamTableau {
  ID: string;
  Titre: string;
  Taille: string;
  Match: TeamMatch[];
}

export interface TeamSuiteDeTableaux {
  ID: string;
  Titre: string;
  NbDeTableaux: string;
  Tableau: TeamTableau[];
}

export interface TeamPhaseDeTableaux {
  PhaseID: string;
  ID: string;
  Equipe: {
    REF: string;
    RangInitial: string;
    IdOrigine: string;
  }[];
  SuiteDeTableaux: TeamSuiteDeTableaux[];
}

export interface TeamCompetition {
  Version: string;
  Championnat: string;
  Annee: string;
  Arme: string;
  Sexe: 'M' | 'F';
  Domaine: string;
  Categorie: string;
  Date: string;
  TitreCourt: string;
  TitreLong: string;
  Equipes: {
    Equipe: Team[];
  };
  Phases: {
    PhaseDeTableaux: TeamPhaseDeTableaux;
  };
}

// Dictionary to map team member IDs to participant codes
const participantDictionary: Record<string, string> = {
  '1': '211',
  '2': '248',
  '3': '458',
  '4': '279',
  '5': '488',
  '6': '249',
};

const sportEventDictionary: Record<string, string> = {
  S: 'SABRE',
  E: 'EPEE',
  F: 'FOIL',
};

const phaseDictionary: Record<string, string> = {
  'A8': '8FNL',
  'A4': 'SFNL', 
  'A2': 'FNL',
  'A16': 'R16',
  'A32': 'R32',
};

const genderDictionary: Record<string, string> = {
  F: 'W',
  M: 'M',
};

@Injectable()
export class FencingTeamToResultMapper {
  constructor(private readonly participantService: ParticipantService) {}

  /**
   * Map team member to participant
   */
  mapTeamMemberToParticipant(teamMember: TeamMember, index: number, street: string): ParticipantRequestResultDto | null {
    const participantCode = participantDictionary[teamMember.ID];
    
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
          bib: teamMember.dossard,
          street: street,
          decorator: [],
          rk: "",
          rkPo: 99,
          result: "",
          irm: "",
          winner: false,
          wlt: "",
          qualified: "",
          difference: "",
          accumulatedResult: "",
        };
      }
    }
    return null;
  }

  /**
   * Map team to group with team members as participants
   */
  mapTeamToGroup(team: Team, teamInMatch?: TeamInMatch, matchResult?: string): GroupRequestResultDto | null {
    const teamMembers = team.Tireur || [];
    const participants: ParticipantRequestResultDto[] = [];
    
    teamMembers.forEach((member, index) => {
      const participant = this.mapTeamMemberToParticipant(member, index, "");
      if (participant) {
        participants.push(participant);
      }
    });

    if (participants.length === 0) {
      return null;
    }

    return {
      result: matchResult || "",
      groupId: parseInt(team.ID),
      name: team.Nom,
      delegation: team.Nation,
      startingOrder: teamInMatch?.Place || "1",
      startingSortOrder: parseInt(teamInMatch?.Place || "1") - 1,
      decorator: [],
      participants: participants,
      rk: teamInMatch?.Place || "",
      rkPo: parseInt(teamInMatch?.Place || "1") - 1,
      irm: "",
      winner: teamInMatch?.Statut === 'V',
      wlt: teamInMatch?.Statut === 'V' ? 'W' : teamInMatch?.Statut === 'D' ? 'L' : '',
      qualified: "",
      difference: "",
      bib: "",
      street: teamInMatch?.Cote || "",
    };
  }

  /**
   * Map team match to period result
   */
  mapTeamMatchToPeriodResult(
    match: TeamMatch, 
    teams: Team[], 
    phase: string,
    sportEvent: string
  ): PeriodResultRequestResultDto | null {
    if (!match.Equipe || match.Equipe.length < 2) {
      return null;
    }

    const team1Ref = match.Equipe[0]?.REF;
    const team2Ref = match.Equipe[1]?.REF;
    
    if (!team1Ref || !team2Ref) {
      return null;
    }

    const team1 = teams.find(t => t.ID === team1Ref);
    const team2 = teams.find(t => t.ID === team2Ref);

    if (!team1 || !team2) {
      return null;
    }

    const team1InMatch = match.Equipe[0];
    const team2InMatch = match.Equipe[1];

    const group1 = this.mapTeamToGroup(team1, team1InMatch, team1InMatch?.Statut);
    const group2 = this.mapTeamToGroup(team2, team2InMatch, team2InMatch?.Statut);

    if (!group1 || !group2) {
      return null;
    }

    const result = `${group1.result} - ${group2.result}`;

    return {
      result: result,
      unitCode: `${sportEvent}${phase}${match.ID}`,
      name: `Match ${match.ID}`,
      order: parseInt(match.ID),
      duration: "",
      distance: "",
      resHome: group1.result,
      resAway: group2.result,
      totalHome: group1.result,
      totalAway: group2.result,
      periodId: `period_${match.ID}`,
      participants: [],
      groups: [group1, group2],
      decorator: [],
    };
  }

  /**
   * Generate metadata for team competition
   */
  generateMetadata(
    competition: TeamCompetition,
    phase: string,
    unit: string
  ): MetadataRequestResultDto {
    const discipline = 'FEN';
    const gender = genderDictionary[competition.Sexe];
    const sportEvent = sportEventDictionary[competition.Arme];
    const phaseCode = phaseDictionary[phase] || phase;
    const phaseCodeString = `${discipline}${sportEvent.padEnd(18, '-')}${phaseCode.padEnd(4, '-')}--------`;
    const unitCodeString = `${phaseCodeString}${unit.padEnd(8, '-')}`;

    return {
      discipline: discipline,
      gender: gender,
      sportEvent: sportEvent,
      category: competition.Categorie,
      phase: phaseCode,
      unit: unit,
      phaseCode: phaseCodeString,
      unitCode: unitCodeString,
    };
  }

  /**
   * Create CreateResultDto from team competition data
   */
  createTeamResultDto(
    competition: TeamCompetition,
    match: TeamMatch,
    phase: string,
    unit: string
  ): CreateResultDto | null {
    const teams = competition.Equipes.Equipe;
    const periodResult = this.mapTeamMatchToPeriodResult(match, teams, phase, sportEventDictionary[competition.Arme]);
    
    if (!periodResult) {
      return null;
    }

    const metadata = this.generateMetadata(competition, phase, unit);
    
    // Create global result with all teams from the match
    const globalResult: GlobalResultRequestResultDto = {
      result: periodResult.result,
      groups: periodResult.groups,
      participants: [],
      decorator: [],
      current: "",
      currentPeriod: "1",
      last: "",
      duration: "",
    };

    return {
      metadata: metadata,
      periods: [periodResult],
      splits: [],
      globalResult: globalResult,
      currentPeriod: "1",
      current: "",
      last: "",
      duration: "",
      decorator: [],
      hasStats: false,
      stats: {},
      officials: [],
    };
  }

  /**
   * Process entire team competition and return array of CreateResultDto
   */
  processTeamCompetition(competition: TeamCompetition): CreateResultDto[] {
    const results: CreateResultDto[] = [];
    
    if (!competition.Phases?.PhaseDeTableaux?.SuiteDeTableaux) {
      return results;
    }

    const suiteDeTableaux = competition.Phases.PhaseDeTableaux.SuiteDeTableaux;
    
    suiteDeTableaux.forEach(suite => {
      if (!suite.Tableau) return;
      
      suite.Tableau.forEach(tableau => {
        if (!tableau.Match) return;
        
        tableau.Match.forEach(match => {
          const result = this.createTeamResultDto(competition, match, tableau.ID, match.ID);
          if (result) {
            results.push(result);
          }
        });
      });
    });

    return results;
  }
}
