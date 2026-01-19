import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { Product, PaymentMethod, Category, Sale, ItemStatus } from '../types';
import { Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, CheckCircle, Printer, X, ShoppingBag, ScanBarcode, Ban, RotateCcw } from 'lucide-react';

const POS: React.FC = () => {
  const { products, addToCart, cart, removeFromCart, updateCartQuantity, toggleItemStatus, completeSale } = useMarket();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Barcode Scanner Logic
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();
      const isScannerInput = currentTime - lastKeyTime < 100;

      if (e.key === 'Enter') {
        if (buffer.length > 0) {
            e.preventDefault();
            handleBarcodeScan(buffer);
            buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
      lastKeyTime = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.id === barcode);
    if (product) {
      addToCart(product);
      setLastScanned(product.name);
      setTimeout(() => setLastScanned(null), 2000);
      
      const cartContainer = document.getElementById('cart-container');
      if (cartContainer) {
          setTimeout(() => cartContainer.scrollTop = cartContainer.scrollHeight, 100);
      }
    } else {
      console.log('Product not found:', barcode);
      alert(`Produto não encontrado: ${barcode}`);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  // Calculate total only for PENDING items
  const cartTotal = cart.reduce((acc, item) => {
      if (item.status === ItemStatus.CANCELLED) return acc;
      return acc + (item.price * item.quantity);
  }, 0);

  const activeItemsCount = cart.filter(i => i.status !== ItemStatus.CANCELLED).reduce((a, b) => a + b.quantity, 0);

  const handleCheckout = (method: PaymentMethod) => {
    const sale = completeSale(method);
    setShowPaymentModal(false);
    if (sale) {
        setCompletedSale(sale);
    }
  };

  const closeReceipt = () => {
      setCompletedSale(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      
      {/* Product Area (Left) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header/Filter */}
        <div className="bg-white p-4 shadow-sm z-10 space-y-4">
          <div className="flex gap-4">
            <input
                type="text"
                placeholder="Buscar ou digitar código..."
                className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200 text-slate-500 text-sm">
                <ScanBarcode size={20} />
                <span>Leitor Ativo</span>
            </div>
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {['Todos', ...Object.values(Category)].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as Category | 'Todos')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Last Scanned Feedback Overlay */}
        {lastScanned && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-6 py-2 rounded-full shadow-xl animate-fade-in flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                Adicionado: {lastScanned}
            </div>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all active:scale-95 flex flex-col items-center text-center h-full group"
              >
                 <div className="w-24 h-24 mb-3 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center relative">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-slate-300">Sem Imagem</div>
                    )}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Plus className="text-white drop-shadow-md" size={32}/>
                    </div>
                 </div>
                 <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-1">{product.name}</h3>
                 <div className="mt-auto w-full">
                    <p className="text-[10px] text-slate-400 font-mono mb-1">{product.id}</p>
                    <div className="flex justify-between items-center w-full">
                        <span className="text-xs text-slate-500">Est: {product.stock}</span>
                        <span className="text-emerald-600 font-bold">R$ {product.price.toFixed(2)}</span>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Area (Right) */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl z-20">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <ShoppingBag className="mr-2" size={24} /> 
            Carrinho
          </h2>
        </div>

        <div id="cart-container" className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingBag size={48} className="mb-4 opacity-50" />
              <p>O carrinho está vazio</p>
              <p className="text-xs mt-2 text-slate-300">Use o leitor ou clique nos produtos</p>
            </div>
          ) : (
            cart.map(item => {
                const isCancelled = item.status === ItemStatus.CANCELLED;
                return (
                  <div key={item.id} className={`flex justify-between items-center p-3 rounded-lg border transition-all ${isCancelled ? 'bg-red-50 border-red-100 opacity-70' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                          <p className={`font-medium text-sm ${isCancelled ? 'text-red-500 line-through' : 'text-slate-800'}`}>{item.name}</p>
                          {isCancelled && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-bold">CANCELADO</span>}
                          {!isCancelled && <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-600 rounded-full font-bold">PENDENTE</span>}
                      </div>
                      <p className={`text-xs font-semibold ${isCancelled ? 'text-red-400' : 'text-emerald-600'}`}>R$ {item.price.toFixed(2)} un</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {!isCancelled ? (
                            <>
                                <div className="flex items-center bg-white rounded-md border border-slate-200">
                                    <button 
                                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                    className="p-1 hover:bg-slate-100 text-slate-600"
                                    >
                                    <Minus size={14} />
                                    </button>
                                    <span className="px-2 text-sm font-medium w-8 text-center">{item.quantity}</span>
                                    <button 
                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                    className="p-1 hover:bg-slate-100 text-slate-600"
                                    >
                                    <Plus size={14} />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => toggleItemStatus(item.id)}
                                    title="Cancelar Item"
                                    className="text-slate-400 hover:text-red-500 p-1"
                                >
                                    <Ban size={16} />
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => toggleItemStatus(item.id)}
                                title="Restaurar Item"
                                className="text-emerald-500 hover:text-emerald-700 p-1 flex items-center gap-1 text-xs font-medium"
                            >
                                <RotateCcw size={14} />
                                Restaurar
                            </button>
                        )}
                    </div>
                  </div>
                );
            })
          )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500">Itens Ativos</span>
            <span className="font-semibold">{activeItemsCount}</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold text-slate-800">TOTAL</span>
            <span className="text-3xl font-bold text-emerald-600">R$ {cartTotal.toFixed(2)}</span>
          </div>
          
          <button 
            disabled={activeItemsCount === 0}
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-[0.98]"
          >
            Finalizar (F2)
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row h-[500px]">
            
            {/* Summary Left Side */}
            <div className="w-full md:w-1/2 bg-slate-50 p-6 border-r border-slate-200 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ShoppingBag size={20}/> Resumo do Pedido
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {cart.map(item => (
                        <div key={item.id} className={`flex justify-between items-center p-2 rounded border text-sm ${item.status === ItemStatus.CANCELLED ? 'bg-red-50 border-red-100 opacity-60' : 'bg-white border-slate-100'}`}>
                            <div className="flex flex-col">
                                <span className={`${item.status === ItemStatus.CANCELLED ? 'line-through text-red-800' : 'text-slate-700'} font-medium`}>
                                    {item.quantity}x {item.name}
                                </span>
                                {item.status === ItemStatus.CANCELLED && <span className="text-[10px] text-red-600 font-bold">CANCELADO</span>}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`${item.status === ItemStatus.CANCELLED ? 'line-through text-red-800' : 'text-slate-800'}`}>
                                    R$ {(item.price * item.quantity).toFixed(2)}
                                </span>
                                <button 
                                    onClick={() => toggleItemStatus(item.id)}
                                    className={`p-1 rounded hover:bg-slate-200 ${item.status === ItemStatus.CANCELLED ? 'text-emerald-600' : 'text-red-500'}`}
                                    title={item.status === ItemStatus.CANCELLED ? "Restaurar" : "Cancelar"}
                                >
                                    {item.status === ItemStatus.CANCELLED ? <RotateCcw size={14}/> : <Ban size={14}/>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-end">
                        <span className="text-slate-500">Total a Pagar</span>
                        <span className="text-2xl font-bold text-emerald-600">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Payment Options Right Side */}
            <div className="w-full md:w-1/2 p-6 flex flex-col">
              <h3 className="text-xl font-bold text-slate-800 mb-1">Pagamento</h3>
              <p className="text-slate-500 text-sm mb-6">Selecione o método de pagamento</p>
              
              <div className="grid grid-cols-2 gap-3 flex-1">
                <button 
                  onClick={() => handleCheckout(PaymentMethod.CASH)}
                  disabled={activeItemsCount === 0}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Banknote size={28} className="text-slate-400 group-hover:text-emerald-600 mb-2" />
                  <span className="font-semibold text-slate-700 group-hover:text-emerald-700 text-sm">Dinheiro</span>
                </button>

                <button 
                  onClick={() => handleCheckout(PaymentMethod.CREDIT_CARD)}
                  disabled={activeItemsCount === 0}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard size={28} className="text-slate-400 group-hover:text-blue-600 mb-2" />
                  <span className="font-semibold text-slate-700 group-hover:text-blue-700 text-sm">Crédito</span>
                </button>

                <button 
                  onClick={() => handleCheckout(PaymentMethod.DEBIT_CARD)}
                  disabled={activeItemsCount === 0}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard size={28} className="text-slate-400 group-hover:text-orange-600 mb-2" />
                  <span className="font-semibold text-slate-700 group-hover:text-orange-700 text-sm">Débito</span>
                </button>

                <button 
                  onClick={() => handleCheckout(PaymentMethod.PIX)}
                  disabled={activeItemsCount === 0}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Smartphone size={28} className="text-slate-400 group-hover:text-purple-600 mb-2" />
                  <span className="font-semibold text-slate-700 group-hover:text-purple-700 text-sm">PIX</span>
                </button>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors w-full border border-slate-200"
                >
                  Cancelar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt / Success Modal */}
      {completedSale && (
        <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-bounce-in">
             <div className="bg-emerald-600 p-6 text-center text-white relative">
                 <button onClick={closeReceipt} className="absolute top-4 right-4 text-emerald-100 hover:text-white">
                     <X size={24} />
                 </button>
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-3">
                     <CheckCircle size={32} className="text-white" />
                 </div>
                 <h2 className="text-2xl font-bold">Venda Aprovada!</h2>
                 <p className="text-emerald-100 text-sm opacity-90">Obrigado pela preferência</p>
             </div>
             
             <div className="p-6 bg-slate-50 flex-1">
                 <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm border-dashed">
                     <div className="flex justify-between mb-4 border-b border-slate-100 pb-2">
                         <span className="text-xs text-slate-400 font-mono">ID: #{completedSale.id.slice(-6)}</span>
                         <span className="text-xs text-slate-400">{new Date(completedSale.timestamp).toLocaleTimeString()}</span>
                     </div>
                     <div className="text-xs text-center text-slate-400 mb-2">Operador: {completedSale.cashierName}</div>
                     <div className="space-y-2 mb-4">
                         {completedSale.items.map((item, idx) => (
                             <div key={idx} className="flex justify-between text-sm">
                                 <span className="text-slate-600">{item.quantity}x {item.name}</span>
                                 <span className="font-medium text-slate-800">R$ {(item.price * item.quantity).toFixed(2)}</span>
                             </div>
                         ))}
                     </div>
                     <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                         <span className="font-bold text-slate-700">Total</span>
                         <span className="font-bold text-emerald-600 text-lg">R$ {completedSale.total.toFixed(2)}</span>
                     </div>
                 </div>
                 
                 <div className="mt-4 text-center">
                    <p className="text-xs text-slate-500 mb-4">Método: {completedSale.paymentMethod}</p>
                    <button onClick={closeReceipt} className="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                        <Plus size={18} />
                        Nova Venda
                    </button>
                    <button className="w-full mt-2 py-2 text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center justify-center gap-2">
                        <Printer size={16} />
                        Imprimir Cupom
                    </button>
                 </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default POS;