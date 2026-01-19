import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Product, Category } from '../types';
import { Plus, Edit2, Trash2, Search, Wand2, Loader2, Save, X } from 'lucide-react';
import { generateMarketingCopy } from '../services/geminiService';

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useMarket();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    cost: 0,
    stock: 0,
    category: Category.OTHER,
    imageUrl: 'https://picsum.photos/200/200',
    description: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: 0,
        cost: 0,
        stock: 0,
        category: Category.OTHER,
        imageUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 50)}/200/200`,
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) return;

    if (editingProduct) {
      updateProduct({ ...editingProduct, ...formData } as Product);
    } else {
      addProduct({ 
        ...formData, 
        id: Date.now().toString(),
      } as Product);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) return;
    setIsGenerating(true);
    const desc = await generateMarketingCopy(formData.name, formData.category as string);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciar Estoque</h2>
        <button 
          onClick={() => openModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg hover:shadow-emerald-500/30"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar no estoque..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 bg-white shadow-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Preço Venda</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Estoque</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={product.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-100" />
                    <div>
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[150px]">{product.description || 'Sem descrição'}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs">{product.category}</span>
                  </td>
                  <td className="p-4 text-sm text-slate-900 font-medium text-right">R$ {product.price.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(product)} className="p-1 text-slate-400 hover:text-emerald-600 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preço Venda (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Custo (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.cost}
                    onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estoque</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as Category})}
                  >
                    {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AI Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700">Descrição Comercial (IA)</label>
                    <button 
                        onClick={handleGenerateDescription}
                        disabled={isGenerating || !formData.name}
                        className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                        Gerar com Gemini
                    </button>
                </div>
                <textarea 
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Clique em 'Gerar com Gemini' para criar uma descrição..."
                />
              </div>

            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Save size={18} />
                Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;