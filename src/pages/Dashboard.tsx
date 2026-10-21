import { useApp } from '../context/AppContext';
import { Users, Wallet, CreditCard, Calendar, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { users, caisses, mouvements, prets, reunions, tontines, parametres } = useApp();

  const membresActifs = users.filter(u => u.actif).length;
  const patrimoineTotal = caisses.reduce((sum, c) => sum + c.solde, 0);
  const pretsEnCours = prets.filter(p => p.statut === 'en_cours' || p.statut === 'approuve');
  const montantPrets = pretsEnCours.reduce((sum, p) => sum + p.montantRestant, 0);
  const prochaineReunion = reunions.filter(r => r.statut === 'planifiee' || r.statut === 'en_cours').sort((a, b) => a.date.localeCompare(b.date))[0];
  const tontineEnCours = tontines.find(t => t.statut === 'en_cours');

  const mvtValides = mouvements.filter(m => m.statut === 'valide');
  const totalEntrees = mvtValides.filter(m => ['cotisation', 'epargne', 'penalite', 'don', 'remboursement', 'interet'].includes(m.type)).reduce((sum, m) => sum + m.montant, 0);
  const totalSorties = mvtValides.filter(m => ['depense', 'distribution', 'pret'].includes(m.type)).reduce((sum, m) => sum + m.montant, 0);

  const moisData = [
    { mois: 'Oct', entrees: 180000, sorties: 50000 },
    { mois: 'Nov', entrees: 220000, sorties: 100000 },
    { mois: 'Déc', entrees: 250000, sorties: 80000 },
    { mois: 'Jan', entrees: 495000, sorties: 215000 },
    { mois: 'Fév', entrees: 75000, sorties: 0 },
  ];

  const caissesData = caisses.map(c => ({ name: c.nom, value: c.solde }));
  const COLORS = ['#6366f1', '#8b5cf6', '#f59e0b'];

  const recentMvt = [...mouvements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const formatMontant = (n: number) => n.toLocaleString('fr-FR') + ' ' + parametres.devise;

  const typeLabels: Record<string, string> = {
    cotisation: 'Cotisation', epargne: 'Épargne', depense: 'Dépense', penalite: 'Pénalité',
    don: 'Don', remboursement: 'Remboursement', pret: 'Prêt', distribution: 'Distribution', interet: 'Intérêt'
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center"><Users className="text-indigo-600" size={24} /></div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Actifs</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{membresActifs}</p>
          <p className="text-sm text-gray-500 mt-1">Membres actifs</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center"><Wallet className="text-emerald-600" size={24} /></div>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full"><TrendingUp size={12} className="mr-1" /> +12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatMontant(patrimoineTotal)}</p>
          <p className="text-sm text-gray-500 mt-1">Patrimoine total</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center"><CreditCard className="text-amber-600" size={24} /></div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">En cours</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatMontant(montantPrets)}</p>
          <p className="text-sm text-gray-500 mt-1">{pretsEnCours.length} prêt(s) actif(s)</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><Calendar className="text-purple-600" size={24} /></div>
          </div>
          {prochaineReunion ? (
            <>
              <p className="text-lg font-bold text-gray-800">{new Date(prochaineReunion.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
              <p className="text-sm text-gray-500 mt-1 truncate">{prochaineReunion.titre}</p>
            </>
          ) : (
            <><p className="text-lg font-bold text-gray-800">Aucune</p><p className="text-sm text-gray-500 mt-1">Prochaine réunion</p></>
          )}
        </div>
      </div>

      {tontineEnCours && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Tontine en cours</p>
              <h3 className="text-xl font-bold">{tontineEnCours.nom}</h3>
              <p className="text-sm opacity-80 mt-1">Cycle {tontineEnCours.cycleActuel} • Rang suivant : {tontineEnCours.rangs.find(r => r.statut === 'en_attente')?.rang || 'Terminé'}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{formatMontant(tontineEnCours.montantParRang)}</p>
              <p className="text-sm opacity-80">par rang</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Mouvements financiers</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={moisData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000)}k`} />
              <Tooltip formatter={(value: number) => formatMontant(value)} />
              <Bar dataKey="entrees" fill="#6366f1" radius={[4, 4, 0, 0]} name="Entrées" />
              <Bar dataKey="sorties" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Sorties" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Répartition des caisses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={caissesData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name }) => name.split(' ')[1]}>
                {caissesData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip formatter={(value: number) => formatMontant(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {caisses.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-gray-600">{c.nom}</span>
                </div>
                <span className="font-medium text-gray-800">{formatMontant(c.solde)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Derniers mouvements</h3>
          <div className="space-y-3">
            {recentMvt.map(mvt => {
              const isCredit = ['cotisation', 'epargne', 'penalite', 'don', 'remboursement', 'interet'].includes(mvt.type);
              return (
                <div key={mvt.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                      {isCredit ? <ArrowUpRight size={16} className="text-green-600" /> : <ArrowDownRight size={16} className="text-red-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{typeLabels[mvt.type]}</p>
                      <p className="text-xs text-gray-500">{new Date(mvt.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>{isCredit ? '+' : '-'}{formatMontant(mvt.montant)}</p>
                    {mvt.statut === 'en_attente' && <span className="text-xs text-amber-600">En attente</span>}
                    {mvt.statut === 'rejete' && <span className="text-xs text-red-600">Rejeté</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Prêts en cours</h3>
          <div className="space-y-3">
            {pretsEnCours.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun prêt en cours</p>
            ) : pretsEnCours.map(pret => {
              const membre = users.find(u => u.id === pret.membreId);
              const progress = ((pret.montant - pret.montantRestant) / pret.montant) * 100;
              return (
                <div key={pret.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{membre?.prenom} {membre?.nom}</p>
                      <p className="text-xs text-gray-500">{pret.motif}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{formatMontant(pret.montantRestant)}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% remboursé • Intérêts: {formatMontant(pret.interetsGeneres)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
