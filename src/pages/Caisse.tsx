import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Wallet, TrendingUp, TrendingDown, X } from 'lucide-react';

export default function Caisse() {
  const { caisses, mouvements, addCaisse, currentUser, parametres } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCaisse, setSelectedCaisse] = useState<string | null>(null);
  const [formNom, setFormNom] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'presidente' || currentUser?.role === 'tresoriere';

  const getCaisseStats = (caisseId: string) => {
    const caisseMvts = mouvements.filter(m => m.caisseId === caisseId && m.statut === 'valide');
    const entrees = caisseMvts.filter(m => ['cotisation', 'epargne', 'penalite', 'don', 'remboursement', 'interet'].includes(m.type)).reduce((sum, m) => sum + m.montant, 0);
    const sorties = caisseMvts.filter(m => ['depense', 'distribution', 'pret'].includes(m.type)).reduce((sum, m) => sum + m.montant, 0);
    return { entrees, sorties, nb: caisseMvts.length };
  };

  const handleAdd = () => {
    if (!formNom) return;
    addCaisse({ nom: formNom, description: formDescription, actif: true });
    setFormNom(''); setFormDescription(''); setShowAddModal(false);
  };

  const selected = selectedCaisse ? caisses.find(c => c.id === selectedCaisse) : null;
  const selectedMvts = selectedCaisse ? mouvements.filter(m => m.caisseId === selectedCaisse).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const formatMontant = (n: number) => n.toLocaleString('fr-FR') + ' ' + parametres.devise;

  const typeLabels: Record<string, string> = { cotisation: 'Cotisation', epargne: 'Épargne', depense: 'Dépense', penalite: 'Pénalité', don: 'Don', remboursement: 'Remboursement', pret: 'Prêt', distribution: 'Distribution', interet: 'Intérêt' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{caisses.filter(c => c.actif).length} caisse(s) active(s)</p>
        {canManage && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm">
            <Plus size={18} /> Nouvelle caisse
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {caisses.map(caisse => {
          const stats = getCaisseStats(caisse.id);
          return (
            <div key={caisse.id} onClick={() => setSelectedCaisse(caisse.id)} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:border-indigo-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center"><Wallet className="text-indigo-600" size={24} /></div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${caisse.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{caisse.actif ? 'Active' : 'Inactive'}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{caisse.nom}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{caisse.description}</p>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-2xl font-bold text-gray-800 mb-3">{formatMontant(caisse.solde)}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-green-600"><TrendingUp size={14} /><span>{formatMontant(stats.entrees)}</span></div>
                  <div className="flex items-center gap-1 text-red-500"><TrendingDown size={14} /><span>{formatMontant(stats.sorties)}</span></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{stats.nb} mouvements</p>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Nouvelle caisse</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom</label><input type="text" value={formNom} onChange={e => setFormNom(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Caisse Principale" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={3} placeholder="Description..." /></div>
              <button onClick={handleAdd} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">Créer la caisse</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-lg font-bold text-gray-800">{selected.nom}</h3><p className="text-sm text-gray-500">{selected.description}</p></div>
              <button onClick={() => setSelectedCaisse(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-indigo-50 rounded-xl text-center"><p className="text-xs text-indigo-600 font-medium">Solde</p><p className="text-lg font-bold text-indigo-800">{formatMontant(selected.solde)}</p></div>
              <div className="p-4 bg-green-50 rounded-xl text-center"><p className="text-xs text-green-600 font-medium">Entrées</p><p className="text-lg font-bold text-green-800">{formatMontant(getCaisseStats(selected.id).entrees)}</p></div>
              <div className="p-4 bg-red-50 rounded-xl text-center"><p className="text-xs text-red-600 font-medium">Sorties</p><p className="text-lg font-bold text-red-800">{formatMontant(getCaisseStats(selected.id).sorties)}</p></div>
            </div>
            <h4 className="font-semibold text-gray-800 mb-3">Historique</h4>
            <div className="space-y-2">
              {selectedMvts.map(mvt => {
                const isCredit = ['cotisation', 'epargne', 'penalite', 'don', 'remboursement', 'interet'].includes(mvt.type);
                return (
                  <div key={mvt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                        {isCredit ? <TrendingUp size={14} className="text-green-600" /> : <TrendingDown size={14} className="text-red-600" />}
                      </div>
                      <div><p className="text-sm font-medium text-gray-800">{typeLabels[mvt.type]}</p><p className="text-xs text-gray-500">{mvt.description} • {new Date(mvt.date).toLocaleDateString('fr-FR')}</p></div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>{isCredit ? '+' : '-'}{formatMontant(mvt.montant)}</p>
                      {mvt.statut === 'en_attente' && <span className="text-xs text-amber-600">⏳ En attente</span>}
                      {mvt.statut === 'rejete' && <span className="text-xs text-red-600">✗ Rejeté</span>}
                    </div>
                  </div>
                );
              })}
              {selectedMvts.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Aucun mouvement</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
