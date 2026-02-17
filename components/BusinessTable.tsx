
import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { BusinessEntity, Invoice, InventoryItem } from '../types';

interface BusinessTableProps {
  title: string;
  data: BusinessEntity[];
  invoices: Invoice[];
  inventory?: InventoryItem[];
  onAdd: (item: Omit<BusinessEntity, 'id'>) => void;
  onEdit: (id: string, item: Omit<BusinessEntity, 'id'>) => void;
  onDelete: (id: string) => void;
}

const BusinessTable: React.FC<BusinessTableProps> = ({ title, data, invoices, inventory, onAdd, onEdit, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<BusinessEntity | null>(null);
  const [formData, setFormData] = useState<Omit<BusinessEntity, 'id'>>({
    name: '', location: '', nif: '', nis: '', article: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onEdit(editingId, formData);
    } else {
      onAdd(formData);
    }
    setFormData({ name: '', location: '', nif: '', nis: '', article: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (e: React.MouseEvent, item: BusinessEntity) => {
    e.stopPropagation();
    setFormData({ name: item.name, location: item.location, nif: item.nif, nis: item.nis, article: item.article });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا السجل؟ سيتم حذف كافة البيانات المرتبطة به.')) {
      onDelete(id);
    }
  };

  const filteredInvoices = selectedEntity 
    ? invoices.filter(inv => inv.customerId === selectedEntity.id)
    : [];

  const suppliedItems = (selectedEntity && inventory) 
    ? inventory.filter(item => item.supplierId === selectedEntity.id)
    : [];

  const totalSuppliedQty = suppliedItems.reduce((sum, item) => sum + (item.initialQuantity || item.quantity), 0);
  const totalSpent = filteredInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
  const isSupplierView = title === TRANSLATIONS.suppliers;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <button 
          onClick={() => { setShowForm(true); setEditingId(null); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100"
        >
          {TRANSLATIONS.add} {title}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100">
            <h3 className="text-xl font-black mb-6 text-slate-800">{editingId ? TRANSLATIONS.edit : TRANSLATIONS.add} {title}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField label={TRANSLATIONS.name} value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} required />
              <InputField label={TRANSLATIONS.location} value={formData.location} onChange={(v: string) => setFormData({...formData, location: v})} required />
              <InputField label={TRANSLATIONS.nif} value={formData.nif} onChange={(v: string) => setFormData({...formData, nif: v})} />
              <InputField label={TRANSLATIONS.nis} value={formData.nis} onChange={(v: string) => setFormData({...formData, nis: v})} />
              <InputField label={TRANSLATIONS.article} value={formData.article} onChange={(v: string) => setFormData({...formData, article: v})} />
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">{TRANSLATIONS.save}</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEntity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-800">{selectedEntity.name}</h3>
                <p className="text-slate-500 font-medium">{selectedEntity.location}</p>
              </div>
              <button onClick={() => setSelectedEntity(null)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <p className="text-xs text-blue-600 font-black uppercase tracking-wider mb-2">إجمالي التعاملات</p>
                <p className="text-2xl font-black text-blue-800">{totalSpent.toLocaleString()} دج</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 font-black uppercase tracking-wider mb-2">رقم NIF</p>
                <p className="text-lg font-bold text-slate-800">{selectedEntity.nif || '---'}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 font-black uppercase tracking-wider mb-2">
                  {isSupplierView ? "إجمالي الكمية الموردة" : "عدد الفواتير"}
                </p>
                <p className="text-2xl font-black text-slate-800">
                   {isSupplierView ? totalSuppliedQty : filteredInvoices.length}
                </p>
              </div>
            </div>

            {isSupplierView ? (
              <div>
                <h4 className="font-black text-lg mb-4 text-slate-700 flex items-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                   سجل المنتجات الموردة (الكمية الإجمالية)
                </h4>
                <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-slate-500 font-black">المنتج</th>
                        <th className="px-6 py-3 text-slate-500 font-black text-center">رقم الفاتورة</th>
                        <th className="px-6 py-3 text-slate-500 font-black text-center">تاريخ الشراء</th>
                        <th className="px-6 py-3 text-slate-500 font-black text-center">الكمية الموردة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {suppliedItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                          <td className="px-6 py-4 text-center text-blue-600 font-bold">{item.invoiceNumber || '---'}</td>
                          <td className="px-6 py-4 text-center">{item.purchaseDate}</td>
                          <td className="px-6 py-4 text-center font-black text-slate-800">{item.initialQuantity || item.quantity}</td>
                        </tr>
                      ))}
                      {suppliedItems.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic font-medium">لا توجد منتجات مسجلة من هذا المورد.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="font-black text-lg mb-4 text-slate-700">سجل فواتير الزبون</h4>
                <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-slate-500 font-black">رقم الفاتورة</th>
                        <th className="px-6 py-3 text-slate-500 font-black text-center">التاريخ</th>
                        <th className="px-6 py-3 text-slate-500 font-black text-center">المبلغ</th>
                        <th className="px-6 py-3 text-slate-500 font-black text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-800">{inv.invoiceNumber}</td>
                          <td className="px-6 py-4 text-center">{inv.date}</td>
                          <td className="px-6 py-4 text-center font-black text-blue-600">{inv.totalTTC.toLocaleString()} دج</td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">مكتملة</span>
                          </td>
                        </tr>
                      ))}
                      {filteredInvoices.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic font-medium">لا توجد فواتير مسجلة لهذا الزبون.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-right bg-white">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-black tracking-widest">
            <tr>
              <th className="px-6 py-5">{TRANSLATIONS.name}</th>
              <th className="px-6 py-5">{TRANSLATIONS.location}</th>
              <th className="px-6 py-5">{TRANSLATIONS.nif}</th>
              <th className="px-6 py-5">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr 
                key={item.id} 
                className="hover:bg-blue-50/40 transition-all cursor-pointer group"
                onClick={() => setSelectedEntity(item)}
              >
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-base">{item.name}</span>
                      <span className="text-[10px] text-blue-500 font-black uppercase tracking-wider mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">انقر لعرض السجل</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">{item.location}</td>
                <td className="px-6 py-4 text-slate-600 font-mono text-sm">{item.nif || '---'}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button 
                    onClick={(e) => handleEdit(e, item)} 
                    className="text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                  >
                    {TRANSLATIONS.edit}
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, item.id)} 
                    className="text-red-600 hover:text-white hover:bg-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                  >
                    {TRANSLATIONS.delete}
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-slate-400 italic font-medium">لا توجد بيانات متاحة حالياً.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const InputField = ({ label, value, onChange, type = "text", required = false }: any) => (
  <div>
    <label className="block text-sm font-black text-slate-700 mb-1.5">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)}
      required={required}
      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-black bg-white transition shadow-sm"
    />
  </div>
);

export default BusinessTable;
