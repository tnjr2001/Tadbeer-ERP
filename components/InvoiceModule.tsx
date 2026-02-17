
import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Invoice, InventoryItem, BusinessEntity, PaymentMethod, InvoiceItem, UserProfile } from '../types';
import { InputField } from './BusinessTable';

interface InvoiceModuleProps {
  invoices: Invoice[];
  inventory: InventoryItem[];
  customers: BusinessEntity[];
  suppliers: BusinessEntity[];
  user: UserProfile;
  onCreateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
}

export default function InvoiceModule({ invoices, inventory, customers, onCreateInvoice, onDeleteInvoice, user }: InvoiceModuleProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  
  const [newInv, setNewInv] = useState({
    customerId: '',
    invoiceNumber: `${Date.now().toString().slice(-8)}`,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: PaymentMethod.CASH,
    checkNumber: '',
    items: [] as InvoiceItem[],
    discount: 0,
    tvaRate: 19
  });

  const [selectedItem, setSelectedItem] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);

  const handleAddItem = () => {
    const item = inventory.find(i => i.id === selectedItem);
    if (!item) return;

    if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
      alert(`عذراً، المنتج "${item.name}" منتهي الصلاحية ولا يمكن إضافته.`);
      return;
    }

    if (selectedQty > item.quantity) {
      alert(`عذراً، الكمية المطلوبة غير متوفرة (المتوفر: ${item.quantity}).`);
      return;
    }
    
    const newItem: InvoiceItem = {
      itemId: item.id,
      quantity: selectedQty,
      salePrice: item.unitSalePrice,
      amount: selectedQty * item.unitSalePrice
    };
    
    setNewInv(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setSelectedItem('');
    setSelectedQty(1);
  };

  const calculateTotals = () => {
    const subtotal = newInv.items.reduce((sum, i) => sum + i.amount, 0);
    const fee = newInv.paymentMethod === PaymentMethod.CASH ? subtotal * 0.01 : 0;
    const tvaAmount = subtotal * (newInv.tvaRate / 100); 
    const totalTTC = subtotal + fee + tvaAmount - newInv.discount;
    return { subtotal, fee, tvaAmount, totalTTC };
  };

  const handleSave = () => {
    if (newInv.items.length === 0) {
      alert('الرجاء إضافة منتجات للفاتورة.');
      return;
    }
    const totals = calculateTotals();
    const customer = customers.find(c => c.id === newInv.customerId);
    const invoice: Invoice = {
      ...newInv,
      id: Date.now().toString(),
      customerName: customer?.name || 'زبون عام',
      type: 'sale',
      ...totals
    };
    onCreateInvoice(invoice);
    setShowCreate(false);
    resetForm();
  };

  const resetForm = () => {
    setNewInv({
      customerId: '',
      invoiceNumber: `${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: PaymentMethod.CASH,
      checkNumber: '',
      items: [] as InvoiceItem[],
      discount: 0,
      tvaRate: 19
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteInvoice = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      onDeleteInvoice(id);
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; background: white !important; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; color: black !important; }
          #invoice-print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 2cm;
            direction: rtl;
            font-family: 'Cairo', sans-serif;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab('sales')} className={`px-6 py-4 font-black transition-colors ${activeTab === 'sales' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>فواتير البيع</button>
          <button onClick={() => setActiveTab('purchases')} className={`px-6 py-4 font-black transition-colors ${activeTab === 'purchases' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>فواتير الشراء</button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-800">سجل الفواتير</h2>
            <button onClick={() => setShowCreate(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2">
               + إنشاء فاتورة
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-right bg-white">
              <thead className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">{TRANSLATIONS.invoiceNum}</th>
                  <th className="px-6 py-4">الجهة</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">الإجمالي (TTC)</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.filter(i => activeTab === 'sales' ? i.type === 'sale' : i.type === 'purchase').map(inv => (
                  <tr key={inv.id} className="hover:bg-blue-50/30 transition-all cursor-pointer group" onClick={() => setViewingInvoice(inv)}>
                    <td className="px-6 py-4 font-black text-slate-800">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-slate-800 font-bold">{inv.customerName}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{inv.date}</td>
                    <td className="px-6 py-4 font-black text-blue-600">{inv.totalTTC.toLocaleString()} دج</td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center gap-2">
                          <button 
                            className="text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-slate-50 transition no-print" 
                            onClick={(e) => { e.stopPropagation(); setViewingInvoice(inv); }}
                          >
                            عرض
                          </button>
                          <button 
                            className="text-red-700 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-red-600 hover:text-white transition no-print" 
                            onClick={(e) => handleDeleteInvoice(e, inv.id)}
                          >
                            حذف
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                   <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-black italic uppercase">لا توجد فواتير مسجلة حالياً.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-5xl overflow-y-auto max-h-[95vh] shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
               <h3 className="text-2xl font-black text-slate-800">إنشاء فاتورة</h3>
               <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-slate-700 mb-1.5">الزبون</label>
                <select className="w-full p-3 border border-slate-200 rounded-xl bg-white text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" value={newInv.customerId} onChange={e => setNewInv(prev => ({...prev, customerId: e.target.value}))}>
                  <option value="">زبون عام</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <InputField label={TRANSLATIONS.invoiceNum} value={newInv.invoiceNumber} onChange={(v: string) => setNewInv(prev => ({...prev, invoiceNumber: v}))} />
              <InputField label="التاريخ" type="date" value={newInv.date} onChange={(v: string) => setNewInv(prev => ({...prev, date: v}))} />
              
              <div className="md:col-span-1">
                <label className="block text-sm font-black text-slate-700 mb-1.5">طريقة الدفع</label>
                <select className="w-full p-3 border border-slate-200 rounded-xl bg-white text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" value={newInv.paymentMethod} onChange={e => setNewInv(prev => ({...prev, paymentMethod: e.target.value as PaymentMethod}))}>
                  <option value={PaymentMethod.CASH}>نقداً (مع رسوم 1%)</option>
                  <option value={PaymentMethod.CASH_NO_FEE}>نقداً بدون رسوم (0%)</option>
                  <option value={PaymentMethod.CHECK}>شيك بنكي (0%)</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-black text-slate-700 mb-1.5">معدل TVA</label>
                <select className="w-full p-3 border border-slate-200 rounded-xl bg-white text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" value={newInv.tvaRate} onChange={e => setNewInv(prev => ({...prev, tvaRate: parseInt(e.target.value) || 0}))}>
                   <option value={0}>0%</option>
                   <option value={9}>9%</option>
                   <option value={19}>19%</option>
                </select>
              </div>

              {newInv.paymentMethod === PaymentMethod.CHECK && (
                <div className="md:col-span-2">
                  <InputField label="رقم الشيك" value={newInv.checkNumber} onChange={(v: string) => setNewInv(prev => ({...prev, checkNumber: v}))} required />
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl mb-8 border border-blue-100">
              <h4 className="font-black text-blue-800 mb-4">إضافة منتجات للفاتورة</h4>
              <div className="flex flex-col md:flex-row gap-4">
                <select className="flex-1 p-3.5 border border-slate-200 rounded-xl bg-white text-black font-bold outline-none shadow-sm" value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
                  <option value="">اختر منتج من المخزن...</option>
                  {inventory.filter(i => i.quantity > 0).map(i => (
                    <option key={i.id} value={i.id} disabled={i.expiryDate ? new Date(i.expiryDate) < new Date() : false}>
                      {i.name} - السعر: {i.unitSalePrice} دج (المتوفر: {i.quantity})
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-black text-slate-500 whitespace-nowrap">الكمية:</label>
                  <input type="number" className="w-24 p-3.5 border border-slate-200 rounded-xl bg-white text-black font-black outline-none" value={selectedQty} onChange={e => setSelectedQty(parseInt(e.target.value) || 1)} min="1" />
                </div>
                <button onClick={handleAddItem} className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black hover:bg-blue-700 transition">إضافة</button>
              </div>
            </div>

            <div className="mb-10 border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-right bg-white">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">المنتج</th>
                    <th className="px-6 py-4 text-center">الكمية</th>
                    <th className="px-6 py-4 text-center">{TRANSLATIONS.unitSalePrice}</th>
                    <th className="px-6 py-4 text-center">المجموع (HT)</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {newInv.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-black text-slate-800">{inventory.find(i => i.id === it.itemId)?.name}</td>
                      <td className="px-6 py-4 text-center text-slate-800 font-bold">{it.quantity}</td>
                      <td className="px-6 py-4 text-center text-slate-800 font-bold">{it.salePrice.toLocaleString()} دج</td>
                      <td className="px-6 py-4 text-center font-black text-slate-800">{(it.quantity * it.salePrice).toLocaleString()} دج</td>
                      <td className="px-6 py-4 text-left">
                         <button onClick={() => setNewInv(prev => ({...prev, items: prev.items.filter((_, i) => i !== idx)}))} className="text-red-500 font-black text-xs bg-red-50 px-3 py-1.5 rounded-lg">حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-8 bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
               <div className="space-y-2">
                 <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">ملخص الفاتورة</p>
                 <p className="text-slate-500 text-xs">يتم احتساب الضرائب والرسوم آلياً.</p>
               </div>
               <div className="space-y-3 text-right min-w-[300px]">
                 <div className="flex justify-between border-b border-white/10 pb-2">
                   <span className="text-slate-400 font-bold">المجموع (HT):</span>
                   <span className="font-black">{calculateTotals().subtotal.toLocaleString()} دج</span>
                 </div>
                 <div className="flex justify-between border-b border-white/10 pb-2">
                   <span className="text-slate-400 font-bold">TVA ({newInv.tvaRate}%):</span>
                   <span className="font-black">{calculateTotals().tvaAmount.toLocaleString()} دج</span>
                 </div>
                 <div className="flex justify-between border-b border-white/10 pb-2">
                   <span className="text-slate-400 font-bold">الرسوم (Fee):</span>
                   <span className="font-black text-blue-400">{calculateTotals().fee.toLocaleString()} دج</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                   <span className="text-slate-400 font-bold">تخفيض:</span>
                   <input type="number" className="w-24 p-2 bg-slate-800 border border-white/20 rounded-xl text-white font-black text-right outline-none" value={newInv.discount} onChange={e => setNewInv(prev => ({...prev, discount: parseFloat(e.target.value) || 0}))} />
                 </div>
                 <div className="pt-4 mt-2 border-t-2 border-white/30">
                   <div className="flex justify-between items-end">
                      <span className="text-sm text-blue-400 font-black uppercase">إجمالي TTC</span>
                      <span className="text-4xl font-black">{calculateTotals().totalTTC.toLocaleString()} دج</span>
                   </div>
                 </div>
               </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-4.5 rounded-2xl font-black text-xl hover:bg-blue-700 shadow-xl transition-all">حفظ وتأكيد</button>
              <button onClick={() => setShowCreate(false)} className="px-12 bg-slate-100 text-slate-600 py-4.5 rounded-2xl font-black hover:bg-slate-200 transition">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {viewingInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 overflow-y-auto no-print">
          <div className="relative w-full max-w-4xl my-8">
            <div className="absolute -top-16 left-0 right-0 flex justify-between items-center px-4">
               <button onClick={handlePrint} className="bg-white text-slate-800 px-6 py-2.5 rounded-xl font-black shadow-xl hover:bg-blue-50 transition flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z" /></svg>
                  طباعة وحفظ كـ PDF
               </button>
               <button onClick={() => setViewingInvoice(null)} className="bg-white/20 text-white hover:bg-white/40 p-3 rounded-full transition backdrop-blur-md">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            <div id="invoice-print-area" className="bg-white text-black p-12 md:p-16 shadow-2xl rounded-sm min-h-[1100px] border border-slate-200">
               <div className="flex justify-between border-b-4 border-black pb-10 mb-12">
                  <div className="space-y-2">
                     <h1 className="text-4xl font-black mb-4 tracking-tighter text-black uppercase">{user.companyName}</h1>
                     <p className="text-xl font-bold text-slate-800">{user.ownerName}</p>
                     <p className="text-slate-600 font-medium">{user.location}</p>
                     <p className="text-slate-600 font-medium">الهاتف: <span className="font-bold">{user.phone}</span></p>
                     <div className="flex gap-4 pt-4 text-[10px] font-black text-slate-500 uppercase">
                        <span>NIF: {user.nif}</span>
                        <span>NIS: {user.nis}</span>
                        <span>ART: {user.article}</span>
                     </div>
                  </div>
                  <div className="text-left flex flex-col justify-end">
                     <div className="bg-black text-white px-8 py-2 mb-4 inline-block">
                        <h2 className="text-2xl font-black uppercase tracking-widest">فاتورة</h2>
                     </div>
                     <p className="text-lg font-black text-black">{TRANSLATIONS.invoiceNum}: <span className="text-blue-600">{viewingInvoice.invoiceNumber}</span></p>
                     <p className="text-slate-600 font-bold">التاريخ: {viewingInvoice.date}</p>
                     <p className="text-slate-500 font-bold uppercase text-[10px] pt-1">طريقة الدفع: {viewingInvoice.paymentMethod}</p>
                  </div>
               </div>

               <div className="mb-12 p-8 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">معلومات الزبون:</h3>
                  <p className="text-3xl font-black text-black">{viewingInvoice.customerName}</p>
                  <p className="text-slate-600 mt-2 font-medium">الموقع: {customers.find(c => c.id === viewingInvoice.customerId)?.location || 'غير محدد'}</p>
               </div>

               <table className="w-full text-right mb-16 border-collapse">
                  <thead>
                     <tr className="bg-slate-900 text-white">
                        <th className="p-4 font-black uppercase text-xs border border-slate-900">وصف المنتج</th>
                        <th className="p-4 font-black uppercase text-xs border border-slate-900 text-center">الكمية</th>
                        <th className="p-4 font-black uppercase text-xs border border-slate-900 text-center">{TRANSLATIONS.unitSalePrice}</th>
                        <th className="p-4 font-black uppercase text-xs border border-slate-900 text-center">المبلغ (HT)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-100">
                     {viewingInvoice.items.map((it, idx) => (
                        <tr key={idx} className="bg-white">
                           <td className="p-4 font-black text-black border-x-2 border-slate-50">{inventory.find(i => i.id === it.itemId)?.name}</td>
                           <td className="p-4 text-center text-black font-bold border-x-2 border-slate-50">{it.quantity}</td>
                           <td className="p-4 text-center text-black font-bold border-x-2 border-slate-50">{it.salePrice.toLocaleString()} دج</td>
                           <td className="p-4 text-center font-black text-black border-x-2 border-slate-50 bg-slate-50/20">{(it.quantity * it.salePrice).toLocaleString()} دج</td>
                        </tr>
                     ))}
                  </tbody>
               </table>

               <div className="flex justify-end pt-10">
                  <div className="w-1/2 space-y-3">
                     <div className="flex justify-between text-lg font-bold text-slate-500">
                        <span>المجموع (HT):</span>
                        <span className="text-black">{viewingInvoice.subtotal.toLocaleString()} دج</span>
                     </div>
                     <div className="flex justify-between text-lg font-bold text-slate-500">
                        <span>TVA ({viewingInvoice.tvaRate}%):</span>
                        <span className="text-black">{viewingInvoice.tvaAmount.toLocaleString()} دج</span>
                     </div>
                     <div className="flex justify-between text-lg font-bold text-slate-500">
                        <span>الرسوم:</span>
                        <span className="text-black">{viewingInvoice.fee.toLocaleString()} دج</span>
                     </div>
                     {viewingInvoice.discount > 0 && (
                        <div className="flex justify-between text-lg font-bold text-red-600">
                           <span>تخفيض:</span>
                           <span>- {viewingInvoice.discount.toLocaleString()} دج</span>
                        </div>
                     )}
                     <div className="flex justify-between text-3xl font-black border-t-4 border-black pt-6 mt-6 text-black">
                        <span>صافي TTC</span>
                        <span>{viewingInvoice.totalTTC.toLocaleString()} دج</span>
                     </div>
                  </div>
               </div>

               <div className="mt-40 flex justify-between px-16">
                  <div className="text-center">
                     <p className="font-black text-lg border-b-2 border-black inline-block px-12 pb-2 mb-24 text-black uppercase tracking-tighter">توقيع المورد</p>
                  </div>
                  <div className="text-center">
                     <p className="font-black text-lg border-b-2 border-black inline-block px-12 pb-2 text-black uppercase tracking-tighter">توقيع الزبون</p>
                  </div>
               </div>

               <div className="absolute bottom-10 left-0 right-0 text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  <p>تم استخراج الوثيقة بواسطة نظام تدبير - التميز في إدارة الأعمال</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
