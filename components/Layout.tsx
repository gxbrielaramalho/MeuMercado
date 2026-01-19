import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { UserRole } from '../types';
import { LayoutDashboard, ShoppingCart, Package, History, MessageSquareText, Menu, X, Store, LogOut, Lock } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useMarket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Define menu items visibility based on roles
  const menuItems = useMemo(() => {
    const allItems = [
      { id: 'pos', label: 'Caixa (PDV)', icon: ShoppingCart, allowed: [UserRole.CASHIER, UserRole.MANAGER, UserRole.OWNER, UserRole.DEVELOPER] },
      { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, allowed: [UserRole.MANAGER, UserRole.OWNER, UserRole.DEVELOPER] },
      { id: 'inventory', label: 'Estoque', icon: Package, allowed: [UserRole.MANAGER, UserRole.OWNER, UserRole.DEVELOPER] },
      { id: 'history', label: 'Vendas', icon: History, allowed: [UserRole.MANAGER, UserRole.OWNER, UserRole.DEVELOPER] },
      { id: 'ai', label: 'Consultor IA', icon: MessageSquareText, allowed: [UserRole.OWNER, UserRole.DEVELOPER] },
    ];

    return allItems.filter(item => user && item.allowed.includes(user.role));
  }, [user]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // If user role doesn't have access to current tab, redirect to first allowed tab
  React.useEffect(() => {
    const allowedTabs = menuItems.map(i => i.id);
    if (!allowedTabs.includes(activeTab) && allowedTabs.length > 0) {
      setActiveTab(allowedTabs[0]);
    }
  }, [menuItems, activeTab, setActiveTab]);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
               <Store size={24} />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight">MercadoPro</h1>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Lock size={10} />
                  <span>{user?.role}</span>
                </div>
            </div>
            <button className="md:hidden ml-auto" onClick={toggleSidebar}>
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? 'animate-pulse' : ''} />
                  <span className="font-medium">{item.label}</span>
                  {item.id === 'ai' && (
                    <span className="ml-auto bg-purple-500 text-[10px] font-bold px-2 py-0.5 rounded-full text-white">NEW</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-3">
                <img src={user?.avatar || "https://picsum.photos/100/100"} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-700" />
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                </div>
            </div>
            <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-200 transition-colors text-sm font-medium"
            >
                <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white p-4 border-b border-slate-200 flex items-center justify-between shadow-sm z-30">
          <button onClick={toggleSidebar} className="text-slate-600">
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-800">
            {menuItems.find(i => i.id === activeTab)?.label || 'MercadoPro'}
          </span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;