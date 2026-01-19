import { GoogleGenAI } from "@google/genai";
import { Product, Sale } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Model to use for business intelligence
const MODEL_NAME = 'gemini-3-flash-preview';

export const generateMarketingCopy = async (productName: string, category: string): Promise<string> => {
  try {
    const prompt = `Escreva uma descrição de marketing curta, atraente e vendedora (máximo 150 caracteres) para um produto de mini mercado.
    Produto: ${productName}
    Categoria: ${category}
    Use emojis apropriados.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "Descrição não disponível no momento.";
  } catch (error) {
    console.error("Error generating copy:", error);
    return "Ótima opção para você!";
  }
};

export const analyzeBusinessData = async (sales: Sale[], products: Product[], question: string): Promise<string> => {
  try {
    // Simplify data for token efficiency
    const recentSales = sales.slice(0, 50).map(s => ({
      date: new Date(s.timestamp).toLocaleDateString(),
      total: s.total,
      items: s.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
    }));

    const lowStock = products.filter(p => p.stock < 10).map(p => p.name);

    const systemContext = `
    Você é um consultor especialista para um dono de mini mercado chamado "MercadoPro".
    Sua missão é ajudar a aumentar o lucro, reduzir perdas e melhorar o marketing.
    
    DADOS DO NEGÓCIO EM TEMPO REAL:
    - Produtos com estoque baixo (Abaixo de 10 un): ${lowStock.join(', ') || 'Nenhum'}
    - Amostra das últimas 50 vendas: ${JSON.stringify(recentSales)}
    
    DIRETRIZES:
    - Seja conciso e direto.
    - Use formatação simples (bullet points) quando útil.
    - Se perguntarem sobre dados que não existem, explique que precisa de mais histórico.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: question,
      config: {
        systemInstruction: systemContext,
      }
    });

    return response.text || "Não consegui analisar os dados no momento.";
  } catch (error) {
    console.error("Error analyzing business:", error);
    return "Erro ao conectar com a IA consultora. Verifique sua chave de API ou conexão.";
  }
};