import { Injectable } from '@nestjs/common';
import { ParticipantService } from '../../infraestructure/shared/participant.service';
import { GroupService, Group, GroupParticipant } from '../../infraestructure/shared/group.service';
import { Participant } from '../../domain/interfaces/participant.interfaces';
import { 
  CreateResultDto, 
  ParticipantRequestResultDto, 
  GroupRequestResultDto,
  PeriodResultRequestResultDto,
  GlobalResultRequestResultDto,
  MetadataRequestResultDto
} from '../../domain/interfaces/fencing-results.interface';
import { CreateStartListDto } from '../../domain/interfaces/fencing-participant.interfaces';
import { 
  FencingTeamsCompetition,
  TeamCompetition,
  Team,
  TeamMember,
  TeamInMatch,
  TeamMatch,
  TeamTableau,
  TeamSuiteDeTableaux,
  TeamPhaseDeTableaux
} from '../../domain/interfaces/fencing-teams.interfaces';

// Using interfaces from fencing-teams.interfaces.ts

// Dictionary to map team member IDs to participant codes
const participantDictionary: Record<string, string> = {
  '1': '211',
  '2': '248',
  '3': '458',
  '4': '279',
  '5': '488',
  '6': '249',
};

// const participantDictionaryWomen: Record<string, string> = {
//   '1': '254', // UZBEKISTAN -> Uzbekistan 1 (group 211)
//   '2': '278', // AZERBAIJAN 1 -> Azerbaijan 1 (group 248)
//   '3': '210', // BELARUS -> Belarus (group 458)
//   '4': '267', // RUSSIA -> Russia 1 (group 279)
//   '5': '255', // KAZAKHSTAN -> Kazakhstan 1 (group 488)
// };

