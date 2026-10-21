import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, User, Caisse, Mouvement, Pret, Reunion, Tontine, Distribution, Exercice, Parametres, Presence, StatutMouvement, StatutPret, StatutReunion, StatutTontine, Role } from '../types';
import { initialUsers, initialCaisses, initialMouvements, initialPrets, initialReunions, initialTontines, initialDistributions, initialExercices, initialParametres } from '../data/initialData';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType extends AppState {
  login: (telephone: string, password: string) => boolean;
  logout: () => void;
  addMember: (user: Omit<User, 'id' | 'dateInscription'>) => void;
  toggleMemberStatus: (id: string) => void;
  updateMember: (id: string, data: Partial<User>) => void;
  addCaisse: (caisse: Omit<Caisse, 'id' | 'dateCreation' | 'solde'>) => void;
  addMouvement: (mvt: Omit<Mouvement, 'id' | 'statut' | 'date'>) => void;
  validerMouvement: (id: string) => void;
  rejeterMouvement: (id: string, motif: string) => void;
  addPret: (pret: Omit<Pret, 'id' | 'dateDemande' | 'statut' | 'montantRestant' | 'remboursements' | 'interetsGeneres'>) => void;
  approuverPret: (id: string) => void;
  rejeterPret: (id: string) => void;
  addRemboursement: (pretId: string, montant: number, note?: string) => void;
  addReunion: (reunion: Omit<Reunion, 'id' | 'presences' | 'totalCotisations' | 'totalDepenses'>) => void;
  updateReunion: (id: string, data: Partial<Reunion>) => void;
  togglePresence: (reunionId: string, membreId: string) => void;
  toggleCotisation: (reunionId: string, membreId: string) => void;
  demarrerReunion: (id: string) => void;
  terminerReunion: (id: string, compteRendu: string) => void;
  addTontine: (tontine: Omit<Tontine, 'id' | 'rangs' | 'cycleActuel'>) => void;
  updateTontine: (id: string, data: Partial<Tontine>) => void;
  addDistribution: (dist: Omit<Distribution, 'id' | 'date' | 'statut'>) => void;
  updateDistribution: (id: string, data: Partial<Distribution>) => void;
  cloturerExercice: (id: string) => void;
  ouvrirExercice: (annee: number) => void;
  updateParametres: (data: Partial<Parametres>) => void;
  getUserById: (id: string) => User | undefined;
  getCaisseById: (id: string) => Caisse | undefined;
  getExerciceActuel: () => Exercice | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const STORAGE_KEY = 'tontine_pro_v2';

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error(e); }
  return {
    currentUser: null, users: initialUsers, caisses: initialCaisses,
    mouvements: initialMouvements, prets: initialPrets, reunions: initialReunions,
    tontines: initialTontines, distributions: initialDistributions,
    exercices: initialExercices, parametres: initialParametres
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);

  const login = (telephone: string, _password: string): boolean => {
    const user = state.users.find(u => u.telephone === telephone && u.actif);
    if (user) { setState(prev => ({ ...prev, currentUser: user })); return true; }
    return false;
  };

  const logout = () => setState(prev => ({ ...prev, currentUser: null }));

  const addMember = (userData: Omit<User, 'id' | 'dateInscription'>) => {
    const newUser: User = { ...userData, id: uuidv4(), dateInscription: new Date().toISOString().split('T')[0] };
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
  };

  const toggleMemberStatus = (id: string) => {
    setState(prev => ({ ...prev, users: prev.users.map(u => u.id === id ? { ...u, actif: !u.actif } : u) }));
  };

  const updateMember = (id: string, data: Partial<User>) => {
    setState(prev => ({ ...prev, users: prev.users.map(u => u.id === id ? { ...u, ...data } : u) }));
  };

  const addCaisse = (caisseData: Omit<Caisse, 'id' | 'dateCreation' | 'solde'>) => {
    const newCaisse: Caisse = { ...caisseData, id: uuidv4(), solde: 0, dateCreation: new Date().toISOString().split('T')[0] };
    setState(prev => ({ ...prev, caisses: [...prev.caisses, newCaisse] }));
  };

  const addMouvement = (mvt: Omit<Mouvement, 'id' | 'statut' | 'date'>) => {
    const newMvt: Mouvement = { ...mvt, id: uuidv4(), date: new Date().toISOString().split('T')[0], statut: 'en_attente' };
    setState(prev => ({ ...prev, mouvements: [...prev.mouvements, newMvt] }));
  };

  const validerMouvement = (id: string) => {
    setState(prev => {
      const mvt = prev.mouvements.find(m => m.id === id);
      if (!mvt || mvt.statut === 'valide') return prev;
      const isCredit = ['cotisation', 'epargne', 'penalite', 'don', 'remboursement', 'interet'].includes(mvt.type);
      const caisses = prev.caisses.map(c => c.id === mvt.caisseId ? { ...c, solde: isCredit ? c.solde + mvt.montant : c.solde - mvt.montant } : c);
      const mouvements = prev.mouvements.map(m => m.id === id ? { ...m, statut: 'valide' as StatutMouvement, validePar: prev.currentUser?.id, dateValidation: new Date().toISOString().split('T')[0] } : m);
      return { ...prev, caisses, mouvements };
    });
  };

  const rejeterMouvement = (id: string, motif: string) => {
    setState(prev => ({
      ...prev,
      mouvements: prev.mouvements.map(m => m.id === id ? { ...m, statut: 'rejete' as StatutMouvement, motifRejet: motif } : m)
    }));
  };

  const addPret = (pretData: Omit<Pret, 'id' | 'dateDemande' | 'statut' | 'montantRestant' | 'remboursements' | 'interetsGeneres'>) => {
    const newPret: Pret = { ...pretData, id: uuidv4(), dateDemande: new Date().toISOString().split('T')[0], statut: 'en_attente', montantRestant: pretData.montant, remboursements: [], interetsGeneres: 0 };
    setState(prev => ({ ...prev, prets: [...prev.prets, newPret] }));
  };

  const approuverPret = (id: string) => {
    setState(prev => ({ ...prev, prets: prev.prets.map(p => p.id === id ? { ...p, statut: 'approuve' as StatutPret, dateApprobation: new Date().toISOString().split('T')[0], approuvePar: prev.currentUser?.id } : p) }));
  };

  const rejeterPret = (id: string) => {
    setState(prev => ({ ...prev, prets: prev.prets.map(p => p.id === id ? { ...p, statut: 'rejete' as StatutPret } : p) }));
  };

  const addRemboursement = (pretId: string, montant: number, note?: string) => {
    setState(prev => {
      const prets = prev.prets.map(p => {
        if (p.id === pretId) {
          const newR = { id: uuidv4(), pretId, montant, date: new Date().toISOString().split('T')[0], note };
          const newRestant = p.montantRestant - montant;
          const interets = montant * (p.tauxInteret / 100);
          return { ...p, montantRestant: Math.max(0, newRestant), statut: newRestant <= 0 ? 'rembourse' as StatutPret : 'en_cours' as StatutPret, remboursements: [...p.remboursements, newR], interetsGeneres: p.interetsGeneres + interets };
        }
        return p;
      });
      return { ...prev, prets };
    });
  };

  const addReunion = (reunionData: Omit<Reunion, 'id' | 'presences' | 'totalCotisations' | 'totalDepenses'>) => {
    const presences: Presence[] = state.users.filter(u => u.actif).map(u => ({ membreId: u.id, present: false, cotisationPayee: false, montantCotise: 0 }));
    const newReunion: Reunion = { ...reunionData, id: uuidv4(), presences, totalCotisations: 0, totalDepenses: 0 };
    setState(prev => ({ ...prev, reunions: [...prev.reunions, newReunion] }));
  };

  const updateReunion = (id: string, data: Partial<Reunion>) => {
    setState(prev => ({ ...prev, reunions: prev.reunions.map(r => r.id === id ? { ...r, ...data } : r) }));
  };

  const togglePresence = (reunionId: string, membreId: string) => {
    setState(prev => ({
      ...prev,
      reunions: prev.reunions.map(r => {
        if (r.id !== reunionId) return r;
        const presences = r.presences.map(p => p.membreId === membreId ? { ...p, present: !p.present } : p);
        return { ...r, presences };
      })
    }));
  };

  const toggleCotisation = (reunionId: string, membreId: string) => {
    setState(prev => ({
      ...prev,
      reunions: prev.reunions.map(r => {
        if (r.id !== reunionId) return r;
        const presences = r.presences.map(p => {
          if (p.membreId !== membreId) return p;
          const newPayee = !p.cotisationPayee;
          return { ...p, cotisationPayee: newPayee, montantCotise: newPayee ? prev.parametres.montantCotisation : 0 };
        });
        const totalCotisations = presences.reduce((sum, p) => sum + p.montantCotise, 0);
        return { ...r, presences, totalCotisations };
      })
    }));
  };

  const demarrerReunion = (id: string) => {
    setState(prev => ({ ...prev, reunions: prev.reunions.map(r => r.id === id ? { ...r, statut: 'en_cours' as StatutReunion } : r) }));
  };

  const terminerReunion = (id: string, compteRendu: string) => {
    setState(prev => ({
      ...prev,
      reunions: prev.reunions.map(r => {
        if (r.id !== id) return r;
        const totalDepenses = prev.mouvements.filter(m => m.caisseId === 'c1' && m.statut === 'valide' && m.type === 'depense' && m.date >= r.date).reduce((s, m) => s + m.montant, 0);
        return { ...r, statut: 'terminee' as StatutReunion, compteRendu, totalDepenses };
      })
    }));
  };

  const addTontine = (tontineData: Omit<Tontine, 'id' | 'rangs' | 'cycleActuel'>) => {
    const membresActifs = state.users.filter(u => u.actif);
    const rangs = membresActifs.map((u, i) => ({
      rang: i + 1, membreId: u.id,
      datePrevue: new Date(new Date(tontineData.dateDebut).getTime() + i * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      montantRecu: 0, statut: 'en_attente' as const
    }));
    const newTontine: Tontine = { ...tontineData, id: uuidv4(), rangs, cycleActuel: 1 };
    setState(prev => ({ ...prev, tontines: [...prev.tontines, newTontine] }));
  };

  const updateTontine = (id: string, data: Partial<Tontine>) => {
    setState(prev => ({ ...prev, tontines: prev.tontines.map(t => t.id === id ? { ...t, ...data } : t) }));
  };

  const addDistribution = (dist: Omit<Distribution, 'id' | 'date' | 'statut'>) => {
    const newDist: Distribution = { ...dist, id: uuidv4(), date: new Date().toISOString().split('T')[0], statut: 'prevue' };
    setState(prev => ({ ...prev, distributions: [...prev.distributions, newDist] }));
  };

  const updateDistribution = (id: string, data: Partial<Distribution>) => {
    setState(prev => ({ ...prev, distributions: prev.distributions.map(d => d.id === id ? { ...d, ...data } : d) }));
  };

  const cloturerExercice = (id: string) => {
    setState(prev => {
      const ex = prev.exercices.find(e => e.id === id);
      if (!ex) return prev;
      const soldeCloture = prev.caisses.reduce((s, c) => s + c.solde, 0);
      return {
        ...prev,
        exercices: prev.exercices.map(e => e.id === id ? { ...e, statut: 'cloture' as const, dateCloture: new Date().toISOString().split('T')[0], soldeCloture } : e)
      };
    });
  };

  const ouvrirExercice = (annee: number) => {
    const newEx: Exercice = { id: uuidv4(), annee, dateOuverture: new Date().toISOString().split('T')[0], statut: 'ouvert' };
    setState(prev => ({ ...prev, exercices: [...prev.exercices, newEx] }));
  };

  const updateParametres = (data: Partial<Parametres>) => {
    setState(prev => ({ ...prev, parametres: { ...prev.parametres, ...data } }));
  };

  const getUserById = (id: string) => state.users.find(u => u.id === id);
  const getCaisseById = (id: string) => state.caisses.find(c => c.id === id);
  const getExerciceActuel = () => state.exercices.find(e => e.statut === 'ouvert');

  return (
    <AppContext.Provider value={{
      ...state, login, logout, addMember, toggleMemberStatus, updateMember, addCaisse,
      addMouvement, validerMouvement, rejeterMouvement, addPret, approuverPret, rejeterPret,
      addRemboursement, addReunion, updateReunion, togglePresence, toggleCotisation,
      demarrerReunion, terminerReunion, addTontine, updateTontine, addDistribution,
      updateDistribution, cloturerExercice, ouvrirExercice, updateParametres,
      getUserById, getCaisseById, getExerciceActuel
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
