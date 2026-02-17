
import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../constants';
import { InventoryItem, BusinessEntity, Invoice } from '../types';
import { analyzeInventory } from '../geminiService';

interface DashboardProps {
  inventory: InventoryItem[];
  customers: BusinessEntity[];
  invoices: Invoice[];
  suppliers: BusinessEntity[];
}

const Dashboard: React.FC<DashboardProps> = ({ inventory, customers, invoices, suppliers }) => {
  const [insights, setInsights] = useState<string>('جاري تحليل البيانات...');
  const [loadingInsights, setLoadingInsights] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const res = await analyzeInventory(inventory, invoices);
      setInsights(res);
      setLoadingInsights(false);
    };
    fetchInsights();
  }, [inventory, invoices]);

  const totalSales = invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.totalTTC, 0);
  const totalStockValue = inventory.reduce((sum, i) => sum + (i.quantity * i.purchasePriceHT), 0);
  const salesCount = invoices.filter(i => i.type === 'sale').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي المبيعات" value={`${totalSales.toLocaleString()} دج`} icon="💰" color="blue" />
        <StatCard title="قيمة المخزون" value={`${totalStockValue.toLocaleString()} دج`} icon="📦" color="green" />
        <StatCard title="عدد الفواتير" value={salesCount.toString()} icon="📄" color="purple" />
        <StatCard title="عدد الزبائن" value={customers.length.toString()} icon="👥" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">✨</span> رؤى الذكاء الاصطناعي (Gemini)
          </h3>
          <div className={`p-4 rounded-xl border-r-4 border-blue-500 bg-blue-50 ${loadingInsights ? 'animate-pulse' : ''}`}>
             <p className="text-slate-700 whitespace-pre-line leading-relaxed">
               {insights}
             </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">أهم الزبائن نشاطاً</h3>
          <div className="space-y-4">
            {customers.slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700">{c.name}</span>
                <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">{c.location}</span>
              </div>
            ))}
            {customers.length === 0 && <p className="text-slate-500 text-center py-4">لا يوجد زبائن مسجلين بعد</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`text-2xl p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default Dashboard;
