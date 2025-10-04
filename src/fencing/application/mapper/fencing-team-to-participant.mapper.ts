import { Injectable } from '@nestjs/common';
import { ParticipantService } from '../../infraestructure/shared/participant.service';
import { GroupService, Group, GroupParticipant } from '../../infraestructure/shared/group.service';
import { 
  CreateStartListDto, 
  ParticipantRequestStartListDto, 
  GroupRequestStartListDto,
  MetadataRequestStartListDto
} from '../../domain/interfaces/fencing-participant.interfaces';
import { 
  TeamCompetition,
  Team,
  TeamMember,
  TeamMatch,
  TeamInMatch,
  TeamTableau,
  TeamSuiteDeTableaux,
  TeamPhaseDeTableaux
} from '../../domain/interfaces/fencing-teams.interfaces';

// Dictionary to map team IDs to group codes based on teams-example.json and groups.json
// const participantDictionary: Record<string, string> = {
//   '1': '211', // UZBEKISTAN -> Uzbekistan 1 (group 211)
//   '2': '248', // AZERBAIJAN 1 -> Azerbaijan 1 (group 248)
//   '3': '458', // BELARUS -> Belarus (group 458)
//   '4': '279', // RUSSIA -> Russia 1 (group 279)
//   '5': '488', // KAZAKHSTAN -> Kazakhstan 1 (group 488)
//   '6': '249', // AZERBAIJAN 2 -> Azerbaijan 2 (group 249)
// };

const participantDictionaryWomen: Record<string, string> = {
  '1': '254', // UZBEKISTAN -> Uzbekistan 1 (group 211)
  '2': '278', // AZERBAIJAN 1 -> Azerbaijan 1 (group 248)
  '3': '210', // BELARUS -> Belarus (group 458)
  '4': '267', // RUSSIA -> Russia 1 (group 279)
  '5': '255', // KAZAKHSTAN -> Kazakhstan 1 (group 488)
};

const sportEventDictionary: Record<string, string> = {
  S: 'TEAMSABR',
  E: 'TEAMEPEE',
  F: 'TEAMFOIL',
  'TEAMSABR': 'TEAMSABR'
};

const genderDictionary: Record<string, string> = {
  F: 'W',
  M: 'M',
};

const phaseDictionary: Record<string, string> = {
  'POULE1': 'GP01',
  'POULE2': 'GP02',
  'POULE3': 'GP03',
  'POULE4': 'GP04',
  'POULE5': 'GP05',
  'POULE6': 'GP06',
  'A32': 'R32',
  'A16': 'R16',
  'A8': '8FNL',
  'A4': 'SFNL',
  'A2': 'FNL',
  'B2': 'REPF',
};

@Injectable()
export class FencingTeamToParticipantMapper {
  constructor(
    private readonly participantService: ParticipantService,
    private readonly groupService: GroupService
  ) {}

  /**
   * Map team member to participant for start list using group data
   */
  mapTeamMemberToParticipant(teamMember: TeamMember, teamId: string, index: number, street: string): ParticipantRequestStartListDto | null {
    const groupCode = participantDictionaryWomen[teamId];
    
    if (groupCode) {
      const group = this.groupService.getGroupByCode(groupCode);
      if (group && group.participants && group.participants[index]) {
        const participant = group.participants[index];
        return {
          participantId: participant.participantId,
          name: participant.name,
          surname: participant.surname,
          delegation: participant.delegation,
          startingOrder: index + 1,
          startingSortOrder: index,
          bib: teamMember._dossard,
          street: street,
          decorator: [],
        };
      }
    }
    return null;
  }

