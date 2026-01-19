import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import SalesHistory from './components/SalesHistory';
import AIAssistant from './components/AIAssistant';
import Login from './components/Login';
import { MarketProvider, useMarket } from './context/MarketContext';

const AppContent: React.FC = () => {
  const { user } = useMarket();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POS />;
      case 'inventory':
        return <Inventory />;
      case 'history':
        return <SalesHistory />;
      case 'ai':
        return (
            <div className="p-6 h-full max-w-4xl mx-auto">
                 <AIAssistant />
            </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <MarketProvider>
      <AppContent />
    </MarketProvider>
  );
};

export default App;