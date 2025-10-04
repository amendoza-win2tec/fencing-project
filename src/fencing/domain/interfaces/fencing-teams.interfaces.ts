// Fencing Teams interfaces based on the JSON structure with _ prefixes
export interface TeamMember {
  _ID: string;
  _Nom: string;
  _Prenom: string;
  _DateNaissance?: string;
  _Sexe: 'M' | 'F';
  _Lateralite: 'I' | 'D' | 'G';
  _Nation: string;
  _LicenceNat?: string;
  _dossard: string;
  _IdOrigine: string;
}

export interface Team {
  Tireur: TeamMember[];
  _ID: string;
  _Nom: string;
  _Nation: string;
}

export interface TeamInMatch {
  _REF: string;
  _Statut?: 'V' | 'D' | '';
  _Place?: string;
  _Cote?: 'D' | 'G';
}

export interface TeamMatch {
  Equipe: (TeamInMatch | string)[];
  _ID: string;
  _Date: string;
  _Heure?: string;
  _Piste?: string;
}

export interface TeamTableau {
  Match: TeamMatch[] | TeamMatch;
  _ID: string;
  _Titre: string;
  _Taille: string;
}

export interface TeamSuiteDeTableaux {
  Tableau: TeamTableau[];
  _ID: string;
  _Titre: string;
  _NbDeTableaux: string;
}

export interface TeamEquipe {
  _REF: string;
  _RangInitial: string;
  _IdOrigine: string;
}

export interface TeamPhaseDeTableaux {
  Equipe: TeamEquipe[];
  SuiteDeTableaux: TeamSuiteDeTableaux;
  _PhaseID: string;
  _ID: string;
}

export interface TeamPhases {
  PhaseDeTableaux: TeamPhaseDeTableaux;
}

export interface TeamCompetition {
  Equipes: {
    Equipe: Team[];
  };
  Arbitres: string;
  Phases: TeamPhases;
  _Version: string;
  _Championnat: string;
  _Annee: string;
  _Arme: string;
  _Sexe: 'M' | 'F';
  _Domaine: string;
  _Categorie: string;
  _Date: string;
  _TitreCourt: string;
  _TitreLong: string;
}

export interface FencingTeamsCompetition {
  CompetitionParEquipes: TeamCompetition;
}
