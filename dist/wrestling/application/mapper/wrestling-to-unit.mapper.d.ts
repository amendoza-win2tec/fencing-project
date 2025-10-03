import { Poule, W2TECUnit, ConvertedMatch } from '../../domain/interfaces/wrestling.interfaces';
export declare const convertPouleToMatch: (poule: Poule, sportEvent: string) => ConvertedMatch[];
export declare const convertEliminationToMatch: (phase: any, sportEvent: string) => ConvertedMatch[];
export declare const mapToW2tecPhases: (code: string, name: string, phaseType: string, unitNum: string, scheduleStatus: string, startDate: string, endDate: string, order: string, venue: string, medal: string, location: string, sessionCode: string) => W2TECUnit;
