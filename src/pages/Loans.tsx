import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Check, X, Clock, CreditCard } from 'lucide-react';
import { StatutPret } from '../types';

export default function Loans() {
  const { prets, users, addPret, approuverPret, rejeterPret, addRemboursement, currentUser, parametres } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRembModal, setShowRembModal] = useState<string | null>(null);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [rembMontant, setRembMontant] = useState('');
  const [rembNote, setRembNote] = useState('');
  const [formMembreId, setFormMembreId] = useState('');
  const [formMontant, setFormMontant] = useState('');
  const [formMotif, setFormMotif] = useState('');
  const [formEcheance, setFormEcheance] = useState('');

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'presidente';

  const statutLabels: Record<StatutPret, string> = { en_attente: 'En attente', approuve: 'Approuvé', en_cours: 'En cours', rembourse: 'Remboursé', rejete: 'Rejeté' };
  const statutColors: Record<StatutPret, string> = { en_attente: 'bg-amber-100 text-amber-700', approuve: 'bg-blue-100 text-blue-700', en_cours: 'bg-indigo-100 text-indigo-700', rembourse: 'bg-green-100 text-green-700', rejete: 'bg-red-100 text-red-700' };

  const filtered = prets.filter(p => filterStatut === 'all' || p.statut === filterStatut).sort((a, b) => b.dateDemande.localeCompare(a.dateDemande));

  const handleAdd = () => {
    if (!formMembreId || !formMontant || !formMotif || !formEcheance) return;
    addPret({ membreId: formMembreId, montant: parseInt(formMontant), motif: formMotif, dateEcheance: formEcheance, tauxInteret: parametres.tauxInteretPret });
    setFormMembreId(''); setFormMontant(''); setFormMotif(''); setFormEcheance(''); setShowAddModal(false);
  };

  const handleRemb = (pretId: string) => {
    if (!rembMontant) return;
    addRemboursement(pretId, parseInt(rembMontant), rembNote || undefined);
    setRembMontant(''); setRembNote(''); setShowRembModal(null);
  };

  const formatMontant = (n: number) => n.toLocaleString('fr-FR') + ' ' + parametres.devise;
  const totalPrets = prets.filter(p => p.statut !== 'rejete').reduce((s, p) => s + p.montant, 0);
  const totalRestant = prets.filter(p => p.statut === 'en_cours' || p.statut === 'approuve').reduce((s, p) => s + p.montantRestant, 0);
  const totalInterets = prets.reduce((s, p) => s + p.interetsGeneres, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Total prêté</p><p className="text-xl font-bold text-gray-800">{formatMontant(totalPrets)}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Restant dû</p><p className="text-xl font-bold text-amber-600">{formatMontant(totalRestant)}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Intérêts générés</p><p className="text-xl font-bold text-emerald-600">{formatMontant(totalInterets)}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">En attente</p><p className="text-xl font-bold text-blue-600">{prets.filter(p => p.statut === 'en_attente').length}</p></div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="all">Tous les statuts</option>
          {Object.entries(statutLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm">
          <Plus size={18} /> Demander un prêt
        </button>
      </div>

      <div className="space-y-4">
        {filtered.map(pret => {
          const membre = users.find(u => u.id === pret.membreId);
          const progress = ((pret.montant - pret.montantRestant) / pret.montant) * 100;
          return (
            <div key={pret.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center"><CreditCard className="text-indigo-600" size={24} /></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-800">{membre?.prenom} {membre?.nom}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statutColors[pret.statut]}`}>{statutLabels[pret.statut]}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pret.motif}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>Demandé le {new Date(pret.dateDemande).toLocaleDateString('fr-FR')}</span>
                      <span>Échéance : {new Date(pret.dateEcheance).toLocaleDateString('fr-FR')}</span>
                      <span>Taux : {pret.tauxInteret}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">{formatMontant(pret.montant)}</p>
                  <p className="text-sm text-gray-500">Reste : {formatMontant(pret.montantRestant)}</p>
                  <p className="text-xs text-emerald-600">Intérêts : {formatMontant(pret.interetsGeneres)}</p>
                </div>
              </div>
              {(pret.statut === 'en_cours' || pret.statut === 'rembourse') && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Remboursement</span><span>{progress.toFixed(0)}%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }} /></div>
                </div>
              )}
              {pret.remboursements.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Remboursements :</p>
                  <div className="flex flex-wrap gap-2">
                    {pret.remboursements.map(r => (
                      <span key={r.id} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-lg">+{formatMontant(r.montant)} le {new Date(r.date).toLocaleDateString('fr-FR')}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                {pret.statut === 'en_attente' && canManage && (
                  <>
                    <button onClick={() => approuverPret(pret.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"><Check size={14} /> Approuver</button>
                    <button onClick={() => rejeterPret(pret.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"><X size={14} /> Rejeter</button>
                  </>
                )}
                {(pret.statut === 'en_cours' || pret.statut === 'approuve') && (
                  <button onClick={() => setShowRembModal(pret.id)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Clock size={14} /> Remboursement</button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100"><p>Aucun prêt trouvé</p></div>}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-gray-800">Demander un prêt</h3><button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Membre</label><select value={formMembreId} onChange={e => setFormMembreId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"><option value="">Sélectionner</option>{users.filter(u => u.actif).map(u => <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Montant ({parametres.devise})</label><input type="number" value={formMontant} onChange={e => setFormMontant(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="100000" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Motif</label><textarea value={formMotif} onChange={e => setFormMotif(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={2} placeholder="Raison..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Échéance</label><input type="date" value={formEcheance} onChange={e => setFormEcheance(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <p className="text-xs text-gray-500">Taux d'intérêt appliqué : {parametres.tauxInteretPret}%</p>
              <button onClick={handleAdd} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">Soumettre</button>
            </div>
          </div>
        </div>
      )}

      {showRembModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-gray-800">Remboursement</h3><button onClick={() => setShowRembModal(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Montant ({parametres.devise})</label><input type="number" value={rembMontant} onChange={e => setRembMontant(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="50000" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Note (optionnel)</label><input type="text" value={rembNote} onChange={e => setRembNote(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Note..." /></div>
              <button onClick={() => handleRemb(showRembModal)} className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
