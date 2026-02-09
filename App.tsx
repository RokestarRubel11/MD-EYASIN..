
import React, { useState, useMemo, useEffect } from 'react';
import { User, Product, Customer, Sale, Purchase, AppSettings } from './types';
import { getStore, saveStore, StoreData } from './store';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import PurchasePage from './pages/Purchase';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import AdminApproval from './pages/AdminApproval';
import Settings from './pages/Settings';
import { LogOut, Menu, X, XCircle } from 'lucide-react';

const App: React.FC = () => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('khmteam_auth');
    return saved ? JSON.parse(saved) : null;
  });
  
  // App data state
  const [store, setStore] = useState<StoreData>(getStore());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('personal');

  // Sync latest user info from store to current session
  const userWithLatestPermissions = useMemo(() => {
    if (!currentUser) return null;
    const storeUser = store.users.find(u => u.id === currentUser.id);
    return storeUser || currentUser;
  }, [store.users, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('khmteam_auth', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('khmteam_auth');
  };

  const updateStore = (updater: (prev: StoreData) => StoreData) => {
    setStore(prev => {
      const next = updater(prev);
      saveStore(next);
      return next;
    });
  };

  if (!currentUser) {
    return (
      <Login 
        onLogin={handleLogin} 
        users={store.users} 
        setUsers={(u) => updateStore(s => ({...s, users: u}))} 
      />
    );
  }

  const renderPage = () => {
    const user = userWithLatestPermissions!;
    const hasPermission = (perm: string) => user.role === 'ADMIN' || user.permissions.includes(perm);

    switch (currentPage) {
      case 'personal': return <Dashboard store={store} />;
      case 'sales': 
        return hasPermission('can_sale') ? <Sales store={store} setStore={updateStore} user={user} /> : <AccessDenied />;
      case 'purchase': 
        return user.role === 'ADMIN' ? <PurchasePage store={store} setStore={updateStore} /> : <AccessDenied />;
      case 'inventory': 
        return hasPermission('view_inventory') ? <Inventory store={store} setStore={updateStore} /> : <AccessDenied />;
      case 'customers': 
        return hasPermission('manage_customers') ? <Customers store={store} setStore={updateStore} /> : <AccessDenied />;
      case 'reports': 
        return user.role === 'ADMIN' ? <Reports store={store} /> : <AccessDenied />;
      case 'admin-approval': 
        return user.role === 'ADMIN' ? <AdminApproval store={store} setStore={updateStore} /> : <AccessDenied />;
      case 'settings': 
        return user.role === 'ADMIN' ? <Settings store={store} setStore={updateStore} /> : <AccessDenied />;
      default: return <Dashboard store={store} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 z-20 transition-opacity bg-black/50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 transition duration-300 transform bg-white lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full shadow-2xl lg:shadow-none">
          <div className="flex items-center justify-between px-8 py-6 bg-blue-700 text-white">
             <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter uppercase italic leading-none">KHMTEAM</span>
                <span className="text-[10px] font-bold tracking-[0.2em] opacity-70 mt-1 uppercase">Management System</span>
             </div>
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-blue-600 rounded-lg transition-colors">
               <X className="w-6 h-6" />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-gray-50/30 py-4">
            <Sidebar 
              currentPage={currentPage} 
              onNavigate={(p) => { setCurrentPage(p); setSidebarOpen(false); }} 
              userRole={userWithLatestPermissions!.role}
              userPermissions={userWithLatestPermissions!.permissions}
            />
          </div>

          <div className="p-6 border-t border-gray-100 bg-white">
            <div className="flex items-center space-x-3 mb-6 p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                {userWithLatestPermissions!.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{userWithLatestPermissions!.name}</p>
                <div className="flex items-center mt-0.5">
                   <div className={`w-2 h-2 rounded-full mr-1.5 ${userWithLatestPermissions!.status === 'APPROVED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-orange-500'}`}></div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{userWithLatestPermissions!.role}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 text-red-500 hover:text-white font-black transition-all w-full py-3.5 hover:bg-red-500 rounded-2xl border-2 border-red-50 hover:border-red-500 uppercase tracking-widest text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 no-print shadow-sm z-10">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <div className="ml-4">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                {currentPage.replace('-', ' ')}
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:block">System Node: Netlify Local Persistence</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">{new Date().toLocaleDateString('en-GB', { weekday: 'long' })}</p>
                <p className="text-sm font-black text-gray-800">{new Date().toLocaleDateString('en-GB')}</p>
             </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

const AccessDenied = () => (
  <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
    <div className="bg-red-50 p-10 rounded-full mb-8">
      <XCircle className="w-24 h-24 text-red-600" />
    </div>
    <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter">ACCESS DENIED</h1>
    <p className="text-gray-500 max-w-md font-bold text-lg">আপনার এই পেজটি দেখার অনুমতি নেই।</p>
    <p className="text-gray-400 text-sm mt-2">অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করে পারমিশন আপডেট করুন।</p>
    <button 
      onClick={() => window.location.reload()} 
      className="mt-10 bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
    >
      Go to Dashboard
    </button>
  </div>
);

export default App;
