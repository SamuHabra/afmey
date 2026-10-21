import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, TrendingUp, Users, Wallet, CreditCard } from 'lucide-react';

export default function Reports() {
  const { users, caisses, mouvements, prets, reunions, distributions, currentUser, parametres } = useApp();
  const [activeTab, setActiveTab] = useState<'general' | 'personnel' | 'reunions' | 'prets'>('general');
  const formatMontant = (n: number) => n.toLocaleString('fr-FR') + ' ' + parametres.devise;

  const patrimoineTotal = caisses.reduce((s, c) => s + c.solde, 0);
  const membresActifs = users.filter(u => u.actif).length;
  const totalEntrees = mouvements.filter(m => m.statut === 'valide' && ['cotisation', 'epargne', 'penalite', 'don', 'remboursement', 'interet'].includes(m.type)).reduce((s, m) => s + m.montant, 0);
  const totalSorties = mouvements.filter(m => m.statut === 'valide' && ['depense', 'distribution', 'pret'].includes(m.type)).reduce((s, m) => s + m.montant, 0);
  const totalPrets = prets.filter(p => p.statut !== 'rejete').reduce((s, p) => s + p.montant, 0);
  const totalRembourse = prets.reduce((s, p) => s + p.remboursements.reduce((ss, r) => ss + r.montant, 0), 0);
  const totalInterets = prets.reduce((s, p) => s + p.interetsGeneres, 0);

  const moisData = [
    { mois: 'Oct', entrees: 180000, sorties: 50000, solde: 1100000 },
    { mois: 'Nov', entrees: 220000, sorties: 100000, solde: 1220000 },
    { mois: 'Déc', entrees: 250000, sorties: 80000, solde: 1390000 },
    { mois: 'Jan', entrees: 495000, sorties: 215000, solde: 1670000 },
    { mois: 'Fév', entrees: 75000, sorties: 0, solde: 1745000 },
  ];

  const typeData = [
    { name: 'Cotisations', value: mouvements.filter(m => m.type === 'cotisation' && m.statut === 'valide').reduce((s, m) => s + m.montant, 0), color: '#6366f1' },
    { name: 'Épargne', value: mouvements.filter(m => m.type === 'epargne' && m.statut === 'valide').reduce((s, m) => s + m.montant, 0), color: '#10b981' },
    { name: 'Pénalités', value: mouvements.filter(m => m.type === 'penalite' && m.statut === 'valide').reduce((s, m) => s + m.montant, 0), color: '#f59e0b' },
    { name: 'Intérêts', value: mouvements.filter(m => m.type === 'interet' && m.statut === 'valide').reduce((s, m) => s + m.montant, 0), color: '#06b6d4' },
    { name: 'Dépenses', value: mouvements.filter(m => m.type === 'depense' && m.statut === 'valide').reduce((s, m) => s + m.montant, 0), color: '#ef4444' },
    { name: 'Distributions', value: mouvements.filter(m => m.type === 'distribution' && m.statut === 'valide').reduce((s, m) => s + m.montant, 0), color: '#ec4899' },
  ].filter(d => d.value > 0);

  // Données personnelles
  const mesMouvements = currentUser ? mouvements.filter(m => m.membreId === currentUser.id && m.statut === 'valide') : [];
  const mesPrets = currentUser ? prets.filter(p => p.membreId === currentUser.id) : [];

  const handleExport = () => {
    const data = { date: new Date().toISOString(), patrimoine: patrimoineTotal, membres: membresActifs, caisses: caisses.map(c => ({ nom: c.nom, solde: c.solde })), totalEntrees, totalSorties, prets: prets.length, reunions: reunions.length };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `rapport-${activeTab}-${new Date().toISOString().split('T')[0]}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'general', label: 'Rapport général' },
    { id: 'personnel', label: 'Mon rapport' },
    { id: 'reunions', label: 'Rapport réunions' },
    { id: 'prets', label: 'Rapport prêts' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm">
          <Download size={18} /> Exporter
        </button>
      </div>

      {activeTab === 'general' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white"><div className="flex items-center gap-2 mb-2"><Wallet size={20} /><span className="text-sm opacity-80">Patrimoine</span></div><p className="text-2xl font-bold">{formatMontant(patrimoineTotal)}</p></div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white"><div className="flex items-center gap-2 mb-2"><TrendingUp size={20} /><span className="text-sm opacity-80">Entrées</span></div><p className="text-2xl font-bold">{formatMontant(totalEntrees)}</p></div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white"><div className="flex items-center gap-2 mb-2"><CreditCard size={20} /><span className="text-sm opacity-80">Sorties</span></div><p className="text-2xl font-bold">{formatMontant(totalSorties)}</p></div>
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-5 text-white"><div className="flex items-center gap-2 mb-2"><Users size={20} /><span className="text-sm opacity-80">Membres</span></div><p className="text-2xl font-bold">{membresActifs}/{users.length}</p></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Évolution du patrimoine</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={moisData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="mois" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000)}k`} /><Tooltip formatter={(value: number) => formatMontant(value)} /><Line type="monotone" dataKey="solde" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} name="Solde" /></LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Répartition par type</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart><Pie data={typeData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{typeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip formatter={(value: number) => formatMontant(value)} /></PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Résumé financier</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Balance nette</p><p className={`text-lg font-bold ${totalEntrees - totalSorties >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatMontant(totalEntrees - totalSorties)}</p></div>
              <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Total prêts</p><p className="text-lg font-bold text-gray-800">{formatMontant(totalPrets)}</p></div>
              <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Total remboursé</p><p className="text-lg font-bold text-green-600">{formatMontant(totalRembourse)}</p></div>
              <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Intérêts générés</p><p className="text-lg font-bold text-emerald-600">{formatMontant(totalInterets)}</p></div>
              <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Réunions</p><p className="text-lg font-bold text-gray-800">{reunions.length}</p></div>
              <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Distributions</p><p className="text-lg font-bold text-gray-800">{distributions.length}</p></div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'personnel' && currentUser && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Mon rapport personnel - {currentUser.prenom} {currentUser.nom}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-indigo-50 rounded-xl text-center"><p className="text-xs text-indigo-600">Total cotisé</p><p className="font-bold text-indigo-800">{formatMontant(mesMouvements.filter(m => m.type === 'cotisation').reduce((s, m) => s + m.montant, 0))}</p></div>
              <div className="p-3 bg-emerald-50 rounded-xl text-center"><p className="text-xs text-emerald-600">Épargne</p><p className="font-bold text-emerald-800">{formatMontant(mesMouvements.filter(m => m.type === 'epargne').reduce((s, m) => s + m.montant, 0))}</p></div>
              <div className="p-3 bg-green-50 rounded-xl text-center"><p className="text-xs text-green-600">Reçu</p><p className="font-bold text-green-800">{formatMontant(mesMouvements.filter(m => ['distribution', 'remboursement'].includes(m.type)).reduce((s, m) => s + m.montant, 0))}</p></div>
              <div className="p-3 bg-amber-50 rounded-xl text-center"><p className="text-xs text-amber-600">Pénalités</p><p className="font-bold text-amber-800">{formatMontant(mesMouvements.filter(m => m.type === 'penalite').reduce((s, m) => s + m.montant, 0))}</p></div>
            </div>
            <h4 className="font-semibold text-gray-800 mb-3">Historique de mes mouvements</h4>
            <div className="space-y-2">
              {mesMouvements.sort((a, b) => b.date.localeCompare(a.date)).map(mvt => (
                <div key={mvt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div><p className="text-sm font-medium text-gray-700">{mvt.description}</p><p className="text-xs text-gray-500">{new Date(mvt.date).toLocaleDateString('fr-FR')}</p></div>
                  <span className={`text-sm font-bold ${['cotisation', 'epargne', 'don', 'remboursement', 'penalite', 'interet'].includes(mvt.type) ? 'text-green-600' : 'text-red-600'}`}>{['cotisation', 'epargne', 'don', 'remboursement', 'penalite', 'interet'].includes(mvt.type) ? '+' : '-'}{formatMontant(mvt.montant)}</span>
                </div>
              ))}
              {mesMouvements.length === 0 && <p className="text-sm text-gray-500">Aucun mouvement</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reunions' && (
        <div className="space-y-4">
          {reunions.filter(r => r.statut === 'terminee').map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div><h4 className="font-bold text-gray-800">{r.titre}</h4><p className="text-sm text-gray-500">{new Date(r.date).toLocaleDateString('fr-FR')} • {r.lieu}</p></div>
                <div className="text-right"><p className="text-sm text-green-600 font-bold">{formatMontant(r.totalCotisations)}</p><p className="text-xs text-gray-500">cotisations</p></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg text-center"><p className="text-xs text-gray-500">Présents</p><p className="font-bold text-green-700">{r.presences.filter(p => p.present).length}/{r.presences.length}</p></div>
                <div className="p-2 bg-blue-50 rounded-lg text-center"><p className="text-xs text-gray-500">Décisions</p><p className="font-bold text-blue-700">{r.decisions.length}</p></div>
                <div className="p-2 bg-purple-50 rounded-lg text-center"><p className="text-xs text-gray-500">Taux présence</p><p className="font-bold text-purple-700">{r.presences.length > 0 ? ((r.presences.filter(p => p.present).length / r.presences.length) * 100).toFixed(0) : 0}%</p></div>
              </div>
              {r.compteRendu && <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500 mb-1">Compte rendu</p><p className="text-sm text-gray-700">{r.compteRendu}</p></div>}
            </div>
          ))}
          {reunions.filter(r => r.statut === 'terminee').length === 0 && <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100"><p>Aucune réunion terminée</p></div>}
        </div>
      )}

      {activeTab === 'prets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Total prêté</p><p className="text-xl font-bold text-gray-800">{formatMontant(totalPrets)}</p></div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Total remboursé</p><p className="text-xl font-bold text-green-600">{formatMontant(totalRembourse)}</p></div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">Intérêts générés</p><p className="text-xl font-bold text-emerald-600">{formatMontant(totalInterets)}</p></div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Détail des prêts</h3>
            <div className="space-y-3">
              {prets.map(pret => {
                const membre = users.find(u => u.id === pret.membreId);
                return (
                  <div key={pret.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{membre?.prenom} {membre?.nom}</p>
                      <p className="text-xs text-gray-500">{pret.motif} • {new Date(pret.dateDemande).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">{formatMontant(pret.montant)}</p>
                      <p className="text-xs text-green-600">Intérêts : {formatMontant(pret.interetsGeneres)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
