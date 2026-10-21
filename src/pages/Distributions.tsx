import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Banknote, X, Check } from 'lucide-react';

export default function Distributions() {
  const { distributions, users, prets, addDistribution, updateDistribution, currentUser, parametres } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formType, setFormType] = useState<'interet_pret' | 'tontine' | 'bonus' | 'dividende'>('interet_pret');
  const [formMontant, setFormMontant] = useState('');
  const [formBeneficiaireId, setFormBeneficiaireId] = useState('');
  const [formMotif, setFormMotif] = useState('');
  const [formSource, setFormSource] = useState('');

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'presidente' || currentUser?.role === 'tresoriere';

  const typeLabels = { interet_pret: 'Intérêt de prêt', tontine: 'Tontine', bonus: 'Bonus', dividende: 'Dividende' };
  const typeColors = { interet_pret: 'bg-emerald-100 text-emerald-700', tontine: 'bg-indigo-100 text-indigo-700', bonus: 'bg-amber-100 text-amber-700', dividende: 'bg-purple-100 text-purple-700' };
  const statutColors = { prevue: 'bg-blue-100 text-blue-700', effectuee: 'bg-green-100 text-green-700', annulee: 'bg-red-100 text-red-700' };
  const formatMontant = (n: number) => n.toLocaleString('fr-FR') + ' ' + parametres.devise;

  // Calcul automatique des intérêts disponibles
  const interetsDisponibles = prets.reduce((sum, p) => sum + p.interetsGeneres, 0);
  const interetsDistribues = distributions.filter(d => d.type === 'interet_pret' && d.statut === 'effectuee').reduce((sum, d) => sum + d.montant, 0);

  const handleAdd = () => {
    if (!formMontant || !formBeneficiaireId || !formMotif) return;
    addDistribution({ type: formType, montant: parseInt(formMontant), beneficiaireId: formBeneficiaireId, motif: formMotif, source: formSource || undefined });
    setFormMontant(''); setFormBeneficiaireId(''); setFormMotif(''); setFormSource(''); setShowAddModal(false);
  };

  const sorted = [...distributions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
          <p className="text-sm opacity-80">Intérêts générés</p>
          <p className="text-2xl font-bold">{formatMontant(interetsDisponibles)}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
          <p className="text-sm opacity-80">Déjà distribués</p>
          <p className="text-2xl font-bold">{formatMontant(interetsDistribues)}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
          <p className="text-sm opacity-80">Disponible</p>
          <p className="text-2xl font-bold">{formatMontant(interetsDisponibles - interetsDistribues)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">Distribution des intérêts et bénéfices</p>
        {canManage && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm">
            <Plus size={18} /> Nouvelle distribution
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Bénéficiaire</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Motif</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                {canManage && <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map(dist => {
                const benef = users.find(u => u.id === dist.beneficiaireId);
                return (
                  <tr key={dist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[dist.type]}`}>{typeLabels[dist.type]}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-700">{benef?.prenom} {benef?.nom}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dist.motif}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">{formatMontant(dist.montant)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(dist.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statutColors[dist.statut]}`}>{dist.statut === 'prevue' ? 'Prévue' : dist.statut === 'effectuee' ? 'Effectuée' : 'Annulée'}</span></td>
                    {canManage && (
                      <td className="px-6 py-4">
                        {dist.statut === 'prevue' && (
                          <button onClick={() => updateDistribution(dist.id, { statut: 'effectuee' })} className="px-2 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 flex items-center gap-1"><Check size={12} /> Effectuer</button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && <div className="text-center py-12 text-gray-500"><Banknote size={48} className="mx-auto mb-3 text-gray-300" /><p>Aucune distribution</p></div>}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-gray-800">Nouvelle distribution</h3><button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={formType} onChange={e => setFormType(e.target.value as any)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaire</label>
                <select value={formBeneficiaireId} onChange={e => setFormBeneficiaireId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Sélectionner</option>
                  {users.filter(u => u.actif).map(u => <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Montant ({parametres.devise})</label><input type="number" value={formMontant} onChange={e => setFormMontant(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="5000" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Motif</label><input type="text" value={formMotif} onChange={e => setFormMotif(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Intérêts prêt..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Source (optionnel)</label><input type="text" value={formSource} onChange={e => setFormSource(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="ID prêt..." /></div>
              <button onClick={handleAdd} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">Créer la distribution</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
