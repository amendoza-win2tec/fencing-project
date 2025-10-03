/**
 * Interfaces for Fencing Competition Data Structure
 * Based on the XML parsing result from fencing competitions
 */

// Base Tireur (Fencer) interface
export interface Tireur {
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

// Tireur in pool context
export interface TireurInPool {
  REF: string;
  NoDansLaPoule: string;
  NbVictoires: string;
  NbMatches: string;
  TD: string; // Touches Données (Touches Given)
  TR: string; // Touches Reçues (Touches Received)
  RangPoule: string;
}

// Tireur in tournament phase
export interface TireurInPhase {
  REF: string;
  RangInitial: string;
  IdOrigine: string;
}

// Tireur in match context
export interface TireurInMatch {
  REF: string;
  Score?: string;
  Statut?: 'V' | 'D' | '';
  Cote: 'D' | 'G'; // D = Droite (Right), G = Gauche (Left)
}

// Match interface
export interface Match {
  ID: string;
  Tireur: TireurInMatch[];
}

// Pool (Poule) interface
export interface Poule {
  ID: string;
  Piste: string;
  Date: string;
  Heure: string;
  Tireur: TireurInPool[];
  Match: Match[];
}

// Pool Phase interface
export interface TourDePoules {
  PhaseID: string;
  ID: string;
  NbDePoules: string;
  PhaseSuivanteDesQualifies: string;
  NbExemptes: string;
  NbQualifiesParPoule: string;
  NbQualifiesParIndice: string;
  Tireur: TireurInPhase[];
  Poule: Poule[];
}

// Tireur in elimination phase
export interface TireurInElimination {
  REF: string;
  RangInitial: string;
  RangFinal?: string;
  IdOrigine: string;
}

// Match in elimination phase
export interface MatchInElimination {
  ID: string;
  Date: string;
  Heure: string;
  Piste: string;
  Tireur: TireurInMatch[];
  Arbitre?: {
    REF: string;
    Role: 'P' | 'V' | 'A'; // P = Principal, V = Video, A = Assistant
  }[];
}

// Tableau (elimination bracket) interface
export interface Tableau {
  ID: string;
  Titre: string;
  Taille: string;
  DestinationDesElimines?: string;
  Match: MatchInElimination[];
}

// Suite de Tableaux (elimination series)
export interface SuiteDeTableaux {
  ID: string;
  Titre: string;
  NbDeTableaux: string;
  Tableau: Tableau[];
}

// Phase de Tableaux (elimination phase)
export interface PhaseDeTableaux {
  PhaseID: string;
  ID: string;
  Tireur: TireurInElimination[];
  SuiteDeTableaux: SuiteDeTableaux[];
}

// Phases container
export interface Phases {
  TourDePoules: TourDePoules;
  PhaseDeTableaux?: PhaseDeTableaux;
}

// Main competition interface
export interface FencingCompetition {
  Version: string;
  Championnat: string;
  Annee: string;
  Arme: string; // S = Sabre, F = Foil, E = Épée
  Sexe: 'M' | 'F';
  Domaine: string; // R = Regional, N = National, I = International
  Categorie: string; // U23, U20, U17, etc.
  Date: string;
  TitreCourt: string;
  TitreLong: string;
  Equipes : Equipe[];
  Tireurs: {
    Tireur: Tireur[];
  };
  Arbitres: string;
  Phases: Phases;
}

// Response interface for API
export interface FencingProcessResponse {
  success: boolean;
  data: any; // This will be the processed result from FencingService
  message: string;
}

// Error response interface
export interface FencingErrorResponse {
  success: false;
  error: string;
  message: string;
}

// Mapper and Unit interfaces
export interface TireurStatus {
  ref: string;
  score: string;
  status: 'V' | 'D' | '';
}

export interface RSCCodeType {
  discipline: string;
  gender: string;
  sportEvent: string;
  phase: string;
  phaseCode: string;
  unit: string;
  rscCode: string;
}

export interface DateInfo {
  startDate: string;
  endDate: string;
}

export interface MedalInfo {
  hasMedals: boolean;
  medalCodes: string[];
  medalQuantities?: {
    code: string;
    quantity: number;
  }[];
}

export interface Description {
  eng: {
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

export interface ConvertedMatch {
  ID: string;
  Tireur: TireurInMatch[];
  sportEvent: string;
  combatNumber: string;
  startDate: string;
  startTime: string;
  location: string;
  gender: string;
  phase: string;
}

// API interfaces
export interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export interface PoulesApiRequest {
  competitionId: string;
  poules: Poule[];
  metadata: {
    competitionName: string;
    date: string;
    weapon: string;
    gender: string;
  };
}

// API request for elimination phases
export interface EliminationApiRequest {
  competitionId: string;
  phaseDeTableaux: PhaseDeTableaux[];
  metadata: {
    competitionName: string;
    date: string;
    weapon: string;
    gender: string;
  };
}

// Processed elimination match
export interface ProcessedEliminationMatch {
  matchId: string;
  date: string;
  time: string;
  piste: string;
  tireurs: {
    ref: string;
    score: string;
    status: 'V' | 'D' | '';
    cote: 'D' | 'G';
    place?: string;
  }[];
  arbitres: {
    ref: string;
    role: 'P' | 'V' | 'A';
  }[];
}

// Processed tableau
export interface ProcessedTableau {
  tableauId: string;
  title: string;
  size: number;
  destinationDesElimines?: string;
  matches: ProcessedEliminationMatch[];
}

// Processed elimination phase
export interface ProcessedEliminationPhase {
  phaseId: string;
  phaseName: string;
  tireurs: {
    ref: string;
    rangInitial: string;
    rangFinal?: string;
    idOrigine: string;
  }[];
  tableaux: ProcessedTableau[];
}

// MQTT Data Structure for Fencing Competition
export interface MqttFencingData {
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

// Individual fencer data from MQTT
export interface MqttFencerData {
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
  rightFencer: MqttFencerData;
  leftFencer: MqttFencerData;
}

// Team competition interfaces based on MS_Team_Table.xml structure

// Team member (Tireur in team context)
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

// Team (Equipe)
export interface Equipe {
  ID: string;
  Nom: string;
  Nation: string;
  Tireur: TeamMember[];
}

// Team in match context
export interface EquipeInMatch {
  REF: string;
  Statut?: 'V' | 'D' | '';
  Place?: string;
  Cote?: 'D' | 'G';
}

// Team match
export interface TeamMatch {
  ID: string;
  Date: string;
  Heure?: string;
  Piste?: string;
  Equipe: EquipeInMatch[];
}

// Team tableau
export interface TeamTableau {
  ID: string;
  Titre: string;
  Taille: string;
  Match: TeamMatch[];
}

// Team suite de tableaux
export interface TeamSuiteDeTableaux {
  ID: string;
  Titre: string;
  NbDeTableaux: string;
  Tableau: TeamTableau[];
}

// Team phase de tableaux
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

// Team competition (CompetitionParEquipes)
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
    Equipe: Equipe[];
  };
  Arbitres?: string;
  Phases: {
    PhaseDeTableaux: TeamPhaseDeTableaux;
  };
}
