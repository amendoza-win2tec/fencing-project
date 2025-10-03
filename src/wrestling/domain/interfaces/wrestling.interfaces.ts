/**
 * Interfaces for Wrestling Competition Data Structure
 * Based on the XML parsing result from wrestling competitions
 */

// Base Wrestler interface
export interface Wrestler {
  ID: string;
  Nom: string;
  Prenom: string;
  DateNaissance?: string;
  Sexe: 'M' | 'F';
  Lateralite: 'I' | 'D'; // I = Izquierda (Left), D = Derecha (Right)
  Nation: string;
  LicenceNat?: string;
  dossard: string;
  IdOrigine: string;
}

// Wrestler in pool context
export interface WrestlerInPool {
  REF: string;
  NoDansLaPoule: string;
  NbVictoires: string;
  NbMatches: string;
  TD: string; // Touches Données (Touches Given)
  TR: string; // Touches Reçues (Touches Received)
  RangPoule: string;
}

// Wrestler in tournament phase
export interface WrestlerInPhase {
  REF: string;
  RangInitial: string;
  IdOrigine: string;
}

// Wrestler in match context
export interface WrestlerInMatch {
  REF: string;
  Score?: string;
  Statut?: 'V' | 'D' | '';
  Cote: 'D' | 'G'; // D = Droite (Right), G = Gauche (Left)
}

// Match interface
export interface Match {
  ID: string;
  Tireur: WrestlerInMatch[];
}

// Pool interface
export interface Poule {
  ID: string;
  Match: Match[];
  Tireur: WrestlerInPool[];
}

// Tour de Poules (Pool Phase)
export interface TourDePoules {
  Poule: Poule[];
}

// Phase interface
export interface Phase {
  ID: string;
  Nom: string;
  Tireur: WrestlerInPhase[];
  Tableau: Tableau[];
}

// Tableau interface
export interface Tableau {
  ID: string;
  Nom: string;
  Match: Match[];
}

// Phase de Tableaux (Elimination Phase)
export interface PhaseDeTableaux {
  Phase: Phase[];
}

// Phases interface
export interface Phases {
  TourDePoules: TourDePoules;
  PhaseDeTableaux?: PhaseDeTableaux;
}

// Main Competition interface
export interface WrestlingCompetition {
  Arme: string;
  Sexe: 'M' | 'F';
  Phases: Phases;
}

// Additional interfaces needed for mappers
export interface RSCCodeType {
  discipline: string;
  gender: string;
  sportEvent: string;
  phase: string;
  phaseCode: string;
  unit: string;
}

export interface DateInfo {
  startDate: string;
  endDate: string;
}

export interface MedalInfo {
  gold: {
    participantId: string;
    name: string;
    surname: string;
    delegation: string;
  };
  silver: {
    participantId: string;
    name: string;
    surname: string;
    delegation: string;
  };
  bronze: {
    participantId: string;
    name: string;
    surname: string;
    delegation: string;
  };
}

export interface Description {
  eng: {
    lang: string;
    long: string;
    short: string;
  };
  fra: {
    lang: string;
    long: string;
    short: string;
  };
  spa: {
    lang: string;
    long: string;
    short: string;
  };
}

export interface UnitMetadata {
  discipline: string;
  gender: string;
  sportEvent: string;
  category: string;
  phase: string;
  unit: string;
  phaseCode: string;
}

export interface ConvertedMatch {
  ID: string;
  Tireur: WrestlerInMatch[];
}

export interface SuiteDeTableaux {
  Phase: Phase[];
}

// W2TEC Unit interface
export interface W2TECUnit {
  unitsNumber: number;
  code: string;
  name: string;
  description: Description;
  order: number;
  unitTypeCode: string;
  metadata: UnitMetadata;
  dateInfo: DateInfo;
  location: string;
  hasMedals: boolean;
  medalCodes: string[];
  medalQuantities?: {
    code: string;
    quantity: number;
  }[];
  venue: string;
  status: string;
}

