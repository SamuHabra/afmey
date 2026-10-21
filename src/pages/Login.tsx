import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Lock, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { login } = useApp();
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!telephone) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }
    
    const success = login(telephone, password);
    if (success) {
      onLogin();
    } else {
      setError('Numéro non reconnu ou compte inactif');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-indigo-900 font-bold text-2xl">T</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TontinePro</h1>
          <p className="text-indigo-200">Gestion de tontine associative</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Connexion</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
            <p className="text-xs text-indigo-600 font-medium mb-2">Comptes de démonstration :</p>
            <div className="space-y-1 text-xs text-indigo-700">
              <p>📱 +221 77 123 45 67 (Admin)</p>
              <p>📱 +221 77 234 56 78 (Présidente)</p>
              <p>📱 +221 77 345 67 89 (Trésorière)</p>
            </div>
            <p className="text-xs text-indigo-500 mt-2">Mot de passe : aucun (démo)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
