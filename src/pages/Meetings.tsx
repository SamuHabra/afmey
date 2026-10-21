import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Calendar, MapPin, Clock, Users, X, Check, Play, Square, UserCheck } from 'lucide-react';
import { StatutReunion } from '../types';

export default function Meetings() {
  const { reunions, users, addReunion, updateReunion, togglePresence, toggleCotisation, demarrerReunion, terminerReunion, currentUser, parametres } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compteRendu, setCompteRendu] = useState('');
  const [formTitre, setFormTitre] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formHeure, setFormHeure] = useState('15:00');
  const [formLieu, setFormLieu] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formOrdreDuJour, setFormOrdreDuJour] = useState('');
  const [formDistribution, setFormDistribution] = useState('');

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'presidente' || currentUser?.role === 'secretaire';
  const exerciceActuel = reunions[0]?.exerciceId || 'ex1';

  const statutLabels: Record<StatutReunion, string> = { planifiee: 'Planifiée', en_cours: 'En cours', terminee: 'Terminée', annulee: 'Annulée' };
  const statutColors: Record<StatutReunion, string> = { planifiee: 'bg-blue-100 text-blue-700', en_cours: 'bg-amber-100 text-amber-700', terminee: 'bg-green-100 text-green-700', annulee: 'bg-red-100 text-red-700' };

  const handleAdd = () => {
    if (!formTitre || !formDate || !formHeure || !formLieu) return;
    addReunion({
      titre: formTitre, date: formDate, heure: formHeure, lieu: formLieu, description: formDescription,
      ordreDuJour: formOrdreDuJour.split('\n').filter(x => x.trim()), decisions: [], compteRendu: '',
      statut: 'planifiee', distributionMontant: formDistribution ? parseInt(formDistribution) : undefined, exerciceId: exerciceActuel
    });
    setFormTitre(''); setFormDate(''); setFormHeure('15:00'); setFormLieu(''); setFormDescription(''); setFormOrdreDuJour(''); setFormDistribution('');
    setShowAddModal(false);
  };

  const sorted = [...reunions].sort((a, b) => {
    const order = { en_cours: 0, planifiee: 1, terminee: 2, annulee: 3 };
    if (order[a.statut] !== order[b.statut]) return order[a.statut] - order[b.statut];
    return b.date.localeCompare(a.date);
  });

  const selected = selectedId ? reunions.find(r => r.id === selectedId) : null;
  const formatMontant = (n: number) => n.toLocaleString('fr-FR') + ' ' + parametres.devise;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold text-gray-800">{reunions.length}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Planifiées</p><p className="text-2xl font-bold text-blue-600">{reunions.filter(r => r.statut === 'planifiee').length}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">En cours</p><p className="text-2xl font-bold text-amber-600">{reunions.filter(r => r.statut === 'en_cours').length}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Terminées</p><p className="text-2xl font-bold text-green-600">{reunions.filter(r => r.statut === 'terminee').length}</p></div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">Gestion des réunions avec présence et finances</p>
        {canManage && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm">
            <Plus size={18} /> Planifier une réunion
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sorted.map(reunion => {
          const nbPresents = reunion.presences.filter(p => p.present).length;
          return (
            <div key={reunion.id} onClick={() => setSelectedId(reunion.id)} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:border-indigo-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${reunion.statut === 'planifiee' ? 'bg-indigo-100' : reunion.statut === 'en_cours' ? 'bg-amber-100' : reunion.statut === 'terminee' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <span className={`text-xs font-medium ${reunion.statut === 'planifiee' ? 'text-indigo-600' : reunion.statut === 'en_cours' ? 'text-amber-600' : reunion.statut === 'terminee' ? 'text-green-600' : 'text-red-600'}`}>{new Date(reunion.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                    <span className={`text-lg font-bold ${reunion.statut === 'planifiee' ? 'text-indigo-800' : reunion.statut === 'en_cours' ? 'text-amber-800' : reunion.statut === 'terminee' ? 'text-green-800' : 'text-red-800'}`}>{new Date(reunion.date).getDate()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-800">{reunion.titre}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statutColors[reunion.statut]}`}>{statutLabels[reunion.statut]}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{reunion.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={12} /> {reunion.heure}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {reunion.lieu}</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {nbPresents}/{reunion.presences.length} présents</span>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  {reunion.totalCotisations > 0 && <p className="text-sm"><span className="text-gray-500">Cotisations : </span><span className="font-bold text-green-600">{formatMontant(reunion.totalCotisations)}</span></p>}
                  {reunion.distributionMontant && <p className="text-sm"><span className="text-gray-500">Distribution : </span><span className="font-bold text-indigo-600">{formatMontant(reunion.distributionMontant)}</span></p>}
                </div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100"><Calendar size={48} className="mx-auto mb-3 text-gray-300" /><p>Aucune réunion</p></div>}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-gray-800">Planifier une réunion</h3><button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Titre</label><input type="text" value={formTitre} onChange={e => setFormTitre(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Réunion mensuelle..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Heure</label><input type="time" value={formHeure} onChange={e => setFormHeure(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label><input type="text" value={formLieu} onChange={e => setFormLieu(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Salle..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={2} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Ordre du jour (1 par ligne)</label><textarea value={formOrdreDuJour} onChange={e => setFormOrdreDuJour(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={3} placeholder="Point 1&#10;Point 2" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Distribution prévue ({parametres.devise})</label><input type="number" value={formDistribution} onChange={e => setFormDistribution(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="200000" /></div>
              <button onClick={handleAdd} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">Planifier</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-lg font-bold text-gray-800">{selected.titre}</h3><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statutColors[selected.statut]}`}>{statutLabels[selected.statut]}</span></div>
              <button onClick={() => { setSelectedId(null); setCompteRendu(''); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-gray-50 rounded-xl text-center"><p className="text-xs text-gray-500">Date</p><p className="font-bold text-gray-800">{new Date(selected.date).toLocaleDateString('fr-FR')}</p></div>
              <div className="p-3 bg-gray-50 rounded-xl text-center"><p className="text-xs text-gray-500">Heure</p><p className="font-bold text-gray-800">{selected.heure}</p></div>
              <div className="p-3 bg-gray-50 rounded-xl text-center"><p className="text-xs text-gray-500">Lieu</p><p className="font-bold text-gray-800 text-xs">{selected.lieu}</p></div>
            </div>

            {/* Présences */}
            {(selected.statut === 'en_cours' || selected.statut === 'terminee') && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><UserCheck size={18} /> Présences & Cotisations</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selected.presences.map(p => {
                      const membre = users.find(u => u.id === p.membreId);
                      if (!membre) return null;
                      return (
                        <div key={p.membreId} className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); togglePresence(selected.id, p.membreId); }}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${p.present ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                            >
                              {p.present && <Check size={14} className="text-white" />}
                            </button>
                            <span className={`text-sm ${p.present ? 'text-gray-800' : 'text-gray-400'}`}>{membre.prenom} {membre.nom}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleCotisation(selected.id, p.membreId); }}
                            className={`px-2 py-0.5 rounded text-xs font-medium ${p.cotisationPayee ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                          >
                            {p.cotisationPayee ? `${parametres.montantCotisation.toLocaleString('fr-FR')} F ✓` : 'Cotisation'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
                    <span className="text-gray-600">Présents : {selected.presences.filter(p => p.present).length}/{selected.presences.length}</span>
                    <span className="font-bold text-green-600">Total cotisations : {formatMontant(selected.totalCotisations)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ordre du jour */}
            {selected.ordreDuJour.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Ordre du jour</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  {selected.ordreDuJour.map((item, i) => <li key={i}>{item}</li>)}
                </ol>
              </div>
            )}

            {/* Décisions */}
            {selected.decisions.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Décisions</h4>
                <ul className="space-y-1">{selected.decisions.map((d, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />{d}</li>)}</ul>
              </div>
            )}

            {/* Compte rendu */}
            {selected.compteRendu && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Compte rendu</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{selected.compteRendu}</p>
              </div>
            )}

            {/* Actions */}
            {canManage && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {selected.statut === 'planifiee' && (
                  <button onClick={() => demarrerReunion(selected.id)} className="flex items-center gap-1 px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 text-sm"><Play size={14} /> Démarrer</button>
                )}
                {selected.statut === 'en_cours' && (
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Compte rendu</label>
                    <textarea value={compteRendu} onChange={e => setCompteRendu(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-2" rows={3} placeholder="Rédigez le compte rendu..." />
                    <button onClick={() => { terminerReunion(selected.id, compteRendu); setSelectedId(null); setCompteRendu(''); }} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 text-sm"><Square size={14} /> Terminer la réunion</button>
                  </div>
                )}
                {selected.statut === 'planifiee' && (
                  <button onClick={() => { updateReunion(selected.id, { statut: 'annulee' }); setSelectedId(null); }} className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 text-sm">Annuler</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
