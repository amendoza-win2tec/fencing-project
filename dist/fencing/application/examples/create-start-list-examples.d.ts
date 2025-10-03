import { FencingToParticipantMapper } from '../mapper/fencing-to-participant.mapper';
export declare class CreateStartListExamples {
    private readonly fencingToParticipantMapper;
    constructor(fencingToParticipantMapper: FencingToParticipantMapper);
    createBasicStartList(): import("../../domain/interfaces/fencing-participant.interfaces").CreateStartListDto;
    createCustomStartList(): import("../../domain/interfaces/fencing-participant.interfaces").CreateStartListDto;
    createPhaseStartList(phase: string, unit: string): import("../../domain/interfaces/fencing-participant.interfaces").CreateStartListDto;
    createFullStartList(): import("../../domain/interfaces/fencing-participant.interfaces").CreateStartListDto;
    createGenderCategoryStartList(gender: string, category: string): import("../../domain/interfaces/fencing-participant.interfaces").CreateStartListDto;
    runAllExamples(): void;
}
