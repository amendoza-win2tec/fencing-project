export interface Tireur {
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
export interface TireurInPool {
    REF: string;
    NoDansLaPoule: string;
    NbVictoires: string;
    NbMatches: string;
    TD: string;
    TR: string;
    RangPoule: string;
}
export interface TireurInPhase {
    REF: string;
    RangInitial: string;
    IdOrigine: string;
}
export interface TireurInMatch {
    REF: string;
    Score?: string;
    Statut?: 'V' | 'D' | '';
    Cote: 'D' | 'G';
}
export interface Match {
    ID: string;
    Tireur: TireurInMatch[];
}
export interface Poule {
    ID: string;
    Piste: string;
    Date: string;
    Heure: string;
    Tireur: TireurInPool[];
    Match: Match[];
}
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
export interface TireurInElimination {
    REF: string;
    RangInitial: string;
    RangFinal?: string;
    IdOrigine: string;
}
export interface MatchInElimination {
    ID: string;
    Date: string;
    Heure: string;
    Piste: string;
    Tireur: TireurInMatch[];
    Arbitre?: {
        REF: string;
        Role: 'P' | 'V' | 'A';
    }[];
}
export interface Tableau {
    ID: string;
    Titre: string;
    Taille: string;
    DestinationDesElimines?: string;
    Match: MatchInElimination[];
}
export interface SuiteDeTableaux {
    ID: string;
    Titre: string;
    NbDeTableaux: string;
    Tableau: Tableau[];
}
export interface PhaseDeTableaux {
    PhaseID: string;
    ID: string;
    Tireur: TireurInElimination[];
    SuiteDeTableaux: SuiteDeTableaux[];
}
export interface Phases {
    TourDePoules: TourDePoules;
    PhaseDeTableaux?: PhaseDeTableaux;
}
export interface FencingCompetition {
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
    Tireurs: {
        Tireur: Tireur[];
    };
    Arbitres: string;
    Phases: Phases;
}
export interface FencingProcessResponse {
    success: boolean;
    data: any;
    message: string;
}
export interface FencingErrorResponse {
    success: false;
    error: string;
    message: string;
}
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
export interface ProcessedTableau {
    tableauId: string;
    title: string;
    size: number;
    destinationDesElimines?: string;
    matches: ProcessedEliminationMatch[];
}
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