  /**
   * Map team to group for start list using real group data
   */
  mapTeamToGroup(team: Team, street: string): GroupRequestStartListDto | null {
    const groupCode = participantDictionaryWomen[team._ID];
    
    if (!groupCode) {
      return null;
    }

    const group = this.groupService.getGroupByCode(groupCode);
    if (!group) {
      return null;
    }

    const participants: ParticipantRequestStartListDto[] = [];
    
    // Use all participants from the group
    group.participants.forEach((participant, index) => {
      participants.push({
        participantId: participant.participantId,
        name: participant.name,
        surname: participant.surname,
        delegation: participant.delegation,
        startingOrder: index + 1,
        startingSortOrder: index,
        bib: "", // Will be filled from team member data if available
        street: street,
        decorator: [],
      });
    });

    if (participants.length === 0) {
      return null;
    }

    return {
      groupId: group.groupId,
      name: group.name,
      delegation: group.delegation,
      startingOrder: 1,
      startingSortOrder: 0,
      street: street,
      participants: participants,
    };
  }

  /**
   * Generate metadata for team competition start list
   */
  generateMetadata(
    competition: TeamCompetition,
    phase: string,
    unit: string
  ): MetadataRequestStartListDto {
    const discipline = 'FEN';
    const gender = genderDictionary[competition._Sexe];
    const sportEvent = sportEventDictionary[competition._Arme];
    const phaseCode = phaseDictionary[phase];
    const phaseCodeString = `${discipline}${gender}${sportEvent.padEnd(18, '-')}${phaseCode.padEnd(4, '-')}--------`;
    const unitCodeString = `${phaseCodeString.slice(0, -8)}${unit.padStart(4, '0')}----`;

    return {
      discipline: discipline,
      gender: gender,
      sportEvent: sportEvent,
      category: 'GENERAL',
      phase: phaseCode,
      unit: unit.padStart(4, '0'),
      subUnit: undefined,
      phaseCode: phaseCodeString,
      unitCode: unitCodeString,
    };
  }

  /**
   * Create CreateStartListDto from team competition data
   */
  createTeamStartListDto(
    competition: TeamCompetition,
    match: TeamMatch,
    phase: string,
    unit: string
  ): CreateStartListDto | null {
    const teams = competition.Equipes.Equipe;
    const groups: GroupRequestStartListDto[] = [];
    const participants: ParticipantRequestStartListDto[] = [];
    
    // Get teams involved in this match
    const validTeams = match.Equipe.filter(team => typeof team === 'object' && team !== null) as TeamInMatch[];
    
    if (validTeams.length < 2) {
      return null;
    }

    const team1Ref = validTeams[0]._REF;
    const team2Ref = validTeams[1]._REF;
    
    if (!team1Ref || !team2Ref) {
      return null;
    }

    const team1 = teams.find(t => t._ID === team1Ref);
    const team2 = teams.find(t => t._ID === team2Ref);

    if (!team1 || !team2) {
      return null;
    }

    // Create groups for both teams
    const group1 = this.mapTeamToGroup(team1, "G"); // Left side
    const group2 = this.mapTeamToGroup(team2, "D"); // Right side

    if (group1) {
      groups.push(group1);
      participants.push(...group1.participants);
    }

    if (group2) {
      groups.push(group2);
      participants.push(...group2.participants);
    }

    if (groups.length === 0) {
      return null;
    }

    const metadata = this.generateMetadata(competition, phase, unit);

    return {
      competitorType: "TEAM",
      metadata: metadata,
      groups: groups,
      participants: participants,
      hasBye: false,
    };
  }

  /**
   * Process entire team competition and return array of CreateStartListDto
   */
  processTeamCompetitionStartList(competition: TeamCompetition): CreateStartListDto[] {
    const startLists: CreateStartListDto[] = [];
    
    if (!competition.Phases?.PhaseDeTableaux?.SuiteDeTableaux) {
      return startLists;
    }

    const suiteDeTableaux = competition.Phases.PhaseDeTableaux.SuiteDeTableaux;
    
    // Handle both single tableau and array of tableaux
    const tableaux = Array.isArray(suiteDeTableaux.Tableau) ? suiteDeTableaux.Tableau : [suiteDeTableaux.Tableau];
    
    tableaux.forEach(tableau => {
      if (!tableau.Match) return;
      
      const matches = Array.isArray(tableau.Match) ? tableau.Match : [tableau.Match];
      matches.forEach(match => {
        const startList = this.createTeamStartListDto(competition, match, tableau._ID, match._ID);
        if (startList) {
          startLists.push(startList);
        }
      });
    });

    return startLists;
  }
}
