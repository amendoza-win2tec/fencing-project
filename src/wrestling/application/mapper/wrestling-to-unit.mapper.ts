import { 
  Match, 
  Poule, 
  RSCCodeType, 
  WrestlerStatus, 
  DateInfo, 
  MedalInfo, 
  Description, 
  UnitMetadata, 
  W2TECUnit, 
  ConvertedMatch, 
  PhaseDeTableaux,
  SuiteDeTableaux
} from '../../domain/interfaces/wrestling.interfaces';

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

// RSCCodeType interface moved to wrestling.interfaces.ts

const genderDictionary: Record<string, string> = {
  F: 'W',
  M: 'M',
};

const sportEventDictionary: Record<string, string> = {
  S: 'SABRE',
  E: 'EPEE',
  F: 'FOIL',
};

const locationDictionary: Record<string, string> = {
  'WR1': '5c6d1a40-48cd-4dad-90d7-bbb45d648db9',
  'WR2': '9e51e2f8-e0d0-4e1f-8a65-f699af7cdda3',
  'WR3': '33a877ab-ba30-4513-b041-87b968bcba5e'
};

const generateDescription = (name: string, shortName: string): Description => {
  const description: Description = {
    eng: {
      lang: 'eng',
      long: name,
      short: shortName,
    },
    fra: {
      lang: 'fra',
      long: name,
      short: shortName,
    },
    spa: {
      lang: 'spa',
      long: name,
      short: shortName,
    },
  };
  return description;
};

const generateDateInfo = (startDate: string, endDate: string): DateInfo => {
  return {
    startDate: startDate.replace('+04:00', ''),
    endDate: endDate.replace('+04:00', ''),
  };
};

const generateMedalInfo = (): MedalInfo => {
  return {
    gold: {
      participantId: '',
      name: '',
      surname: '',
      delegation: '',
    },
    silver: {
      participantId: '',
      name: '',
      surname: '',
      delegation: '',
    },
    bronze: {
      participantId: '',
      name: '',
      surname: '',
      delegation: '',
    },
  };
};

export const convertPouleToMatch = (poule: Poule, sportEvent: string): ConvertedMatch[] => {
  const convertedMatches: ConvertedMatch[] = [];
  
  poule.Match.forEach((match) => {
    const convertedMatch: ConvertedMatch = {
      ID: match.ID,
      Tireur: match.Tireur.map((tireur) => ({
        ...tireur,
        Nom: tireur.REF, // Use REF as name for now
        Prenom: '',
        Code: tireur.REF,
      })),
    };
    convertedMatches.push(convertedMatch);
  });
  
  return convertedMatches;
};

const rscCodeConverter = (code: string): RSCCodeType => {
  const discipline = code.slice(0, 3);
  const gender = code.slice(3, 4);
  const sportEvent = code.slice(4, 22).replace(/-/g, '');
  const phase = code.slice(22, 26).replace(/-/g, '');
  const rawUnitNumber = Number(code.slice(26, 34).replace(/-/g, ''))/100;
  const unit = rawUnitNumber.toString().padStart(4, '0');
  const phaseCode = `${discipline}${gender}${sportEvent.padEnd(18, '-')}${phase.padEnd(4, '-')}--------`;
  return {
    discipline,
    gender,
    sportEvent,
    phase,
    unit,
    phaseCode,
  }
};

export const convertEliminationToMatch = (phase: any, sportEvent: string): ConvertedMatch[] => {
  const convertedMatches: ConvertedMatch[] = [];
  
  if (phase.Tableau) {
    phase.Tableau.forEach((tableau: any) => {
      tableau.Match.forEach((match: any) => {
        const convertedMatch: ConvertedMatch = {
          ID: match.ID,
          Tireur: match.Tireur.map((tireur: any) => ({
            ...tireur,
            Nom: tireur.REF, // Use REF as name for now
            Prenom: '',
            Code: tireur.REF,
          })),
        };
        convertedMatches.push(convertedMatch);
      });
    });
  }
  
  return convertedMatches;
};

export const mapToW2tecPhases = (
  code: string,
  name: string,
  phaseType: string,
  unitNum: string,
  scheduleStatus: string,
  startDate: string,
  endDate: string,
  order: string,
  venue: string,
  medal: string,
  location: string,
  sessionCode: string,
): W2TECUnit => {
  const unitCode = code;
  
  const processedRSC = rscCodeConverter(code);
  const metadata: UnitMetadata = {
    ...processedRSC,
    category: 'GENERAL',
  };
  return {
    unitsNumber: 1,
    code:`${metadata.discipline}${metadata.gender}${metadata.sportEvent.padEnd(18, '-')}${metadata.phase.padEnd(4, '-')}${metadata.unit.padEnd(8, '-')}`,
    name: name,
    description: generateDescription(name, name),
    order: parseInt(order) || 0,
    unitTypeCode: 'HATH',
    metadata,
    dateInfo: generateDateInfo(startDate, endDate),
    location: locationDictionary[location],
    hasMedals: medal === '1' ? true : false,
    medalCodes: medal === '1' ? ['GOLD', 'SILVER', 'BRONZE'] : [],
    medalQuantities: medal === '1' ? [{ code: 'GOLD', quantity: 1 }, { code: 'SILVER', quantity: 1 }, { code: 'BRONZE', quantity: 1 }] : [],
    venue: venue,
    status: scheduleStatus,
  };
};
