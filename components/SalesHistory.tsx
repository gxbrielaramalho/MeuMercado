import React from 'react';
import { useMarket } from '../context/MarketContext';
import { Calendar, Clock } from 'lucide-react';

const SalesHistory: React.FC = () => {
  const { sales } = useMarket();

  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Histórico de Vendas</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
        <div className="overflow-x-auto h-full">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data/Hora</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Itens</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pagamento</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {sales.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                            Nenhuma venda registrada ainda.
                        </td>
                    </tr>
                ) : (
                    sales.sort((a,b) => b.timestamp - a.timestamp).map(sale => (
                        <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm text-slate-400 font-mono">#{sale.id.slice(-6)}</td>
                        <td className="p-4 text-sm text-slate-600">
                            <div className="flex flex-col">
                                <span className="flex items-center gap-1 font-medium"><Calendar size={12}/> {new Date(sale.timestamp).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={12}/> {new Date(sale.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                            <div className="max-w-xs">
                                {sale.items.map((item, idx) => (
                                    <span key={idx} className="inline-block bg-slate-100 rounded px-2 py-0.5 text-xs mr-1 mb-1">
                                        {item.quantity}x {item.name}
                                    </span>
                                ))}
                            </div>
                        </td>
                        <td className="p-4 text-sm">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                                {sale.paymentMethod}
                            </span>
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-800 text-right">
                            R$ {sale.total.toFixed(2)}
                        </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;