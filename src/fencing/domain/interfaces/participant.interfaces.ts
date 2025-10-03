export interface Participant {
  idParticipant: string;
  name: string;
  surname: string;
  gender: {
    code: string;
  };
  code: string;
  organisation: {
    code: string;
  };
  function: string;
}

export interface ParticipantLookupResult {
  participant: Participant | null;
  index: number;
}

export interface ParticipantSearchFilters {
  name?: string;
  surname?: string;
  code?: string;
  organisation?: string;
  gender?: string;
  function?: string;
}

export interface ParticipantSearchResult {
  participants: Participant[];
  total: number;
  filters: ParticipantSearchFilters;
}