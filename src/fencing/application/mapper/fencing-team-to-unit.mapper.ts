import { Injectable } from '@nestjs/common';
import { 
  TeamCompetition, 
  TeamMatch, 
  TeamTableau,
  TeamSuiteDeTableaux,
  Team
} from '../../domain/interfaces/fencing-teams.interfaces';
import { W2TECUnit, UnitMetadata, Description, DateInfo, MedalInfo, RSCCodeType } from '../../domain/interfaces/fencing.interfaces';

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

const genderDictionary: Record<string, string> = {
  F: 'W',
  M: 'M',
};

const sportEventDictionary: Record<string, string> = {
  S: 'TEAMSABR',
  E: 'TEAMEPEE',
  F: 'TEAMFOIL',
  'TEAMSABR': 'TEAMSABR'
};

const generateDescription = (name: string, shortName: string): Description => {
  const description: Description = {
    eng: {
      lang: 'eng',
      long: name,
      short: shortName,
    },
  };
  return description;
};

const generateDateInfo = (date: string, time?: string): DateInfo => {
  const splittedDate = date.split('.');
  const parsedDate = `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}T${time}:00`;
  
  return {
    startDate: parsedDate,
    endDate: parsedDate,
  };
};

const locationDictionary: Record<string, string> = {
  'GREEN': '6cd841a7-53fe-40e6-9fb3-88a5c7bb5ca9',
  'RED': '87cfd7c7-9ea7-40f1-86d8-c87e0b07e0d2',
  'BLUE': '186fb422-8cd0-402c-b6ea-3d9caae13526',
  'YELLOW': '48ddff12-af02-449e-9f17-1ffd6bcaad1c',
  'FINAL': '3c5bddd0-990a-498c-8fd7-3c16becd9363',
  'PODIUM': '3c5bddd0-990a-498c-8fd7-3c16becd9363'
};



const generateMedalInfo = (phase: string): MedalInfo => {
  if (phase.includes('FNL')) {
    return {
      hasMedals: true,
      medalCodes: ['GOLD', 'SILVER'],
      medalQuantities: [
        { code: 'GOLD', quantity: 1 },
        { code: 'SILVER', quantity: 1 },
      ],
    };
  }
  if (phase.includes('SFNL')) {
    return {
      hasMedals: true,
      medalCodes: ['BRONZE'],
      medalQuantities: [{ code: 'BRONZE', quantity: 1 }],
    };
  }
  return {
    hasMedals: false,
    medalCodes: [],
  };
};

const rscCodeConverter = (gender: string, phase: string, sportEvent: string, unit: string): RSCCodeType => {
  const discipline = 'FEN';
  const genderCode = genderDictionary[gender] || 'M';
  const sportEventCode = sportEventDictionary[sportEvent] || 'TEAMSABR';
  const phaseCode = phaseDictionary[phase] || phase;
  const unitCode = unit.padStart(4, '0');
  const phaseRscCode = `${discipline}${genderCode}${sportEventCode.padEnd(18, '-')}${phaseCode.padEnd(4, '-')}--------` 
  const rscCode = `${discipline}${genderCode}${sportEventCode.padEnd(18, '-')}${phaseCode.padEnd(4, '-')}${unitCode.padEnd(4, '-')}`;
  
  return {
    discipline: discipline,
    gender: genderCode,
    sportEvent: sportEventCode,
    phase: phaseCode,
    phaseCode: phaseRscCode,
    unit: unitCode,
    rscCode: rscCode,
  };
};

@Injectable()
export class FencingTeamToUnitMapper {
  
  /**
   * Create unit from team match
   */
  createTeamUnit(
    competition: TeamCompetition,
    match: TeamMatch,
    tableau: TeamTableau,
    phase: string
  ): W2TECUnit {
    const gender = genderDictionary[competition._Sexe] || 'M';
    const sportEvent = sportEventDictionary[competition._Arme] || 'TEAMSABRE';
    const phaseCode = phaseDictionary[phase] || phase;
    
    const rscVO = rscCodeConverter(gender, phase, sportEvent, match._ID);
    const dateInfo = generateDateInfo(match._Date, match._Heure);
    
    const name = `${tableau._Titre} - Bout ${match._ID}`;
    const shortName = `Bout ${match._ID}`;
    
    const startDate = new Date(dateInfo.startDate);
    const medalsInfo = generateMedalInfo(phaseCode);
    return {
      unitsNumber: 1,
      code: rscVO.rscCode,
      name: name,
      description: generateDescription(name, shortName),
      order: 1,
      unitTypeCode: 'TEAM',
      metadata: {
        discipline: 'FEN',
        gender: gender,
        sportEvent: sportEvent,
        category: 'GENERAL',
        phase: phaseCode,
        unit: rscVO.unit,
        phaseCode: rscVO.phaseCode,
      },
      dateInfo: dateInfo,
      location: locationDictionary[match._Piste],
      ...medalsInfo,
      venue: 'GSP',
      status: startDate < new Date() ? 'OFFICIAL' : 'START_LIST',
    };
  }

  /**
   * Process team competition and return array of units
   */
  processTeamCompetitionUnits(competition: TeamCompetition): W2TECUnit[] {
    const units: W2TECUnit[] = [];
    
    if (!competition.Phases?.PhaseDeTableaux?.SuiteDeTableaux) {
      return units;
    }

    const suiteDeTableaux = competition.Phases.PhaseDeTableaux.SuiteDeTableaux;
    
    // Handle both single tableau and array of tableaux
    const tableaux = Array.isArray(suiteDeTableaux.Tableau) ? suiteDeTableaux.Tableau : [suiteDeTableaux.Tableau];
    
    tableaux.forEach(tableau => {
      if (!tableau.Match) return;
      
      const matches = Array.isArray(tableau.Match) ? tableau.Match : [tableau.Match];
      matches.forEach(match => {
        const unit = this.createTeamUnit(competition, match, tableau, tableau._ID);
        units.push(unit);
      });
    });

    return units;
  }
}