import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, CircleDot, X, Play, Pause } from 'lucide-react';
import { StatutTontine } from '../types';

export default function Tontine() {
  const { tontines, users, addTontine, updateTontine, currentUser, parametres } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formNom, setFormNom] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMontant, setFormMontant] = useState('');
  const [formFrequence, setFormFrequence] = useState<'hebdomadaire' | 'mensuel' | 'bimensuel'>('mensuel');
  const [formDateDebut, setFormDateDebut] = useState('');

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'presidente';

  const statutLabels: Record<StatutTontine, string> = { planifiee: 'Planifiée', en_cours: 'En cours', terminee: 'Terminée', suspendue: 'Suspendue' };
  const statutColors: Record<StatutTontine, string> = { planifiee: 'bg-blue-100 text-blue-700', en_cours: 'bg-green-100 text-green-700', terminee: 'bg-gray-100 text-gray-700', suspendue: 'bg-amber-100 text-amber-700' };
  const formatMontant = (n: number) => n.toLocaleString('fr-FR') + ' ' + parametres.devise;

  const handleAdd = () => {
    if (!formNom || !formMontant || !formDateDebut) return;
    addTontine({ nom: formNom, description: formDescription, montantParRang: parseInt(formMontant), frequence: formFrequence, dateDebut: formDateDebut, statut: 'planifiee', exerciceId: 'ex1' });
    setFormNom(''); setFormDescription(''); setFormMontant(''); setFormFrequence('mensuel'); setFormDateDebut('');
    setShowAddModal(false);
  };

  const selected = selectedId ? tontines.find(t => t.id === selectedId) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Tontines actives</p><p className="text-2xl font-bold text-green-600">{tontines.filter(t => t.statut === 'en_cours').length}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Planifiées</p><p className="text-2xl font-bold text-blue-600">{tontines.filter(t => t.statut === 'planifiee').length}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Terminées</p><p className="text-2xl font-bold text-gray-600">{tontines.filter(t => t.statut === 'terminee').length}</p></div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">Planification et suivi des cycles de tontine</p>
        {canManage && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm">
            <Plus size={18} /> Nouvelle tontine
          </button>
        )}
      </div>

      <div className="space-y-4">
        {tontines.map(tontine => {
          const rangActuel = tontine.rangs.find(r => r.statut === 'en_attente');
          const rangsRecus = tontine.rangs.filter(r => r.statut === 'recu').length;
          const progress = (rangsRecus / tontine.rangs.length) * 100;
          return (
            <div key={tontine.id} onClick={() => setSelectedId(tontine.id)} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:border-indigo-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${tontine.statut === 'en_cours' ? 'bg-green-100' : tontine.statut === 'planifiee' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <CircleDot className={tontine.statut === 'en_cours' ? 'text-green-600' : tontine.statut === 'planifiee' ? 'text-blue-600' : 'text-gray-600'} size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-800">{tontine.nom}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statutColors[tontine.statut]}`}>{statutLabels[tontine.statut]}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tontine.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>Début : {new Date(tontine.dateDebut).toLocaleDateString('fr-FR')}</span>
                      <span>Fréquence : {tontine.frequence}</span>
                      <span>Cycle : {tontine.cycleActuel}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">{formatMontant(tontine.montantParRang)}</p>
                  <p className="text-xs text-gray-500">par rang</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progression : {rangsRecus}/{tontine.rangs.length} rangs</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${progress}%` }} /></div>
                {rangActuel && <p className="text-xs text-gray-500 mt-1">Prochain rang : #{rangActuel.rang}</p>}
              </div>
            </div>
          );
        })}
        {tontines.length === 0 && <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100"><CircleDot size={48} className="mx-auto mb-3 text-gray-300" /><p>Aucune tontine configurée</p></div>}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-gray-800">Nouvelle tontine</h3><button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom</label><input type="text" value={formNom} onChange={e => setFormNom(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Tontine Mensuelle 2025" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={2} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Montant par rang ({parametres.devise})</label><input type="number" value={formMontant} onChange={e => setFormMontant(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="200000" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                <select value={formFrequence} onChange={e => setFormFrequence(e.target.value as any)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="hebdomadaire">Hebdomadaire</option><option value="bimensuel">Bimensuel</option><option value="mensuel">Mensuel</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label><input type="date" value={formDateDebut} onChange={e => setFormDateDebut(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <button onClick={handleAdd} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">Créer la tontine</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-lg font-bold text-gray-800">{selected.nom}</h3><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statutColors[selected.statut]}`}>{statutLabels[selected.statut]}</span></div>
              <button onClick={() => setSelectedId(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-indigo-50 rounded-xl text-center"><p className="text-xs text-indigo-600">Montant/rang</p><p className="font-bold text-indigo-800">{formatMontant(selected.montantParRang)}</p></div>
              <div className="p-3 bg-green-50 rounded-xl text-center"><p className="text-xs text-green-600">Rangs reçus</p><p className="font-bold text-green-800">{selected.rangs.filter(r => r.statut === 'recu').length}/{selected.rangs.length}</p></div>
              <div className="p-3 bg-purple-50 rounded-xl text-center"><p className="text-xs text-purple-600">Cycle</p><p className="font-bold text-purple-800">{selected.cycleActuel}</p></div>
            </div>

            <h4 className="font-semibold text-gray-800 mb-3">Ordre des rangs</h4>
            <div className="space-y-2">
              {selected.rangs.map(rang => {
                const membre = users.find(u => u.id === rang.membreId);
                return (
                  <div key={rang.rang} className={`flex items-center justify-between p-3 rounded-xl ${rang.statut === 'recu' ? 'bg-green-50' : rang.statut === 'en_attente' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${rang.statut === 'recu' ? 'bg-green-500 text-white' : rang.statut === 'en_attente' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>#{rang.rang}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{membre?.prenom} {membre?.nom}</p>
                        <p className="text-xs text-gray-500">Prévu le {new Date(rang.datePrevue).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${rang.statut === 'recu' ? 'bg-green-100 text-green-700' : rang.statut === 'en_attente' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {rang.statut === 'recu' ? `Reçu (${formatMontant(rang.montantRecu)})` : rang.statut === 'en_attente' ? 'En attente' : 'Reporté'}
                    </span>
                  </div>
                );
              })}
            </div>

            {canManage && (
              <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                {selected.statut === 'planifiee' && <button onClick={() => { updateTontine(selected.id, { statut: 'en_cours' }); setSelectedId(null); }} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 text-sm"><Play size={14} /> Démarrer</button>}
                {selected.statut === 'en_cours' && <button onClick={() => { updateTontine(selected.id, { statut: 'suspendue' }); setSelectedId(null); }} className="flex items-center gap-1 px-4 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 text-sm"><Pause size={14} /> Suspendre</button>}
                {selected.statut === 'suspendue' && <button onClick={() => { updateTontine(selected.id, { statut: 'en_cours' }); setSelectedId(null); }} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 text-sm"><Play size={14} /> Reprendre</button>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
