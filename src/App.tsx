import React, { useState, useEffect } from 'react';
import { User, SmartContract, Order, SupplierHealth } from './types';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import DataCollectionScreen from './components/DataCollectionScreen';
import ContractsScreen from './components/ContractsScreen';
import AsistenAIScreen from './components/AsistenAIScreen';
import StokInventarisScreen from './components/StokInventarisScreen';
import OrderTrackingScreen from './components/OrderTrackingScreen';
import SupplierMatrixScreen from './components/SupplierMatrixScreen';
import { TRANSLATIONS, INITIAL_SMART_CONTRACTS, INITIAL_ORDERS, INITIAL_SUPPLIER_HEALTHS } from './data';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [currentTab, setCurrentTab] = useState<string>('dasbor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [detailStepOverride, setDetailStepOverride] = useState<'bidding' | 'verification' | 'final-confirmation' | undefined>(undefined);
  const [contracts, setContracts] = useState<SmartContract[]>(INITIAL_SMART_CONTRACTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [supplierHealths, setSupplierHealths] = useState<SupplierHealth[]>(INITIAL_SUPPLIER_HEALTHS);

  // Auto-login user if exists in DB or localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('vivaprocure_user_email');
    const url = savedEmail ? `/api/user?email=${encodeURIComponent(savedEmail)}` : '/api/user';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data) setUser(data);
      })
      .catch(err => console.error("Error auto-login:", err));
  }, []);

  // Sync state data from PostgreSQL database
  useEffect(() => {
    if (!user) return;

    fetch('/api/contracts')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setContracts(data);
      })
      .catch(err => console.error("Error fetching contracts:", err));

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setOrders(data);
      })
      .catch(err => console.error("Error fetching orders:", err));

    fetch('/api/supplier-health')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setSupplierHealths(data);
      })
      .catch(err => console.error("Error fetching supplier health:", err));
  }, [user]);

  // Enforce role-based routing checks
  useEffect(() => {
    if (user && user.role === 'supplier') {
      const restrictedTabs = ['detail', 'stok', 'supplier-matrix', 'ai'];
      if (restrictedTabs.includes(currentTab)) {
        setCurrentTab('dasbor');
      }
    }
  }, [user, currentTab]);

  const handleUpdateOrderStatus = (
    orderId: string,
    status: 'dikemas' | 'dikirim' | 'sampai' | 'diterima',
    meta?: { rating?: number; ratingDetails?: any; reviewComment?: string }
  ) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const updatedTimeline = orderToUpdate.timeline.map(step => {
      const stepsOrder: Array<'dikemas' | 'dikirim' | 'sampai' | 'diterima'> = ['dikemas', 'dikirim', 'sampai', 'diterima'];
      const targetIndex = stepsOrder.indexOf(status);
      const currentIndex = stepsOrder.indexOf(step.status);

      const isCompleted = currentIndex <= targetIndex;
      const isActive = step.status === status;

      let timestamp = step.timestamp;
      if (isCompleted && !timestamp) {
        timestamp = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      }

      return {
        ...step,
        isCompleted,
        isActive,
        timestamp
      };
    });

    let lastPositionGPS = orderToUpdate.lastPositionGPS;
    if (status === 'dikirim') {
      lastPositionGPS = lang === 'id' ? 'Toll Cikampek KM 72 - Truk Sedang Berjalan' : 'Cikampek Toll road KM 72 - Vehicle in motion';
    } else if (status === 'sampai') {
      lastPositionGPS = lang === 'id' ? 'Gudang Utama Koperasi Sumber Makmur' : 'Sumber Makmur Cooperative Main Warehouse';
    } else if (status === 'diterima') {
      lastPositionGPS = lang === 'id' ? 'Selesai Diterima (Disimpan di Gudang & Tercatat Aman)' : 'Successfully Received (Ingested & Recorded Safely)';
    }

    const updatedOrder = {
      ...orderToUpdate,
      currentStatus: status,
      lastPositionGPS,
      lastCheckedTime: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      timeline: updatedTimeline,
      rating: meta?.rating !== undefined ? meta.rating : orderToUpdate.rating,
      ratingDetails: meta?.ratingDetails !== undefined ? meta.ratingDetails : orderToUpdate.ratingDetails,
      reviewComment: meta?.reviewComment !== undefined ? meta.reviewComment : orderToUpdate.reviewComment
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedOrder),
    }).catch(err => console.error("Error updating order DB:", err));
  };

  const handleRateSupplier = (supplierName: string, stars: number) => {
    const supToUpdate = supplierHealths.find(s => s.name.toLowerCase() === supplierName.toLowerCase());
    if (!supToUpdate) return;

    let scoreChange = 0;
    if (stars === 5) scoreChange = 3;
    else if (stars === 4) scoreChange = 1;
    else if (stars === 3) scoreChange = 0;
    else if (stars === 2) scoreChange = -5;
    else if (stars === 1) scoreChange = -15;

    const percentage = Math.max(20, Math.min(100, supToUpdate.percentage + scoreChange));

    let status: 'SANGAT BAIK' | 'WASPADA' | 'BAIK' = 'BAIK';
    if (percentage >= 90) status = 'SANGAT BAIK';
    else if (percentage >= 70) status = 'BAIK';
    else status = 'WASPADA';

    const updatedSup = {
      ...supToUpdate,
      percentage,
      status
    };

    setSupplierHealths(prev => prev.map(s => s.name.toLowerCase() === supplierName.toLowerCase() ? updatedSup : s));

    fetch(`/api/supplier-health/${encodeURIComponent(updatedSup.name)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ percentage, status }),
    }).catch(err => console.error("Error updating supplier health DB:", err));
  };

  const handleAddContract = (newContract: SmartContract, allocation?: Record<string, number>) => {
    setContracts(prev => {
      if (prev.some(c => c.id === newContract.id)) {
        return prev;
      }
      return [newContract, ...prev];
    });

    fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newContract),
    }).catch(err => console.error("Error creating contract DB:", err));

    // Create an associated e-commerce tracking Order automatically!
    const newOrderId = `ORD/2026-${newContract.id.split('-').pop() || '004'}`;
    const newOrder: Order = {
      id: newOrderId,
      contractId: newContract.id,
      supplierName: newContract.secondParty,
      commodity: newContract.commodity,
      quantity: newContract.quantity,
      totalValue: newContract.totalValue,
      currentStatus: 'dikemas',
      allocation: allocation || { "Sumber Makmur": parseFloat(newContract.quantity) || 100 },
      courierName: 'Slamet Rahardjo',
      courierPhone: '0813-2287-9402',
      lastPositionGPS: lang === 'id' ? 'Gudang Pusat Pemasok (Sedang Packing)' : 'Supplier Center Depot (Cargo Packing)',
      lastCheckedTime: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      createdAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeline: [
        {
          status: 'dikemas',
          title: lang === 'id' ? 'Pesanan Diproses' : 'Order Processed',
          description: lang === 'id' ? 'Verifikasi smart contract disepakati. Pemasok sedang packing muatan kargo.' : 'Contract verified. Supplier packing cargo consignment to freight loaders.',
          timestamp: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          isActive: true,
          isCompleted: true
        },
        {
          status: 'dikirim',
          title: lang === 'id' ? 'Dalam Perjalanan' : 'In Transit',
          description: lang === 'id' ? 'Menunggu truk armada berangkat meninggalkan kompleks pabrik.' : 'Waiting for dispatch vehicle to depart warehouse depot.',
          timestamp: '',
          isActive: false,
          isCompleted: false
        },
        {
          status: 'sampai',
          title: lang === 'id' ? 'Tiba di Gudang' : 'Arrived at Destination',
          description: lang === 'id' ? 'Logistik tiba di lokasi gudang koperasi.' : 'Shipment arrived at cooperative warehouse dock.',
          timestamp: '',
          isActive: false,
          isCompleted: false
        },
        {
          status: 'diterima',
          title: lang === 'id' ? 'Telah Diterima' : 'Received & Settled',
          description: lang === 'id' ? 'Menunggu verifikasi fisik tanda terima logistik oleh pengurus koperasi dan pengisian rating.' : 'Awaiting physical review and rating submission by cooperative management.',
          timestamp: '',
          isActive: false,
          isCompleted: false
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(err => console.error("Error creating order DB:", err));
  };

  const t = TRANSLATIONS[lang];

  const [detailState, setDetailState] = useState<any>(null);

  // Helper function to handle internal redirection between screens
  const handleNavigateToTab = (tab: string, state?: any) => {
    setCurrentTab(tab);
    if (tab === 'detail') {
      setDetailState(state || null);
      if (state?.step) {
        setDetailStepOverride(state.step);
      }
    } else {
      setDetailState(null);
      setDetailStepOverride(undefined);
    }
  };

  // Logout reset
  const handleLogout = () => {
    localStorage.removeItem('vivaprocure_user_email');
    setUser(null);
    setCurrentTab('dasbor');
    setDetailStepOverride(undefined);
  };

  // If mock session not logged in, return login portal
  if (!user) {
    return (
      <LoginScreen
        lang={lang}
        setLang={setLang}
        onLoginSuccess={(userData) => {
          if (userData && userData.email) {
            localStorage.setItem('vivaprocure_user_email', userData.email);
          }
          setUser(userData);
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-[#0b1c30]" id="app-workspace">
      {/* 1. Mobile burger drawer overlay backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-30 lg:hidden transition-all"
        />
      )}

      {/* 2. Sidebar component (Responsive slide or static) */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-white p-6 z-40 transform lg:transform-none lg:translate-x-0 lg:static transition-transform duration-300 flex flex-col justify-between ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="space-y-6 flex flex-col h-full">
          {/* Logo brand */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
            <div className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg shadow-sm border border-white/20 overflow-hidden select-none">
              <img
                alt="Logo VivaProcure icon" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2QK5Q3PI1LNAhr9N_U8Qa9qUyzDiywjiqxO6WtXMwVlB8seuaa-MXG9ynm99G3sYnbV6JQfy9ZPLvBQKvkwZpfwYqBhABQiVLtIvXUSyvSMSRaO7bnDJrYk73rglpLetjqY3rFf4euk1KCvOf0FbuOGDBfPvLMWDsgp0iTAHlFA2gUhPsL0GBdljAd8Gs8a_A8H4Irm7MDufvPj6VB15n07CfY1sJQ4IswCseWnLB_UPlj2m5wQI2Jog2Bc5c6zAeQ36LArD9pSda"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-sans text-lg font-black tracking-tight uppercase select-none">{t.brandTitle}</h1>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none font-mono">{t.agroIntel}</span>
            </div>
          </div>

          {/* User Card inside sidebar */}
          <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl flex items-center gap-3">
            <img
              alt="User profile avatar" 
              className="w-10 h-10 rounded-full border-2 border-blue-500/20 object-cover shrink-0" 
              src={user.avatar}
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs truncate text-white leading-tight">{user.name}</h4>
              <p className="text-[9px] text-blue-400 font-extrabold uppercase tracking-wider mt-0.5 leading-none">
                {user.role === 'super_admin' ? (lang === 'id' ? 'Super Admin' : 'Super Admin') :
                 user.role === 'cooperative_admin' ? (lang === 'id' ? 'Admin Koperasi' : 'Cooperative Admin') :
                 (lang === 'id' ? 'Mitra Pemasok' : 'Supplier Partner')}
              </p>
            </div>
          </div>

          {/* Nav links */}
          <nav aria-label="Main Navigation" className="flex-1 space-y-1.5 pt-2">
            {/* Dasbor link */}
            <button
              onClick={() => { setCurrentTab('dasbor'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-none outline-none cursor-pointer focus:outline-none ${
                currentTab === 'dasbor' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              {t.dasbor}
            </button>

            {user.role !== 'supplier' && (
              <>
                {/* Detail Sesi link */}
                <button
                  onClick={() => { setCurrentTab('detail'); setDetailStepOverride(undefined); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-none outline-none cursor-pointer focus:outline-none ${
                    currentTab === 'detail' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  {t.detailSesi}
                </button>
              </>
            )}

            {/* Smart Contract link */}
            <button
              onClick={() => { setCurrentTab('contracts'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-none outline-none cursor-pointer focus:outline-none ${
                currentTab === 'contracts' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">gavel</span>
              {t.contracts}
            </button>

            {user.role !== 'supplier' && (
              <>
                {/* Asisten AI Link */}
                <button
                  onClick={() => { setCurrentTab('ai'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-none outline-none cursor-pointer focus:outline-none relative overflow-hidden group ${
                    currentTab === 'ai' ? 'bg-gradient-to-r from-[#3B82F6] to-blue-700 text-white shadow-sm border border-blue-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-blue-400 font-bold group-hover:scale-110 transition-transform">auto_awesome</span>
                  <span className="relative z-10">{t.asistenAI}</span>
                  <span className="ml-auto text-[8px] bg-blue-500/20 text-blue-300 font-mono font-bold px-1.5 py-0.5 rounded uppercase select-none">AI</span>
                </button>

                {/* Stok link */}
                <button
                  onClick={() => { setCurrentTab('stok'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-none outline-none cursor-pointer focus:outline-none ${
                    currentTab === 'stok' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">warehouse</span>
                  {t.stokInventaris}
                </button>
              </>
            )}

            {/* Order Tracking link */}
            <button
              onClick={() => { setCurrentTab('order'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-none outline-none cursor-pointer focus:outline-none ${
                currentTab === 'order' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              {t.lacakOrder}
            </button>

            {user.role !== 'supplier' && (
              <>
                {/* Supplier Matrix link */}
                <button
                  onClick={() => { setCurrentTab('supplier-matrix'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-none outline-none cursor-pointer focus:outline-none ${
                    currentTab === 'supplier-matrix' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">query_stats</span>
                  {t.matriksPemasok}
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar bottom panel and logout */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          {/* Active stats details */}
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-500">{lang === 'id' ? 'Bahasa / Language:' : 'Language:'}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setLang('id')}
                className={`transition-all font-bold cursor-pointer text-xs ${lang === 'id' ? 'text-blue-400 underline decoration-2' : 'text-slate-400 hover:text-white'}`}
              >
                ID
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => setLang('en')}
                className={`transition-all font-bold cursor-pointer text-xs ${lang === 'en' ? 'text-blue-400 underline decoration-2' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-950/20 hover:bg-rose-950/50 text-rose-400 border border-rose-900/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 outline-none focus:outline-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            {t.logout}
          </button>
        </div>
      </aside>

      {/* 3. Main content body panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Main top context navbar */}
        <header className="bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4 sticky top-0 z-20 shadow-sm/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-50 rounded-lg text-slate-600 focus:outline-none"
              aria-label="Open sidebar"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#3d4a42]/80 uppercase tracking-widest select-none">
              <span>{t.brandTitle}</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-[#3B82F6]">{t[currentTab as keyof typeof t] || currentTab}</span>
            </div>
          </div>

          {/* Org details */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-[#eff4ff] border border-[#eff4ff]/20 px-3 py-1.5 rounded-lg select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">{user.cooperative}</span>
            </div>

            <img
              alt="Chairman User profile" 
              className="w-8 h-8 rounded-full border border-gray-100 object-cover" 
              src={user.avatar}
              referrerPolicy="no-referrer"
            />
          </div>
        </header>

        {/* Outer Workspace Viewport padding */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8" id="viewport-workspace-panel">
          {currentTab === 'dasbor' && (
            <DashboardScreen
              user={user}
              lang={lang}
              onNavigateToTab={handleNavigateToTab}
              supplierHealths={supplierHealths}
            />
          )}

          {currentTab === 'detail' && (
            <DataCollectionScreen
              lang={lang}
              initialStep={detailStepOverride}
              navigationState={detailState}
              onNavigateToTab={handleNavigateToTab}
              onAddContract={handleAddContract}
              contracts={contracts}
              user={user}
            />
          )}

          {currentTab === 'contracts' && (
            <ContractsScreen 
              lang={lang}
              contracts={contracts}
              onAddContract={handleAddContract}
              user={user}
            />
          )}

          {currentTab === 'ai' && (
            <AsistenAIScreen lang={lang} />
          )}

          {currentTab === 'stok' && (
            <StokInventarisScreen lang={lang} user={user} />
          )}

          {currentTab === 'order' && (
            <OrderTrackingScreen
              lang={lang}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onRateSupplier={handleRateSupplier}
              user={user}
            />
          )}

          {currentTab === 'supplier-matrix' && (
            <SupplierMatrixScreen
              lang={lang}
              supplierHealths={supplierHealths}
              orders={orders}
            />
          )}
        </main>
      </div>
    </div>
  );
}
