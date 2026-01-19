import React from 'react';
import { useMarket } from '../context/MarketContext';
import { UserRole } from '../types';
import { Shield, Store, User, Users, Code } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useMarket();

  const roles = [
    { role: UserRole.CASHIER, label: 'Caixa', icon: User, color: 'bg-blue-500', desc: 'Acesso apenas ao PDV' },
    { role: UserRole.MANAGER, label: 'Gerente', icon: Users, color: 'bg-purple-500', desc: 'PDV, Estoque e Relatórios' },
    { role: UserRole.OWNER, label: 'Dono', icon: Shield, color: 'bg-emerald-600', desc: 'Acesso Completo' },
    { role: UserRole.DEVELOPER, label: 'Dev', icon: Code, color: 'bg-slate-800', desc: 'Modo Manutenção' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Brand */}
        <div className="bg-slate-900 md:w-2/5 p-12 text-white flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
            <Store size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-2">MercadoPro</h1>
          <p className="text-slate-400">Sistema de Gestão Inteligente</p>
          <div className="mt-12 text-sm text-slate-500">
            <p>Versão 2.0.1</p>
            <p>By Developer</p>
          </div>
        </div>

        {/* Right Side - Role Selection */}
        <div className="p-12 md:w-3/5">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Quem é você?</h2>
          <p className="text-slate-500 mb-8">Selecione seu perfil para acessar o sistema.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  onClick={() => login(item.role)}
                  className="group flex flex-col items-center p-6 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center"
                >
                  <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-800">{item.label}</h3>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;