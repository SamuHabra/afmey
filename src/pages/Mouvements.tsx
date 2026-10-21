import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Check, Clock, X, XCircle } from 'lucide-react';
import { TypeMouvement } from '../types';

export default function Mouvements() {
  const { mouvements, caisses, users, addMouvement, validerMouvement, rejeterMouvement, currentUser, parametres } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectMotif, setRejectMotif] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCaisse, setFilterCaisse] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [formType, setFormType] = useState<TypeMouvement>('cotisation');
  const [formMontant, setFormMontant] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCaisseId, setFormCaisseId] = useState(caisses[0]?.id || '');
  const [formMembreId, setFormMembreId] = useState('');

  const canValidate = currentUser?.role === 'admin' || currentUser?.role === 'presidente' || currentUser?.role === 'tresoriere';

  const typeLabels: Record<string, string> = { cotisation: 'Cotisation', epargne: 'Épargne', depense: 'Dépense', penalite: 'Pénalité', don: 'Don', remboursement: 'Remboursement', pret: 'Prêt', distribution: 'Distribution', interet: 'Intérêt' };
  const typeColors: Record<string, string> = { cotisation: 'bg-blue-100 text-blue-700', epargne: 'bg-emerald-100 text-emerald-700', depense: 'bg-red-100 text-red-700', penalite: 'bg-orange-100 text-orange-700', don: 'bg-purple-100 text-purple-700', remboursement: 'bg-teal-100 text-teal-700', pret: 'bg-amber-100 text-amber-700', distribution: 'bg-pink-100 text-pink-700', interet: 'bg-cyan-100 text-cyan-700' };

  const filtered = mouvements.filter(m => {
    const matchType = filterType === 'all' || m.type === filterType;
    const matchCaisse = filterCaisse === 'all' || m.caisseId === filterCaisse;
    const matchStatut = filterStatut === 'all' || m.statut === filterStatut;
    return matchType && matchCaisse && matchStatut;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = () => {
    if (!formMontant || !formCaisseId) return;
    addMouvement({ type: formType, montant: parseInt(formMontant), description: formDescription || typeLabels[formType], caisseId: formCaisseId, membreId: formMembreId || undefined });
    setFormMontant(''); setFormDescription(''); setFormMembreId(''); setShowAddModal(false);
  };

  const handleReject = () => {
    if (showRejectModal && rejectMotif) {
      rejeterMouvement(showRejectModal, rejectMotif);
      setShowRejectModal(null); setRejectMotif('');
    }
  };

  const formatMontant = (n: number) => n.toLocaleString('fr-FR') + ' ' + parametres.devise;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold text-gray-800">{mouvements.length}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Validés</p><p className="text-2xl font-bold text-green-600">{mouvements.filter(m => m.statut === 'valide').length}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">En attente</p><p className="text-2xl font-bold text-amber-600">{mouvements.filter(m => m.statut === 'en_attente').length}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Rejetés</p><p className="text-2xl font-bold text-red-600">{mouvements.filter(m => m.statut === 'rejete').length}</p></div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">Tous</option><option value="en_attente">En attente</option><option value="valide">Validés</option><option value="rejete">Rejetés</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">Tous les types</option>
            {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={filterCaisse} onChange={e => setFilterCaisse(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">Toutes les caisses</option>
            {caisses.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm">
          <Plus size={18} /> Nouveau mouvement
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Caisse</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Membre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                {canValidate && <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(mvt => {
                const caisse = caisses.find(c => c.id === mvt.caisseId);
                const membre = mvt.membreId ? users.find(u => u.id === mvt.membreId) : null;
                const isCredit = ['cotisation', 'epargne', 'penalite', 'don', 'remboursement', 'interet'].includes(mvt.type);
                return (
                  <tr key={mvt.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[mvt.type]}`}>{typeLabels[mvt.type]}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-[200px] truncate">{mvt.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{caisse?.nom}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{membre ? `${membre.prenom} ${membre.nom}` : '-'}</td>
                    <td className="px-6 py-4"><span className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>{isCredit ? '+' : '-'}{formatMontant(mvt.montant)}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(mvt.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4">
                      {mvt.statut === 'valide' && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"><Check size={12} /> Validé</span>}
                      {mvt.statut === 'en_attente' && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium"><Clock size={12} /> En attente</span>}
                      {mvt.statut === 'rejete' && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"><XCircle size={12} /> Rejeté</span>}
                    </td>
                    {canValidate && (
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {mvt.statut === 'en_attente' && (
                            <>
                              <button onClick={() => validerMouvement(mvt.id)} className="px-2 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">Valider</button>
                              <button onClick={() => setShowRejectModal(mvt.id)} className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700">Rejeter</button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-500"><p>Aucun mouvement trouvé</p></div>}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Nouveau mouvement</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={formType} onChange={e => setFormType(e.target.value as TypeMouvement)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Montant ({parametres.devise})</label><input type="number" value={formMontant} onChange={e => setFormMontant(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="25000" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Caisse</label>
                <select value={formCaisseId} onChange={e => setFormCaisseId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                  {caisses.filter(c => c.actif).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Membre (optionnel)</label>
                <select value={formMembreId} onChange={e => setFormMembreId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Aucun</option>
                  {users.filter(u => u.actif).map(u => <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input type="text" value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Description..." /></div>
              <button onClick={handleAdd} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Rejeter le mouvement</h3>
              <button onClick={() => setShowRejectModal(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Motif du rejet</label><textarea value={rejectMotif} onChange={e => setRejectMotif(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={3} placeholder="Raison du rejet..." /></div>
              <button onClick={handleReject} className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition">Confirmer le rejet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
