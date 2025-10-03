export declare class MetadataRequestResultDto {
    discipline: string;
    gender: string;
    sportEvent: string;
    category?: string;
    phase: string;
    unit: string;
    phaseCode: string;
    unitCode: string;
    eventModifiers?: string;
    subUnit?: string;
}
export declare class ParticipantRequestResultDto {
    result: string;
    participantId: string;
    name: string;
    surname?: string;
    delegation: string;
    startingOrder: string;
    startingSortOrder: number;
    bib: string;
    street: string;
    decorator: unknown[];
    rk: string;
    rkPo: number;
    irm?: string;
    winner?: boolean;
    wlt?: string;
    qualified?: string;
    difference?: string;
    accumulatedResult?: string;
}
export declare class GroupRequestResultDto {
    result: string;
    groupId: number;
    name: string;
    delegation: string;
    startingOrder: string;
    startingSortOrder: number;
    decorator: unknown[];
    participants: ParticipantRequestResultDto[];
    rk: string;
    rkPo: number;
    irm: string;
    winner: boolean;
    wlt?: string;
    qualified?: string;
    difference?: string;
    bib?: string;
    street?: string;
}
export declare class PeriodResultRequestResultDto {
    result: string;
    unitCode?: string;
    name: string;
    order: number;
    duration?: string;
    distance?: string;
    resHome?: string;
    resAway?: string;
    totalHome?: string;
    totalAway?: string;
    periodId: string;
    participants: ParticipantRequestResultDto[];
    groups: GroupRequestResultDto[];
    decorator: unknown[];
}
export declare class GlobalResultRequestResultDto {
    result: string;
    groups?: GroupRequestResultDto[];
    participants?: ParticipantRequestResultDto[];
    decorator: unknown[];
    current?: string;
    currentPeriod?: string;
    last?: string;
    duration?: string;
}
export declare class CreateResultDto {
    metadata: MetadataRequestResultDto;
    periods: PeriodResultRequestResultDto[];
    splits: unknown[];
    globalResult: GlobalResultRequestResultDto;
    currentPeriod?: string;
    current?: string;
    last?: string;
    duration?: string;
    decorator: unknown[];
    hasStats?: boolean;
    stats?: Record<string, string>;
    officials?: unknown[];
}