const sportEventDictionary: Record<string, string> = {
  S: 'TEAMSABR',
  E: 'TEAMEPEE',
  F: 'TEAMFOIL',
  'TEAMSABR': 'TEAMSABR'
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
  constructor(
    private readonly participantService: ParticipantService,
    private readonly groupService: GroupService
  ) {}

  /**
   * Map team member to participant using group data
   */
  mapTeamMemberToParticipant(teamMember: TeamMember, teamId: string, index: number, street: string): ParticipantRequestResultDto | null {
    const groupCode = participantDictionary[teamId];
    
    if (groupCode) {
      const group = this.groupService.getGroupByCode(groupCode);
      if (group && group.participants && group.participants[index]) {
        const participant = group.participants[index];
        return {
          participantId: participant.participantId,
          name: participant.name,
          surname: participant.surname,
          delegation: participant.delegation,
          startingOrder: (index + 1).toString(),
          startingSortOrder: index,
          bib: teamMember._dossard,
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
        };
      }
    }
    return null;
  }

  /**
   * Map team to group with team members as participants using real group data
   */
  mapTeamToGroup(team: Team, teamInMatch?: TeamInMatch, matchResult?: string): GroupRequestResultDto | null {
    const groupCode = participantDictionary[team._ID];
    
    if (!groupCode) {
      return null;
    }

    const group = this.groupService.getGroupByCode(groupCode);
    if (!group) {
      return null;
    }

    const participants: ParticipantRequestResultDto[] = [];
    
    // Use all participants from the group
    group.participants.forEach((participant, index) => {
      participants.push({
        participantId: participant.participantId,
        name: participant.name,
        surname: participant.surname,
        delegation: participant.delegation,
        startingOrder: (index + 1).toString(),
        startingSortOrder: index,
        bib: "", // Will be filled from team member data if available
        street: teamInMatch?._Cote || "",
        decorator: [],
        rk: "",
        rkPo: 99,
        result: "",
        irm: "",
        winner: false,
        wlt: "",
        qualified: "",
          difference: "",
      });
    });

    if (participants.length === 0) {
      return null;
    }

    return {
      result: matchResult || "",
      groupId: group.groupId,
      name: group.name,
      delegation: group.delegation,
      startingOrder: teamInMatch?._Place || "1",
      startingSortOrder: parseInt(teamInMatch?._Place || "1") - 1,
      decorator: [],
      participants: participants,
      rk: teamInMatch?._Place || "",
      rkPo: parseInt(teamInMatch?._Place || "1") - 1,
      irm: "",
      winner: teamInMatch?._Statut === 'V',
      wlt: teamInMatch?._Statut === 'V' ? 'W' : teamInMatch?._Statut === 'D' ? 'L' : '',
      qualified: "",
      difference: "",
      bib: "",
      street: teamInMatch?._Cote || "",
    };
  }

  /**
   * Map team match to period result using start list information
   */
  mapTeamMatchToPeriodResultWithStartList(
    match: TeamMatch,
    teams: Team[],
    phase: string,
    sportEvent: string,
    startList?: CreateStartListDto
  ): PeriodResultRequestResultDto | null {
    const validTeams = match.Equipe.filter(team => team && typeof team === 'object' && team !== null) as TeamInMatch[];
    
    if (validTeams.length < 2) {
      return null;
    }

    const team1InMatch = validTeams[0] as TeamInMatch;
    const team2InMatch = validTeams[1] as TeamInMatch;
    
    const team1Ref = team1InMatch._REF;
    const team2Ref = team2InMatch._REF;
    
    if (!team1Ref || !team2Ref) {
      return null;
    }

    const team1 = teams.find(t => t._ID === team1Ref);
    const team2 = teams.find(t => t._ID === team2Ref);

    if (!team1 || !team2) {
      return null;
    }

    // Use start list information if available
    let group1: GroupRequestResultDto | null = null;
    let group2: GroupRequestResultDto | null = null;

    if (startList && startList.groups && startList.groups.length >= 2) {
      // Use groups from start list
      group1 = {
        result: team1InMatch._Statut === 'V' ? '1' : '0',
        groupId: startList.groups[0].groupId,
        name: startList.groups[0].name,
        delegation: startList.groups[0].delegation,
        startingOrder: team1InMatch._Place || "1",
        startingSortOrder: parseInt(team1InMatch._Place || "1") - 1,
        decorator: [],
        participants: startList.groups[0].participants.map(p => ({
          participantId: p.participantId,
          name: p.name,
          surname: p.surname,
          delegation: p.delegation,
          startingOrder: p.startingOrder.toString(),
          startingSortOrder: p.startingSortOrder,
          bib: p.bib,
          street: p.street,
          decorator: p.decorator,
          rk: "",
          rkPo: 99,
          result: "",
          irm: "",
          winner: false,
          wlt: "",
          qualified: "",
          difference: "",
        })),
        rk: team1InMatch._Place || "",
        rkPo: parseInt(team1InMatch._Place || "1") - 1,
        irm: "",
        winner: team1InMatch._Statut === 'V',
        wlt: team1InMatch._Statut === 'V' ? 'W' : team1InMatch._Statut === 'D' ? 'L' : '',
        qualified: "",
          difference: "",
        bib: "",
        street: team1InMatch._Cote || "",
      };

      group2 = {
        result: team2InMatch._Statut === 'V' ? '1' : '0',
        groupId: startList.groups[1].groupId,
        name: startList.groups[1].name,
        delegation: startList.groups[1].delegation,
        startingOrder: team2InMatch._Place || "2",
        startingSortOrder: parseInt(team2InMatch._Place || "2") - 1,
        decorator: [],
        participants: startList.groups[1].participants.map(p => ({
          participantId: p.participantId,
          name: p.name,
          surname: p.surname,
          delegation: p.delegation,
          startingOrder: p.startingOrder.toString(),
          startingSortOrder: p.startingSortOrder,
          bib: p.bib,
          street: p.street,
          decorator: p.decorator,
          rk: "",
          rkPo: 99,
          result: "",
          irm: "",
          winner: false,
          wlt: "",
          qualified: "",
          difference: "",
        })),
        rk: team2InMatch._Place || "",
        rkPo: parseInt(team2InMatch._Place || "2") - 1,
        irm: "",
        winner: team2InMatch._Statut === 'V',
        wlt: team2InMatch._Statut === 'V' ? 'W' : team2InMatch._Statut === 'D' ? 'L' : '',
        qualified: "",
          difference: "",
        bib: "",
        street: team2InMatch._Cote || "",
      };
    } else {
      // Fallback to original mapping
      group1 = this.mapTeamToGroup(team1, team1InMatch, team1InMatch._Statut);
      group2 = this.mapTeamToGroup(team2, team2InMatch, team2InMatch._Statut);
    }

    if (!group1 || !group2) {
      return null;
    }

    const result = `${group1.result} - ${group2.result}`;

    return {
      result: result,
      unitCode: `${sportEvent}${phase}${match._ID}`,
      name: `Match ${match._ID}`,
      order: parseInt(match._ID),
      duration: "",
      distance: "",
      resHome: group1.result,
      resAway: group2.result,
      totalHome: group1.result,
      totalAway: group2.result,
      periodId: `period_${match._ID}`,
      participants: [],
      groups: [group1, group2],
      decorator: [],
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

    // Filter out empty strings and get valid team references
    const validTeams = match.Equipe.filter(team => typeof team === 'object' && team !== null);
    
    if (validTeams.length < 2) {
      return null;
    }

    const team1InMatch = validTeams[0] as TeamInMatch;
    const team2InMatch = validTeams[1] as TeamInMatch;
    
    const team1Ref = team1InMatch._REF;
    const team2Ref = team2InMatch._REF;
    
    if (!team1Ref || !team2Ref) {
      return null;
    }

    const team1 = teams.find(t => t._ID === team1Ref);
    const team2 = teams.find(t => t._ID === team2Ref);

    if (!team1 || !team2) {
      return null;
    }

    const group1 = this.mapTeamToGroup(team1, team1InMatch, team1InMatch._Statut);
    const group2 = this.mapTeamToGroup(team2, team2InMatch, team2InMatch._Statut);

    if (!group1 || !group2) {
      return null;
    }

    const result = `${group1.result} - ${group2.result}`;

    return {
      result: result,
      unitCode: `${sportEvent}${phase}${match._ID}`,
      name: `Match ${match._ID}`,
      order: parseInt(match._ID),
      duration: "",
      distance: "",
      resHome: group1.result,
      resAway: group2.result,
      totalHome: group1.result,
      totalAway: group2.result,
      periodId: `period_${match._ID}`,
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
    const gender = genderDictionary[competition._Sexe];
    const sportEvent = sportEventDictionary[competition._Arme].replace('-', '');
    const phaseCode = phaseDictionary[phase] || phase;
    const phaseCodeString = `${discipline}${gender}${sportEvent.padEnd(18, '-')}${phaseCode.padEnd(4, '-')}--------`;
    const unitCodeString = `${phaseCodeString.slice(0, -8)}${unit.padStart(4, '0')}----`;

    return {
      discipline: discipline,
      gender: gender,
      sportEvent: sportEvent,
      category: 'GENERAL',
      phase: phaseCode,
      unit: unit.padStart(4, '0'),
      phaseCode: phaseCodeString,
      unitCode: unitCodeString,
    };
  }

  /**
   * Create CreateResultDto from team competition data using start list information
   */
  createTeamResultDtoWithStartList(
    competition: TeamCompetition,
    match: TeamMatch,
    phase: string,
    unit: string,
    startList?: CreateStartListDto
  ): CreateResultDto | null {
    const teams = competition.Equipes.Equipe;
    const periodResult = this.mapTeamMatchToPeriodResultWithStartList(match, teams, phase, sportEventDictionary[competition._Arme], startList);
    
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
      last: "",
      duration: "",
    };

    return {
      metadata: metadata,
      periods: [
        {
          result: periodResult.result,
          name: "R1",
          order: 0,
          periodId: "period_1",
          participants: [],
          groups: periodResult.groups,
          decorator: [],
          duration: "",
        },
      ],
      globalResult: globalResult,
      currentPeriod: "1",
      current: "",
      last: "",
      duration: "",
      decorator: [],
      hasStats: false,
      stats: {},
      splits: [],
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
    const periodResult = this.mapTeamMatchToPeriodResult(match, teams, phase, sportEventDictionary[competition._Arme]);
    
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
      globalResult: globalResult,
      currentPeriod: "1",
      current: "",
      last: "",
      duration: "",
      decorator: [],
      hasStats: false,
      stats: {},
      splits: [],
    };
  }

  /**
   * Process entire team competition with start lists and return array of CreateResultDto
   */
  processTeamCompetitionWithStartLists(competition: TeamCompetition, startLists: CreateStartListDto[]): CreateResultDto[] {
    const results: CreateResultDto[] = [];
    
    if (!competition.Phases?.PhaseDeTableaux?.SuiteDeTableaux) {
      return results;
    }

    const suiteDeTableaux = competition.Phases.PhaseDeTableaux.SuiteDeTableaux;
    
    // Handle both single tableau and array of tableaux
    const tableaux = Array.isArray(suiteDeTableaux.Tableau) ? suiteDeTableaux.Tableau : [suiteDeTableaux.Tableau];
    
    tableaux.forEach(tableau => {
      if (!tableau.Match) return;
      
      const matches = Array.isArray(tableau.Match) ? tableau.Match : [tableau.Match];
      matches.forEach(match => {
        // Find corresponding start list for this match
        const correspondingStartList = startLists.find(sl => 
          sl.metadata.unit === match._ID && sl.metadata.phase === tableau._ID
        );
        
        const result = this.createTeamResultDtoWithStartList(competition, match, tableau._ID, match._ID, correspondingStartList);
        if (result) {
          results.push(result);
        }
      });
    });

    return results;
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
    
    // Handle both single tableau and array of tableaux
    const tableaux = Array.isArray(suiteDeTableaux.Tableau) ? suiteDeTableaux.Tableau : [suiteDeTableaux.Tableau];
    
    tableaux.forEach(tableau => {
      if (!tableau.Match) return;
      
      const matches = Array.isArray(tableau.Match) ? tableau.Match : [tableau.Match];
      matches.forEach(match => {
        const result = this.createTeamResultDto(competition, match, tableau._ID, match._ID);
        if (result) {
          results.push(result);
        }
      });
    });

    return results;
  }
}
