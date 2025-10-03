export class MetadataRequestStartListDto {
  discipline!: string;
  gender!: string;
  sportEvent!: string;
  category!: string;
  phase!: string;
  unit!: string;
  subUnit: string | undefined;
  phaseCode!: string;
  unitCode!: string;
}

export class ParticipantRequestStartListDto {
  participantId!: string;
  name!: string;
  surname!: string;
  delegation!: string;
  startingOrder!: number;
  startingSortOrder!: number;
  bib!: string;
  street!: string;
  decorator!: unknown[];
}

export class GroupRequestStartListDto {
  groupId!: number;
  name!: string;
  delegation!: string;
  startingOrder!: number;
  startingSortOrder!: number;
  bib!: string;
  street!: string;
  decorator!: unknown[];
}

export class CreateStartListDto {
  metadata!: MetadataRequestStartListDto;
  participants!: ParticipantRequestStartListDto[];
  groups!: GroupRequestStartListDto[];
}
