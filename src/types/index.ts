export type Role = 'admin' | 'presidente' | 'secretaire' | 'tresoriere' | 'membre';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: Role;
  actif: boolean;
  dateInscription: string;
  email?: string;
  photo?: string;
  rangTontine?: number;
}

export interface Caisse {
  id: string;
  nom: string;
  description: string;
  solde: number;
  dateCreation: string;
  actif: boolean;
}

export type TypeMouvement = 'cotisation' | 'epargne' | 'depense' | 'penalite' | 'don' | 'remboursement' | 'pret' | 'distribution' | 'interet';
export type StatutMouvement = 'en_attente' | 'valide' | 'rejete';

export interface Mouvement {
  id: string;
  type: TypeMouvement;
  montant: number;
  description: string;
  caisseId: string;
  membreId?: string;
  date: string;
  statut: StatutMouvement;
  validePar?: string;
  dateValidation?: string;
  motifRejet?: string;
}

export type StatutPret = 'en_attente' | 'approuve' | 'en_cours' | 'rembourse' | 'rejete';

export interface Pret {
  id: string;
  membreId: string;
  montant: number;
  montantRestant: number;
  motif: string;
  tauxInteret: number;
  dateDemande: string;
  dateApprobation?: string;
  dateEcheance: string;
  statut: StatutPret;
  approuvePar?: string;
  remboursements: Remboursement[];
  interetsGeneres: number;
}

export interface Remboursement {
  id: string;
  pretId: string;
  montant: number;
  date: string;
  note?: string;
}

export type StatutReunion = 'planifiee' | 'en_cours' | 'terminee' | 'annulee';

export interface Presence {
  membreId: string;
  present: boolean;
  cotisationPayee: boolean;
  montantCotise: number;
  arrivee?: string;
}

export interface Reunion {
  id: string;
  titre: string;
  date: string;
  heure: string;
  lieu: string;
  description: string;
  ordreDuJour: string[];
  decisions: string[];
  compteRendu: string;
  presences: Presence[];
  totalCotisations: number;
  totalDepenses: number;
  statut: StatutReunion;
  distributionMontant?: number;
  exerciceId: string;
}

export type StatutTontine = 'planifiee' | 'en_cours' | 'terminee' | 'suspendue';

export interface RangTontine {
  rang: number;
  membreId: string;
  datePrevue: string;
  dateEffective?: string;
  montantRecu: number;
  statut: 'en_attente' | 'recu' | 'reporte';
}

export interface Tontine {
  id: string;
  nom: string;
  description: string;
  montantParRang: number;
  frequence: 'hebdomadaire' | 'mensuel' | 'bimensuel';
  dateDebut: string;
  dateFin?: string;
  statut: StatutTontine;
  rangs: RangTontine[];
  cycleActuel: number;
  exerciceId: string;
}

export interface Distribution {
  id: string;
  type: 'interet_pret' | 'tontine' | 'bonus' | 'dividende';
  montant: number;
  beneficiaireId: string;
  date: string;
  motif: string;
  source?: string;
  statut: 'prevue' | 'effectuee' | 'annulee';
}

export interface Exercice {
  id: string;
  annee: number;
  dateOuverture: string;
  dateCloture?: string;
  statut: 'ouvert' | 'cloture';
  soldeCloture?: number;
}

export interface Parametres {
  montantCotisation: number;
  penaliteRetard: number;
  tauxInteretPret: number;
  dureeMaxPretMois: number;
  montantMaxPret: number;
  frequenceReunion: 'hebdomadaire' | 'mensuel' | 'bimensuel';
  jourReunion: string;
  devise: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  caisses: Caisse[];
  mouvements: Mouvement[];
  prets: Pret[];
  reunions: Reunion[];
  tontines: Tontine[];
  distributions: Distribution[];
  exercices: Exercice[];
  parametres: Parametres;
}
