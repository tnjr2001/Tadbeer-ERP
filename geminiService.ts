
import { GoogleGenAI } from "@google/genai";

export const analyzeInventory = async (inventory: any[], invoices: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze the following inventory and sales data for a business.
    Provide 3 concise strategic insights in Arabic.
    Inventory: ${JSON.stringify(inventory.map(i => ({ name: i.name, qty: i.quantity })))}
    Sales: ${JSON.stringify(invoices.filter(inv => inv.type === 'sale').map(inv => ({ date: inv.date, items: inv.items.length })))}
    Return a simple list of 3 points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "لا توجد رؤى متاحة حالياً.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "عذراً، حدث خطأ أثناء تحليل البيانات.";
  }
};
