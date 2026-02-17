
import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { InventoryItem, BusinessEntity } from '../types';
import { InputField } from './BusinessTable';

interface InventoryModuleProps {
  inventory: InventoryItem[];
  suppliers: BusinessEntity[];
  onAdd: (item: Omit<InventoryItem, 'id'>) => void;
  onEdit: (id: string, item: Omit<InventoryItem, 'id'>) => void;
  onDelete: (id: string) => void;
}

const InventoryModule: React.FC<InventoryModuleProps> = ({ inventory, suppliers, onAdd, onEdit, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
    name: '', supplierId: '', purchaseDate: '', invoiceNumber: '',
    purchasePriceHT: 0, tva: 19, totalPriceTTC: 0, quantity: 0, initialQuantity: 0, unitSalePrice: 0, expiryDate: ''
  });

  const calculateTTC = (ht: number, tvaRate: number) => ht * (1 + tvaRate / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ttc = calculateTTC(formData.purchasePriceHT, formData.tva);
    
    let finalInitialQty = formData.quantity;
    if (editingId) {
        const existing = inventory.find(i => i.id === editingId);
        if (existing) finalInitialQty = existing.initialQuantity;
    }

    const finalData = { 
      ...formData, 
      totalPriceTTC: ttc, 
      initialQuantity: finalInitialQty 
    };
    
    if (editingId) onEdit(editingId, finalData);
    else onAdd(finalData);

    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '', supplierId: '', purchaseDate: '', invoiceNumber: '',
      purchasePriceHT: 0, tva: 19, totalPriceTTC: 0, quantity: 0, initialQuantity: 0, unitSalePrice: 0, expiryDate: ''
    });
  };

  const isExpired = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800">{TRANSLATIONS.inventory}</h2>
        <button onClick={() => { setShowForm(true); setEditingId(null); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2">
          إضافة منتج جديد
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl overflow-y-auto max-h-[90vh] shadow-2xl">
            <h3 className="text-2xl font-black mb-8 text-slate-800">تفاصيل المنتج والمخزون</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="اسم المنتج" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} required />
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1.5">المورد</label>
                <select 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm font-bold"
                  value={formData.supplierId}
                  onChange={e => setFormData({...formData, supplierId: e.target.value})}
                  required
                >
                  <option value="">اختر المورد</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <InputField label="تاريخ الشراء" type="date" value={formData.purchaseDate} onChange={(v: string) => setFormData({...formData, purchaseDate: v})} />
              <InputField label="رقم الفاتورة" value={formData.invoiceNumber} onChange={(v: string) => setFormData({...formData, invoiceNumber: v})} />
              <InputField label="تاريخ انتهاء الصلاحية" type="date" value={formData.expiryDate} onChange={(v: string) => setFormData({...formData, expiryDate: v})} />
              <InputField label="الكمية الموردة" type="number" value={formData.quantity} onChange={(v: string) => setFormData({...formData, quantity: parseInt(v) || 0})} />
              <InputField label="سعر الشراء (HT)" type="number" value={formData.purchasePriceHT} onChange={(v: string) => setFormData({...formData, purchasePriceHT: parseFloat(v) || 0})} />
              <InputField label={TRANSLATIONS.unitSalePrice} type="number" value={formData.unitSalePrice} onChange={(v: string) => setFormData({...formData, unitSalePrice: parseFloat(v) || 0})} />
              <InputField label="TVA (%)" type="number" value={formData.tva} onChange={(v: string) => setFormData({...formData, tva: parseFloat(v) || 0})} />
              
              <div className="md:col-span-2 pt-6 flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-100">{TRANSLATIONS.save}</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-black hover:bg-slate-200 transition">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-right bg-white">
          <thead className="bg-slate-50 text-slate-500 text-xs font-black tracking-wider uppercase">
            <tr>
              <th className="px-6 py-4">المنتج</th>
              <th className="px-6 py-4">المورد</th>
              <th className="px-6 py-4 text-center">الكمية الحالية</th>
              <th className="px-6 py-4 text-center">انتهاء الصلاحية</th>
              <th className="px-6 py-4 text-center">سعر البيع للوحدة</th>
              <th className="px-6 py-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map(item => (
              <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors ${isExpired(item.expiryDate) ? 'bg-red-50/30' : ''}`}>
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                      <span className="font-black text-slate-800">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">رقم الفاتورة: {item.invoiceNumber || '---'}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-bold text-sm">
                  {suppliers.find(s => s.id === item.supplierId)?.name || <span className="text-slate-300 italic">مورد غير مسجل</span>}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${item.quantity < 5 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                    {item.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-bold text-sm">
                   {item.expiryDate ? (
                     <span className={`px-2 py-1 rounded-lg text-xs font-bold ${isExpired(item.expiryDate) ? 'bg-red-600 text-white' : 'text-slate-600'}`}>
                        {item.expiryDate}
                     </span>
                   ) : (
                     <span className="text-slate-300">---</span>
                   )}
                </td>
                <td className="px-6 py-4 text-center text-black font-black">{item.unitSalePrice.toLocaleString()} دج</td>
                <td className="px-6 py-4">
                   <div className="flex justify-center gap-2">
                      <button onClick={() => { setEditingId(item.id); setFormData(item); setShowForm(true); }} className="text-blue-600 font-black bg-blue-50 px-3 py-1.5 rounded-lg text-xs hover:bg-blue-600 hover:text-white transition-all">{TRANSLATIONS.edit}</button>
                      <button onClick={() => { if(confirm('هل تريد فعلاً حذف هذا المنتج؟')) onDelete(item.id); }} className="text-red-600 font-black bg-red-50 px-3 py-1.5 rounded-lg text-xs hover:bg-red-600 hover:text-white transition-all">{TRANSLATIONS.delete}</button>
                   </div>
                </td>
              </tr>
            ))}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-400 italic font-black uppercase">المخزن فارغ.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryModule;