// W2TEC Phase interface
export interface W2TECPhase {
  phaseId: string;
  phaseName: string;
  tireurs: {
    ref: string;
    score: string;
    status: string;
  }[];
}

// Wrestler Status interface
export interface WrestlerStatus {
  ref: string;
  score: string;
  status: 'V' | 'D' | '';
}

// API Response interfaces
export interface WrestlingProcessResponse {
  success: boolean;
  data: W2TECUnit[];
  message: string;
}

export interface WrestlingErrorResponse {
  success: false;
  error: string;
  message: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Poules API Request interface
export interface PoulesApiRequest {
  sportKey: string;
  gender: string;
  poules: {
    id: string;
    name: string;
    matches: {
      id: string;
      wrestlers: {
        ref: string;
        name: string;
        score: string;
        status: string;
      }[];
    }[];
  }[];
}

// XML Data Structure for Wrestling Schedule
export interface WrestlingXmlData {
  OdfBody: {
    Competition: {
      Session: WrestlingSession[];
      Unit: WrestlingUnit[];
    };
  };
}

export interface WrestlingSession {
  SessionCode: string;
  StartDate: string;
  EndDate: string;
  Venue: string;
  VenueName: string;
  SessionType: string;
  ModificationIndicator: string;
  Leadin: string;
  SessionName: {
      Language: string;
      Value: string;
  }[];
  Unit: WrestlingUnit[];
}

export interface WrestlingUnit {
    _Code: string;
    _PhaseType: string;
    _UnitNum: string;
    _ScheduleStatus: string;
    _StartDate: string;
    _EndDate: string;
    _Order: string;
    _Venue: string;
    _Medal: string;
    _Location: string;
    _ModificationIndicator: string;
    _SessionCode: string;
    _HideEndDate: string;
  ItemName: {
      _Language: string;
      _Value: string;
  };
  StartList?: {
    Start: WrestlingStart[];
  };
}

export interface WrestlingStart {
  _StartOrder: string;
  _SortOrder: string;
  Competitor: {
      Code: string;
      Type: string;
      Organisation: string;
    Composition: {
      Athlete: {
        $: {
          Code: string;
          Order: string;
        };
        Description: {
          $: {
            GivenName: string;
            FamilyName: string;
            Gender: string;
            Organisation: string;
            BirthDate: string;
            IFId: string;
          };
        }[];
      }[];
    }[];
  }[];
}

// MQTT Data Structure for Wrestling Competition
export interface MqttWrestlingData {
  DataDic: {
    Protocol: string;
    Com: string;
    Piste: string;
    Compe: string;
    Phase: string;
    PoulTab: string;
    Match: string;
    Round: string;
    Time: string;
    Stopwatch: string;
    Type: string;
    Weapon: string;
    Priority: string;
    State: string;
    RightId: string;
    RightName: string;
    RightNat: string;
    Rscore: string;
    Rstatus: string;
    RYcard: string;
    RRcard: string;
    RLight: string;
    RWlight: string;
    RMedical: string;
    RReserve: string;
    RPcard: string;
    LeftId: string;
    LeftName: string;
    LeftNat: string;
    Lscore: string;
    Lstatus: string;
    LYcard: string;
    LRcard: string;
    LLight: string;
    LWlight: string;
    LMedical: string;
    LReserve: string;
    LPcard: string;
  };
}

// Individual wrestler data from MQTT
export interface MqttWrestlerData {
  id: string;
  name: string;
  nationality: string;
  score: string;
  status: string;
  yellowCard: string;
  redCard: string;
  light: string;
  weaponLight: string;
  medical: string;
  reserve: string;
  pCard: string;
}

// MQTT match data structure
export interface MqttMatchData {
  protocol: string;
  communication: string;
  piste: string;
  competition: string;
  phase: string;
  pouleTable: string;
  match: string;
  round: string;
  time: string;
  stopwatch: string;
  type: string;
  weapon: string;
  priority: string;
  state: string;
  rightFencer: MqttWrestlerData;
  leftFencer: MqttWrestlerData;
}
