import { 
  Match, 
  Poule, 
  RSCCodeType, 
  TireurStatus, 
  DateInfo, 
  MedalInfo, 
  Description, 
  UnitMetadata, 
  W2TECUnit, 
  ConvertedMatch, 
  PhaseDeTableaux,
  SuiteDeTableaux
} from '../../domain/interfaces/fencing.interfaces';
import participantsData from '../../../wrestling/application/examples/grs_db.participants-FEN.json';

const tireursDictionay = participantsData; 

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

// RSCCodeType interface moved to fencing.interfaces.ts

const genderDictionary: Record<string, string> = {
  F: 'W',
  M: 'M',
  W: "W",
};

const sportEventDictionary: Record<string, string> = {
  S: 'SABRE',
  E: 'EPEE',
  F: 'FOIL',
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

const getMedalsInfo = (metadata: RSCCodeType): MedalInfo => {
  if (metadata.phase === 'FNL') {
    return {
      hasMedals: true,
      medalCodes: ['GOLD', 'SILVER'],
      medalQuantities: [{
        code: 'GOLD',
        quantity: 1
      }, {
        code: 'SILVER',
        quantity: 1
      }],
    };
  }
  if (metadata.phase === 'SFNL') {
    return {
      hasMedals: true,
      medalCodes: ['BRONZE'],
      medalQuantities: [{
        code: 'BRONZE',
        quantity: 1
      }],
    };
  }
  return {
    hasMedals: false,
    medalCodes: [],
  };
};

const locationDictionary: Record<string, string> = {
  'GREEN': '27d0dfdc-eba2-4c52-93ea-64543dbff01b',
  'RED': 'd1780522-d1c2-4706-b4ee-48ffb07338ef',
  'BLUE': '5b800390-38ab-4813-8945-fe0358676393',
  'YELLOW': '04b90608-4cd2-4575-adb1-72c383205857',
  'FINAL': '258b0efe-d0ec-421a-b60c-14fe0d05f396',
  'BLACK': '258b0efe-d0ec-421a-b60c-14fe0d05f396',
  '5': '258b0efe-d0ec-421a-b60c-14fe0d05f396',
};

const rscCodeConverter = (
  gender: string,
  phase: string,
  sportEvent: string,
  combatNumber: string,
): RSCCodeType => {
  const disciplineCode = 'FEN';
  const genderCode = genderDictionary[gender];
  const phaseCode = phaseDictionary[phase];
  const sportEventCode = sportEventDictionary[sportEvent];
  const unitCode = combatNumber.padStart(4, '0');
  const rscCode = `${disciplineCode}${genderCode}${sportEventCode.padEnd(18, '-')}${phaseCode.padEnd(4, '-')}--------`;
  // const rscCode = `${disciplineCode}${genderCode}${sportEventCode.padEnd(18, '-')}${phaseCode.padEnd(4, '-')}--------`;

  return {
    discipline: disciplineCode,
    // gender: genderCode,
    gender: genderCode,
    sportEvent: sportEventCode,
    phase: phaseCode,
    phaseCode: rscCode,
    unit: unitCode,
    rscCode,
  };
};

const generateDateInfo = (startDate: string, startTime: string): DateInfo => {
  const date = `${startDate}T${startTime}`;
  return {
    startDate: date,
    endDate: date,
  };
};

const determineUnitStatus = (tireurStatus: TireurStatus[]): string => {
  const justScheduled = tireurStatus.length === 0;

  if (justScheduled) {
    return 'SCHEDULED';
  }
  const isRunning = tireurStatus.find((tireur) => tireur.status === 'C');
  const isOfficial_StartList = tireurStatus.find((tireur) => tireur.status && tireur.status !== 'C')
    ? 'OFFICIAL'
    : 'START_LIST';

  if (isRunning) {
    return 'OFFICIAL';
  }
  return isOfficial_StartList;
};


export const convertPouleToMatch = (poule: Poule, _sportEvent: string, _gender: string, tireus: {REF: string, Licence: string}[]): ConvertedMatch[] => {
  const matches = poule.Match;
  const gender = genderDictionary[_gender];

  const convertedMatches: ConvertedMatch[] = matches.map(m => {
    const sportEvent = _sportEvent;
    const phase = `POULE${poule.ID}`;
    const combatNumber = m.ID;
    const startDate = poule.Date;
    const startTime = poule.Heure;
    const location = poule.Piste;
    
    return {
      ID: m.ID,
      Tireur: m.Tireur,
      sportEvent,
      combatNumber,
      startDate,
      startTime,
      location,
      gender,
      phase
    };
  });

  return convertedMatches;
};

export const convertEliminationToMatch = (elimination: SuiteDeTableaux, _sportEvent: string, _gender: string, tireus: {REF: string, Licence: string}[]): ConvertedMatch[] => {
  // Handle both single tableau and array of tableaux
  const tableaux = Array.isArray(elimination.Tableau) ? elimination.Tableau : [elimination.Tableau];
  const gender = genderDictionary[_gender];
  const convertedMatches: ConvertedMatch[] = tableaux.flatMap(m => {
    const sportEvent = _sportEvent;
    const phase = m.ID;
    // Handle both single match and array of matches
    const matchArray = Array.isArray(m.Match) ? m.Match : [m.Match];
    
    const phaseMatches = matchArray.map(match => ({
      ID: match.ID,
      Tireur: match.Tireur,
      sportEvent,
      combatNumber: match.ID, // Use the individual match ID instead of tableau ID
      startDate: match.Date,
      startTime: match.Heure,
      location: match.Piste,
      gender,
      phase
    }));

    return phaseMatches;
  });

  return convertedMatches;
};

export const mapToW2tecPhases = (
  match: ConvertedMatch,
  name: string,
  progressionId: string,
  tireurStatus: TireurStatus[],
  shortName: string,
  gender: string
): W2TECUnit => {
  const rscVO = rscCodeConverter(match.gender, match.phase, match.sportEvent, match.combatNumber);
  const splittedStartDate = match.startDate.split('.');
  const parsedDate = `${splittedStartDate[2]}-${splittedStartDate[1]}-${splittedStartDate[0]}`;
  const parsedTime = `${match.startTime}:00`;
  const _gender = genderDictionary[gender];

  
  /**
   * Maps a ConvertedMatch to W2TEC Unit
   */
  const dateInfo = generateDateInfo(parsedDate, parsedTime);
  return {
    unitsNumber: 1,
    code: rscVO.rscCode.slice(0, -8).concat(rscVO.unit.padEnd(8, '-')),
    name: name,
    description: generateDescription(name, shortName),
    order: parseInt(progressionId) || 0,
    unitTypeCode: 'HATH',
    metadata: {
      discipline: rscVO.discipline,
      gender: rscVO.gender,
      sportEvent: rscVO.sportEvent,
      category: 'GENERAL',
      phase: rscVO.phase,
      unit: rscVO.unit,
      phaseCode: rscVO.rscCode,
    },
    dateInfo: dateInfo,
    location: locationDictionary[match.location],
    hasMedals: getMedalsInfo(rscVO).hasMedals,
    medalCodes: getMedalsInfo(rscVO).medalCodes,
    medalQuantities: getMedalsInfo(rscVO).medalQuantities,
    venue: 'SEFC',
    status: determineUnitStatus(tireurStatus),
  };
};

