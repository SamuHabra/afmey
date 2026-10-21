import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, DollarSign, Users, Calendar, Lock, AlertTriangle, Check } from 'lucide-react';

export default function SettingsPage() {
  const { parametres, updateParametres, exercices, cloturerExercice, ouvrirExercice, users, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'financier' | 'roles' | 'exercice'>('financier');
  const [newAnnee, setNewAnnee] = useState(new Date().getFullYear() + 1);
  const [saved, setSaved] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const handleSaveParams = (data: Partial<typeof parametres>) => {
    updateParametres(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const [localParams, setLocalParams] = useState(parametres);

  const tabs = [
    { id: 'financier', label: 'Configuration financière', icon: DollarSign },
    { id: 'roles', label: 'Gestion des rôles', icon: Users },
    { id: 'exercice', label: 'Exercice annuel', icon: Calendar },
  ];

  const roleLabels: Record<string, string> = { admin: 'Administratrice', presidente: 'Présidente', secretaire: 'Secrétaire', tresoriere: 'Trésorière', membre: 'Membre' };
  const rolePermissions: Record<string, string[]> = {
    admin: ['Tout gérer', 'Clôturer exercice', 'Gérer les rôles', 'Valider mouvements', 'Gérer caisses'],
    presidente: ['Valider mouvements', 'Approuver prêts', 'Gérer réunions', 'Gérer tontine'],
    tresoriere: ['Valider mouvements', 'Gérer caisses', 'Voir rapports'],
    secretaire: ['Gérer réunions', 'Rédiger PV', 'Voir rapports'],
    membre: ['Voir mon espace', 'Demander un prêt', 'Voir réunions']
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-pulse">
          <Check size={18} /> Paramètres sauvegardés
        </div>
      )}

      <div className="flex gap-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'financier' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Configuration financière</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant cotisation mensuelle (FCFA)</label>
              <input type="number" value={localParams.montantCotisation} onChange={e => setLocalParams({ ...localParams, montantCotisation: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pénalité de retard (FCFA)</label>
              <input type="number" value={localParams.penaliteRetard} onChange={e => setLocalParams({ ...localParams, penaliteRetard: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taux d'intérêt des prêts (%)</label>
              <input type="number" value={localParams.tauxInteretPret} onChange={e => setLocalParams({ ...localParams, tauxInteretPret: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée max prêt (mois)</label>
              <input type="number" value={localParams.dureeMaxPretMois} onChange={e => setLocalParams({ ...localParams, dureeMaxPretMois: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant max prêt (FCFA)</label>
              <input type="number" value={localParams.montantMaxPret} onChange={e => setLocalParams({ ...localParams, montantMaxPret: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
              <input type="text" value={localParams.devise} onChange={e => setLocalParams({ ...localParams, devise: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence des réunions</label>
              <select value={localParams.frequenceReunion} onChange={e => setLocalParams({ ...localParams, frequenceReunion: e.target.value as any })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="hebdomadaire">Hebdomadaire</option>
                <option value="bimensuel">Bimensuel</option>
                <option value="mensuel">Mensuel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jour de réunion</label>
              <select value={localParams.jourReunion} onChange={e => setLocalParams({ ...localParams, jourReunion: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="lundi">Lundi</option><option value="mardi">Mardi</option><option value="mercredi">Mercredi</option>
                <option value="jeudi">Jeudi</option><option value="vendredi">Vendredi</option><option value="samedi">Samedi</option><option value="dimanche">Dimanche</option>
              </select>
            </div>
          </div>
          {isAdmin && (
            <button onClick={() => handleSaveParams(localParams)} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
              Sauvegarder les paramètres
            </button>
          )}
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Gestion des rôles et permissions</h3>
          <div className="space-y-4">
            {Object.entries(rolePermissions).map(([role, perms]) => (
              <div key={role} className="p-4 border border-gray-100 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Lock size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{roleLabels[role]}</h4>
                    <p className="text-xs text-gray-500">{users.filter(u => u.role === role).length} membre(s)</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {perms.map(perm => (
                    <span key={perm} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-lg">{perm}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'exercice' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Gestion des exercices annuels</h3>
            <div className="space-y-3">
              {exercices.map(ex => (
                <div key={ex.id} className={`p-4 rounded-xl border ${ex.statut === 'ouvert' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800">Exercice {ex.annee}</h4>
                      <p className="text-sm text-gray-500">Ouvert le {new Date(ex.dateOuverture).toLocaleDateString('fr-FR')}{ex.dateCloture ? ` • Clôturé le ${new Date(ex.dateCloture).toLocaleDateString('fr-FR')}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {ex.soldeCloture && <p className="text-sm font-bold text-gray-700">Solde : {ex.soldeCloture.toLocaleString('fr-FR')} FCFA</p>}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ex.statut === 'ouvert' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {ex.statut === 'ouvert' ? '🟢 Ouvert' : '🔒 Clôturé'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" /> Clôturer l'exercice en cours</h4>
                <p className="text-sm text-gray-600 mb-4">La clôture va figer toutes les données de l'exercice et calculer le solde de clôture.</p>
                {exercices.filter(e => e.statut === 'ouvert').map(ex => (
                  <button key={ex.id} onClick={() => { if (confirm(`Clôturer l'exercice ${ex.annee} ?`)) cloturerExercice(ex.id); }} className="px-4 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition">
                    Clôturer {ex.annee}
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar size={18} className="text-indigo-500" /> Ouvrir un nouvel exercice</h4>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                    <input type="number" value={newAnnee} onChange={e => setNewAnnee(parseInt(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <button onClick={() => ouvrirExercice(newAnnee)} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
                    Ouvrir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
