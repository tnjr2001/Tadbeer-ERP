
import React, { useState } from 'react';
import { TRANSLATIONS, ICONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPath, onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: TRANSLATIONS.dashboard, icon: ICONS.Dashboard },
    { id: 'profile', label: TRANSLATIONS.profile, icon: ICONS.Profile },
    { id: 'customers', label: TRANSLATIONS.customers, icon: ICONS.Customers },
    { id: 'suppliers', label: TRANSLATIONS.suppliers, icon: ICONS.Suppliers },
    { id: 'inventory', label: TRANSLATIONS.inventory, icon: ICONS.Inventory },
    { id: 'invoices', label: TRANSLATIONS.invoices, icon: ICONS.Invoices },
    { id: 'about', label: TRANSLATIONS.about, icon: ICONS.About },
    { id: 'contact', label: TRANSLATIONS.contact, icon: ICONS.Contact },
    { id: 'settings', label: TRANSLATIONS.settings, icon: ICONS.Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-cairo" dir="rtl">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-white border-l border-slate-200 lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-center mt-8 px-6">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="mx-2 text-2xl font-bold text-slate-800">تدبير</span>
          </div>
        </div>

        <nav className="mt-10 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-xl ${
                currentPath === item.id 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon />
              <span className="mx-4">{item.label}</span>
            </button>
          ))}

          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 mt-10 text-sm font-medium text-red-600 transition-colors duration-200 rounded-xl hover:bg-red-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="mx-4">{TRANSLATIONS.logout}</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 focus:outline-none lg:hidden">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative">
               <span className="text-slate-600 font-semibold">{TRANSLATIONS[currentPath as keyof typeof TRANSLATIONS] || currentPath}</span>
            </div>
            <img className="h-10 w-10 rounded-full object-cover border-2 border-blue-500" src="https://picsum.photos/100/100" alt="Avatar" />
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
