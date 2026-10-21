import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, Search, UserCheck, UserX, Eye, X } from 'lucide-react';
import { Role } from '../types';

export default function Members() {
  const { users, mouvements, prets, addMember, toggleMemberStatus, currentUser, parametres } = useApp();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formNom, setFormNom] = useState('');
  const [formPrenom, setFormPrenom] = useState('');
  const [formTelephone, setFormTelephone] = useState('');
  const [formRole, setFormRole] = useState<Role>('membre');
  const [formEmail, setFormEmail] = useState('');

  const roleLabels: Record<string, string> = { admin: 'Administratrice', presidente: 'Présidente', secretaire: 'Secrétaire', tresoriere: 'Trésorière', membre: 'Membre' };
  const roleColors: Record<string, string> = { admin: 'bg-red-100 text-red-700', presidente: 'bg-purple-100 text-purple-700', secretaire: 'bg-blue-100 text-blue-700', tresoriere: 'bg-emerald-100 text-emerald-700', membre: 'bg-gray-100 text-gray-700' };

  const filteredUsers = users.filter(u => {
    const matchSearch = `${u.nom} ${u.prenom} ${u.telephone}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'actif' ? u.actif : !u.actif);
    return matchSearch && matchRole && matchStatus;
  });

  const handleAdd = () => {
    if (!formNom || !formPrenom || !formTelephone) return;
    addMember({ nom: formNom, prenom: formPrenom, telephone: formTelephone, role: formRole, actif: true, email: formEmail || undefined });
    setFormNom(''); setFormPrenom(''); setFormTelephone(''); setFormRole('membre'); setFormEmail('');
    setShowAddModal(false);
  };

  const getMemberSolde = (memberId: string) => {
    const memberTxs = mouvements.filter(m => m.membreId === memberId && m.statut === 'valide');
    const credits = memberTxs.filter(m => ['cotisation', 'epargne', 'penalite', 'don', 'remboursement', 'interet'].includes(m.type)).reduce((sum, m) => sum + m.montant, 0);
    const debits = memberTxs.filter(m => ['distribution', 'pret'].includes(m.type)).reduce((sum, m) => sum + m.montant, 0);
    return credits - debits;
  };

  const selectedUser = selectedMember ? users.find(u => u.id === selectedMember) : null;
  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'presidente';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-gray-500 text-sm">{users.filter(u => u.actif).length} membres actifs sur {users.length} inscrits</p>
        {canManage && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm">
            <UserPlus size={18} /> Nouveau membre
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un membre..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="all">Tous les rôles</option>
          {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="all">Tous les statuts</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Membre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Téléphone</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Solde</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-700 font-semibold text-sm">{user.prenom[0]}{user.nom[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.prenom} {user.nom}</p>
                        <p className="text-xs text-gray-500">Inscrit(e) le {new Date(user.dateInscription).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>{roleLabels[user.role]}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.telephone}</td>
                  <td className="px-6 py-4"><span className={`text-sm font-semibold ${getMemberSolde(user.id) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{getMemberSolde(user.id).toLocaleString('fr-FR')} {parametres.devise}</span></td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${user.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.actif ? <UserCheck size={12} /> : <UserX size={12} />} {user.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedMember(user.id)} className="p-2 hover:bg-gray-100 rounded-lg transition"><Eye size={16} className="text-gray-500" /></button>
                      {canManage && (
                        <button onClick={() => toggleMemberStatus(user.id)} className={`p-2 rounded-lg transition ${user.actif ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}>
                          {user.actif ? <UserX size={16} className="text-red-500" /> : <UserCheck size={16} className="text-green-500" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Nouveau membre</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label><input type="text" value={formPrenom} onChange={e => setFormPrenom(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Prénom" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom</label><input type="text" value={formNom} onChange={e => setFormNom(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nom" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label><input type="tel" value={formTelephone} onChange={e => setFormTelephone(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="+221 77 000 00 00" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email (optionnel)</label><input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="email@exemple.com" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select value={formRole} onChange={e => setFormRole(e.target.value as Role)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="membre">Membre</option><option value="secretaire">Secrétaire</option><option value="tresoriere">Trésorière</option><option value="presidente">Présidente</option><option value="admin">Administratrice</option>
                </select>
              </div>
              <button onClick={handleAdd} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">Ajouter le membre</button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Profil du membre</h3>
              <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center"><span className="text-indigo-700 font-bold text-xl">{selectedUser.prenom[0]}{selectedUser.nom[0]}</span></div>
              <div>
                <h4 className="text-lg font-bold text-gray-800">{selectedUser.prenom} {selectedUser.nom}</h4>
                <p className="text-sm text-gray-500">{selectedUser.telephone}</p>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[selectedUser.role]}`}>{roleLabels[selectedUser.role]}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Solde</p><p className={`text-lg font-bold ${getMemberSolde(selectedUser.id) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{getMemberSolde(selectedUser.id).toLocaleString('fr-FR')} {parametres.devise}</p></div>
              <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Inscription</p><p className="text-lg font-bold text-gray-800">{new Date(selectedUser.dateInscription).toLocaleDateString('fr-FR')}</p></div>
            </div>
            <h5 className="font-semibold text-gray-800 mb-3">Historique</h5>
            <div className="space-y-2">
              {mouvements.filter(m => m.membreId === selectedUser.id).slice(0, 10).map(mvt => (
                <div key={mvt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div><p className="text-sm font-medium text-gray-700">{mvt.description}</p><p className="text-xs text-gray-500">{new Date(mvt.date).toLocaleDateString('fr-FR')}</p></div>
                  <span className={`text-sm font-bold ${['cotisation', 'epargne', 'don', 'remboursement', 'penalite', 'interet'].includes(mvt.type) ? 'text-green-600' : 'text-red-600'}`}>
                    {['cotisation', 'epargne', 'don', 'remboursement', 'penalite', 'interet'].includes(mvt.type) ? '+' : '-'}{mvt.montant.toLocaleString('fr-FR')} F
                  </span>
                </div>
              ))}
              {mouvements.filter(m => m.membreId === selectedUser.id).length === 0 && <p className="text-sm text-gray-500">Aucune transaction</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
