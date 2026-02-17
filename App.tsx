
import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from './constants';
import { 
  InventoryItem, 
  BusinessEntity, 
  Invoice, 
  UserProfile, 
  PaymentMethod,
  InvoiceItem
} from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BusinessTable from './components/BusinessTable';
import InventoryModule from './components/InventoryModule';
import InvoiceModule from './components/InvoiceModule';
import ProfilePage from './components/ProfilePage';
import AboutContact from './components/AboutContact';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('tadbier_user');
    return saved ? JSON.parse(saved) : {
      email: 'user@example.com',
      companyName: 'شركة التدبير المتميزة',
      location: 'الجزائر العاصمة',
      ownerName: 'محمد بن سالم',
      phone: '0555-123-456',
      nif: '123456789012345',
      nis: '09876543210',
      article: '16100100'
    };
  });

  const [customers, setCustomers] = useState<BusinessEntity[]>(() => {
    const saved = localStorage.getItem('tadbier_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [suppliers, setSuppliers] = useState<BusinessEntity[]>(() => {
    const saved = localStorage.getItem('tadbier_suppliers');
    return saved ? JSON.parse(saved) : [];
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('tadbier_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('tadbier_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tadbier_user', JSON.stringify(user));
    localStorage.setItem('tadbier_customers', JSON.stringify(customers));
    localStorage.setItem('tadbier_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('tadbier_inventory', JSON.stringify(inventory));
    localStorage.setItem('tadbier_invoices', JSON.stringify(invoices));
  }, [user, customers, suppliers, inventory, invoices]);

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard inventory={inventory} customers={customers} invoices={invoices} suppliers={suppliers} />;
      case 'profile':
        return <ProfilePage user={user} onSave={setUser} onLogout={() => setIsAuthenticated(false)} />;
      case 'customers':
        return <BusinessTable 
          title={TRANSLATIONS.customers} 
          data={customers} 
          invoices={invoices}
          onAdd={(item) => setCustomers([...customers, { ...item, id: Date.now().toString() }])} 
          onEdit={(id, updated) => setCustomers(customers.map(c => c.id === id ? { ...updated, id } : c))} 
          onDelete={(id) => {
            // Cascade delete invoices associated with this customer
            setInvoices(prev => prev.filter(inv => inv.customerId !== id));
            setCustomers(prev => prev.filter(c => c.id !== id));
          }} 
        />;
      case 'suppliers':
        return <BusinessTable 
          title={TRANSLATIONS.suppliers} 
          data={suppliers} 
          invoices={invoices}
          inventory={inventory}
          onAdd={(item) => setSuppliers([...suppliers, { ...item, id: Date.now().toString() }])} 
          onEdit={(id, updated) => setSuppliers(suppliers.map(s => s.id === id ? { ...updated, id } : s))} 
          onDelete={(id) => {
            // Cascade delete inventory items from this supplier
            setInventory(prev => prev.filter(item => item.supplierId !== id));
            setSuppliers(prev => prev.filter(s => s.id !== id));
          }} 
        />;
      case 'inventory':
        return <InventoryModule 
          inventory={inventory} 
          suppliers={suppliers} 
          onAdd={(item) => setInventory([...inventory, { ...item, id: Date.now().toString() }])} 
          onEdit={(id, updated) => setInventory(inventory.map(i => i.id === id ? { ...updated, id } : i))} 
          onDelete={(id) => {
            // Also need to remove it from inventory (which cascades when we sell)
            // But strict delete from the catalog:
            setInventory(prev => prev.filter(i => i.id !== id));
          }} 
        />;
      case 'invoices':
        return <InvoiceModule 
          invoices={invoices} 
          inventory={inventory} 
          customers={customers} 
          suppliers={suppliers} 
          user={user}
          onDeleteInvoice={(id) => {
             // Deleting an invoice normally is handled here
             setInvoices(invoices.filter(i => i.id !== id));
          }}
          onCreateInvoice={(inv) => {
            setInvoices([inv, ...invoices]);
            if (inv.type === 'sale') {
              const updatedInventory = inventory.map(item => {
                const invoiceItem = inv.items.find(ii => ii.itemId === item.id);
                if (invoiceItem) {
                  return { ...item, quantity: item.quantity - invoiceItem.quantity };
                }
                return item;
              });
              setInventory(updatedInventory);
            }
          }} 
        />;
      case 'about':
      case 'contact':
        return <AboutContact page={currentPage} />;
      default:
        return <Dashboard inventory={inventory} customers={customers} invoices={invoices} suppliers={suppliers} />;
    }
  };

  return (
    <Layout currentPath={currentPage} onNavigate={setCurrentPage} onLogout={() => setIsAuthenticated(false)}>
      {renderPage()}
    </Layout>
  );
};

export default App;
