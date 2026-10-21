import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Caisse from './pages/Caisse';
import Mouvements from './pages/Mouvements';
import Loans from './pages/Loans';
import Meetings from './pages/Meetings';
import Tontine from './pages/Tontine';
import Distributions from './pages/Distributions';
import MySpace from './pages/MySpace';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';

function AppContent() {
  const { currentUser } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!currentUser) {
    return <Login onLogin={() => setCurrentPage('dashboard')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'members': return <Members />;
      case 'caisse': return <Caisse />;
      case 'mouvements': return <Mouvements />;
      case 'loans': return <Loans />;
      case 'meetings': return <Meetings />;
      case 'tontine': return <Tontine />;
      case 'distributions': return <Distributions />;
      case 'myspace': return <MySpace />;
      case 'reports': return <Reports />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
