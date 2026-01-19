import React, { useState, useRef, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { analyzeBusinessData } from '../services/geminiService';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AIAssistant: React.FC = () => {
  const { sales, products } = useMarket();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Olá! Sou seu assistente virtual. Pergunte-me sobre seu estoque, vendas ou peça dicas de marketing!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    const aiResponse = await analyzeBusinessData(sales, products, userMessage);

    setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "Qual produto vendeu mais hoje?",
    "Crie uma promoção para Coca-Cola",
    "Quais produtos estão acabando?",
    "Como aumentar meu lucro?"
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
        {/* Header */}
        <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Consultor IA</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Online • Gemini 2.0 Flash
                    </p>
                </div>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-slate-800 text-white rounded-br-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                    }`}>
                        <div className="flex items-start gap-3">
                            {msg.role === 'ai' && <Bot size={18} className="mt-1 text-purple-600 shrink-0" />}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            {msg.role === 'user' && <User size={18} className="mt-1 text-slate-400 shrink-0" />}
                        </div>
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 rounded-bl-none flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-purple-600" />
                        <span className="text-xs text-slate-400">Analisando dados...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
            {/* Suggestions */}
            {messages.length < 3 && (
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                    {suggestions.map((s, i) => (
                        <button 
                            key={i}
                            onClick={() => { setInput(s); }} 
                            className="whitespace-nowrap px-3 py-1.5 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 text-slate-600 text-xs rounded-full border border-slate-200 transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
            
            <div className="relative flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Faça uma pergunta sobre o negócio..."
                    className="flex-1 bg-slate-100 text-slate-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all"
                    disabled={loading}
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default AIAssistant;