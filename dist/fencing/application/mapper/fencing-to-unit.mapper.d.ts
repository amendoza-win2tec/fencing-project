import { Poule, TireurStatus, W2TECUnit, ConvertedMatch, SuiteDeTableaux } from '../../domain/interfaces/fencing.interfaces';
export declare const convertPouleToMatch: (poule: Poule, _sportEvent: string) => ConvertedMatch[];
export declare const convertEliminationToMatch: (elimination: SuiteDeTableaux, _sportEvent: string, _gender: string) => ConvertedMatch[];
export declare const mapToW2tecPhases: (match: ConvertedMatch, name: string, progressionId: string, tireurStatus: TireurStatus[], shortName: string, gender: string) => W2TECUnit;
