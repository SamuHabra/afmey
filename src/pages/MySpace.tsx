import { useApp } from '../context/AppContext';
import { User, Wallet, CreditCard, Calendar, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export default function MySpace() {
  const { currentUser, mouvements, prets, reunions, tontines, distributions, caisses, parametres } = useApp();
  if (!currentUser) return null;

  const formatMontant = (n: number) => n.toLocaleString('fr-FR') + ' ' + parametres.devise;

  // Données personnelles
  const mesMouvements = mouvements.filter(m => m.membreId === currentUser.id && m.statut === 'valide');
  const mesPrets = prets.filter(p => p.membreId === currentUser.id);
  const mesReunions = reunions.filter(r => r.presences.some(p => p.membreId === currentUser.id));
  const mesDistributions = distributions.filter(d => d.beneficiaireId === currentUser.id);

  const totalCotise = mesMouvements.filter(m => m.type === 'cotisation').reduce((s, m) => s + m.montant, 0);
  const totalEpargne = mesMouvements.filter(m => m.type === 'epargne').reduce((s, m) => s + m.montant, 0);
  const totalRecu = mesMouvements.filter(m => ['distribution', 'remboursement'].includes(m.type)).reduce((s, m) => s + m.montant, 0);
  const totalDistributions = mesDistributions.filter(d => d.statut === 'effectuee').reduce((s, d) => s + d.montant, 0);

  const soldeGlobal = mesMouvements.filter(m => ['cotisation', 'epargne', 'penalite', 'don', 'remboursement', 'interet'].includes(m.type)).reduce((s, m) => s + m.montant, 0)
    - mesMouvements.filter(m => ['distribution', 'pret'].includes(m.type)).reduce((s, m) => s + m.montant, 0);

  const pretEnCours = mesPrets.find(p => p.statut === 'en_cours' || p.statut === 'approuve');
  const tontineRang = tontines.find(t => t.statut === 'en_cours')?.rangs.find(r => r.membreId === currentUser.id);

  const roleLabels: Record<string, string> = { admin: 'Administratrice', presidente: 'Présidente', secretaire: 'Secrétaire', tresoriere: 'Trésorière', membre: 'Membre' };

  return (
    <div className="space-y-6">
      {/* Profil */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">{currentUser.prenom[0]}{currentUser.nom[0]}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{currentUser.prenom} {currentUser.nom}</h2>
            <p className="text-indigo-200">{roleLabels[currentUser.role]} • {currentUser.telephone}</p>
            {currentUser.email && <p className="text-indigo-200 text-sm">{currentUser.email}</p>}
          </div>
        </div>
      </div>

      {/* Stats personnelles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><Wallet size={18} className="text-indigo-600" /><span className="text-sm text-gray-500">Mon solde</span></div>
          <p className={`text-xl font-bold ${soldeGlobal >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatMontant(soldeGlobal)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={18} className="text-emerald-600" /><span className="text-sm text-gray-500">Total cotisé</span></div>
          <p className="text-xl font-bold text-gray-800">{formatMontant(totalCotise)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><ArrowUpRight size={18} className="text-blue-600" /><span className="text-sm text-gray-500">Total reçu</span></div>
          <p className="text-xl font-bold text-gray-800">{formatMontant(totalRecu + totalDistributions)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><CreditCard size={18} className="text-amber-600" /><span className="text-sm text-gray-500">Prêt en cours</span></div>
          <p className="text-xl font-bold text-gray-800">{pretEnCours ? formatMontant(pretEnCours.montantRestant) : 'Aucun'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tontine - mon rang */}
        {tontineRang && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ma position dans la tontine</h3>
            <div className="p-4 bg-indigo-50 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-indigo-600">Mon rang</p>
                  <p className="text-3xl font-bold text-indigo-800">#{tontineRang.rang}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-indigo-600">Date prévue</p>
                  <p className="text-lg font-bold text-indigo-800">{new Date(tontineRang.datePrevue).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-indigo-200">
                <p className="text-sm text-indigo-700">Montant à recevoir : <span className="font-bold">{formatMontant(tontineRang.montantRecu || (tontines.find(t => t.statut === 'en_cours')?.montantParRang || 0))}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Mes réunions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Mes réunions</h3>
          <div className="space-y-2">
            {mesReunions.slice(0, 5).map(r => {
              const maPresence = r.presences.find(p => p.membreId === currentUser.id);
              return (
                <div key={r.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{r.titre}</p>
                    <p className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${maPresence?.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {maPresence?.present ? 'Présent(e)' : 'Absent(e)'}
                  </span>
                </div>
              );
            })}
            {mesReunions.length === 0 && <p className="text-sm text-gray-500">Aucune réunion</p>}
          </div>
        </div>
      </div>

      {/* Mes derniers mouvements */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Mes derniers mouvements</h3>
        <div className="space-y-2">
          {mesMouvements.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map(mvt => {
            const isCredit = ['cotisation', 'epargne', 'penalite', 'don', 'remboursement', 'interet'].includes(mvt.type);
            return (
              <div key={mvt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isCredit ? <ArrowUpRight size={16} className="text-green-600" /> : <ArrowDownRight size={16} className="text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{mvt.description}</p>
                    <p className="text-xs text-gray-500">{new Date(mvt.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>{isCredit ? '+' : '-'}{formatMontant(mvt.montant)}</span>
              </div>
            );
          })}
          {mesMouvements.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Aucun mouvement</p>}
        </div>
      </div>
    </div>
  );
}
