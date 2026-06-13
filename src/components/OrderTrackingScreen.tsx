import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data';
import { Order, OrderTrackingStep, User } from '../types';

interface OrderTrackingScreenProps {
  lang: 'id' | 'en';
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: 'dikemas' | 'dikirim' | 'sampai' | 'diterima', meta?: { rating?: number; ratingDetails?: any; reviewComment?: string }) => void;
  onRateSupplier: (supplierName: string, stars: number) => void;
  user: User | null;
}

export default function OrderTrackingScreen({ lang, orders, onUpdateOrderStatus, onRateSupplier, user }: OrderTrackingScreenProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[1]?.id || orders[0]?.id || '');
  const [filterTab, setFilterTab] = useState<'semua' | 'aktif' | 'selesai'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Rating modal states
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [timelinessVal, setTimelinessVal] = useState(5);
  const [qualityVal, setQualityVal] = useState(5);
  const [serviceVal, setServiceVal] = useState(5);
  const [commentText, setCommentText] = useState('');

  // Stock Database states
  const [stockList, setStockList] = useState<any[]>([]);
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [receivedQty, setReceivedQty] = useState<string>('');

  const t = TRANSLATIONS[lang];

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Load stocks when modal opens to auto-populate SKU dropdown and prefill qty
  useEffect(() => {
    if (isRatingModalOpen) {
      fetch('/api/stocks')
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setStockList(data);
            
            // Auto-match commodity with stock name to auto-select SKU
            const matchedStock = data.find((item: any) => 
              selectedOrder && (
                item.name.toLowerCase().includes(selectedOrder.commodity.toLowerCase()) || 
                selectedOrder.commodity.toLowerCase().includes(item.name.toLowerCase())
              )
            );
            if (matchedStock) {
              setSelectedSku(matchedStock.sku);
            } else {
              setSelectedSku(data[0].sku);
            }
          }
        })
        .catch(err => console.error("Error loading stocks for receiving:", err));

      if (selectedOrder) {
        const qtyMatch = selectedOrder.quantity.match(/^([\d.,]+)/);
        if (qtyMatch) {
          setReceivedQty(qtyMatch[1].replace(/,/g, ''));
        } else {
          setReceivedQty('');
        }
      }
    }
  }, [isRatingModalOpen, selectedOrder]);

  // Filter & Search orders
  const filteredOrders = orders.filter(order => {
    // Role-based filtering
    if (user) {
      if (user.role === 'cooperative_admin') {
        const coopName = user.cooperative || '';
        const hasAllocation = order.allocation && Object.keys(order.allocation).some(k => 
          k.toLowerCase().includes(coopName.toLowerCase()) || coopName.toLowerCase().includes(k.toLowerCase())
        );
        if (!hasAllocation) return false;
      } else if (user.role === 'supplier') {
        const isSupplier = order.supplierName.toLowerCase().includes(user.name.toLowerCase()) ||
                           (user.name.toLowerCase().includes('herman') && order.supplierName.toLowerCase().includes('subur jaya'));
        if (!isSupplier) return false;
      }
    }

    // search filter
    const matchesQuery = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    // tab filter
    if (filterTab === 'aktif') {
      return order.currentStatus !== 'diterima';
    } else if (filterTab === 'selesai') {
      return order.currentStatus === 'diterima';
    }
    return true;
  });

  const handleSimulateStep = (status: 'dikirim' | 'sampai') => {
    if (!selectedOrder) return;
    onUpdateOrderStatus(selectedOrder.id, status);
  };

  const handleOpenRatingModal = () => {
    setRatingVal(5);
    setTimelinessVal(5);
    setQualityVal(5);
    setServiceVal(5);
    setCommentText('');
    setIsRatingModalOpen(true);
  };

  const handleSubmitRating = () => {
    if (!selectedOrder) return;
    
    // Calculate final rating average or directly use main user score input
    onUpdateOrderStatus(selectedOrder.id, 'diterima', {
      rating: ratingVal,
      ratingDetails: {
        timeliness: timelinessVal,
        quality: qualityVal,
        service: serviceVal
      },
      reviewComment: commentText.trim() || (lang === 'id' ? 'Barang diterima dengan baik oleh tim gudang.' : 'Goods successfully received by the warehouse team.')
    });

    // Update supplier health matrix dynamically
    onRateSupplier(selectedOrder.supplierName, ratingVal);

    setIsRatingModalOpen(false);
    alert(lang === 'id' 
      ? `Konfirmasi penerimaan sukses! Penilaian ${ratingVal} Bintang dicatat di ledger untuk ${selectedOrder.supplierName}.` 
      : `Receipt confirmed! A rating of ${ratingVal} Stars has been committed in the ledger for ${selectedOrder.supplierName}.`
    );
  };

  // Status style helper
  const getStatusBadge = (status: 'dikemas' | 'dikirim' | 'sampai' | 'diterima') => {
    switch (status) {
      case 'dikemas':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-100">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
            {lang === 'id' ? 'DIKEMAS' : 'PACKING'}
          </span>
        );
      case 'dikirim':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
            {lang === 'id' ? 'DIKIRIM (TRANSIT)' : 'SHIPPED'}
          </span>
        );
      case 'sampai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce"></span>
            {lang === 'id' ? 'TIBA DI GUDANG' : 'ARRIVED'}
          </span>
        );
      case 'diterima':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="material-symbols-outlined text-[13px] font-extrabold text-emerald-600">verified</span>
            {lang === 'id' ? 'DITERIMA (CLOSED)' : 'RECEIVED'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in font-sans" id="order-screen-root">
      
      {/* 1. Header Information */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0b1c30] tracking-tight leading-tight">
            {lang === 'id' ? 'Pelacakan Pengiriman & Konfirmasi Barang' : 'Logistics Tracking & Confirmation'}
          </h2>
          <p className="text-[#64748b] text-xs font-semibold mt-1">
            {lang === 'id'
              ? 'Pantau pergerakan armada logistik supplier secara real-time, verifikasi kargo fisik, dan submit rating kesehatan pemasok.'
              : 'Monitor real-time transit status, perform physical cargo verification, and submit critical supplier credibility ratings.'}
          </p>
        </div>

        {/* Sync badge info */}
        <div className="flex items-center gap-2.5 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm self-start md:self-auto select-none">
          <span className="material-symbols-outlined text-green-500 font-bold">local_shipping</span>
          <div className="font-sans text-xs">
            <span className="text-gray-400 font-bold block uppercase text-[8px] tracking-wider font-mono">Carrier GPS Feeds</span>
            <span className="font-extrabold text-emerald-600">Active • 100% Synced</span>
          </div>
        </div>
      </div>

      {/* 2. Main split page layouts (Selector list vs progress cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Order Listing & Filtering card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
            
            {/* Search inputs */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all outline-none text-[#0b1c30]"
                placeholder={lang === 'id' ? 'Cari ID, barang, supplier...' : 'Search ID, item, supplier...'}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter segments buttons */}
            <div className="bg-slate-100 p-1 rounded-lg flex gap-1 text-[11px] font-bold">
              <button
                onClick={() => setFilterTab('semua')}
                className={`flex-1 py-1.5 rounded-md transition-all text-center focus:outline-none border-none cursor-pointer ${
                  filterTab === 'semua' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'id' ? 'Semua' : 'All'}
              </button>
              <button
                onClick={() => setFilterTab('aktif')}
                className={`flex-1 py-1.5 rounded-md transition-all text-center focus:outline-none border-none cursor-pointer ${
                  filterTab === 'aktif' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'id' ? 'Aktif' : 'Active'}
              </button>
              <button
                onClick={() => setFilterTab('selesai')}
                className={`flex-1 py-1.5 rounded-md transition-all text-center focus:outline-none border-none cursor-pointer ${
                  filterTab === 'selesai' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'id' ? 'Selesai' : 'Completed'}
              </button>
            </div>

            {/* Order lists */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-semibold text-xs leading-relaxed">
                  {lang === 'id' ? 'Tidak ada pesanan pengiriman.' : 'No filtered orders found.'}
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none space-y-2 relative overflow-hidden ${
                      selectedOrderId === order.id
                        ? 'bg-blue-50/20 border-blue-500 shadow-sm'
                        : 'bg-white border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {/* Active accent vertical line */}
                    {selectedOrderId === order.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    )}

                    <div className="flex justify-between items-start gap-2">
                      <span className="font-mono text-[9px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {order.id}
                      </span>
                      {getStatusBadge(order.currentStatus)}
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-[#0b1c30]">{order.commodity}</h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5 font-mono">{order.quantity} • {order.supplierName}</p>
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-2 border-t border-gray-100 mt-2 font-semibold">
                      <span className="text-gray-400">{lang === 'id' ? 'Nilai:' : 'Value:'}</span>
                      <span className="text-[#0b1c30] font-bold">{order.totalValue}</span>
                    </div>

                    {/* Display stars if rated */}
                    {order.rating && (
                      <div className="flex items-center gap-1 pt-1">
                        <span className="text-[9px] font-extrabold text-amber-500 flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="material-symbols-outlined text-[13px] font-bold" style={{ fontVariationSettings: `"${i < (order.rating || 0) ? 'FILL' : 'wght'}" 1` }}>star</span>
                          ))}
                        </span>
                        <span className="text-[9px] text-[#64748b] font-bold ml-1 font-mono">({order.rating}/5)</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Tracking Progress Card */}
        <div className="lg:col-span-8 flex flex-col">
          {selectedOrder ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6 flex-1">
              
              {/* Card top banner with title / ID */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-4 gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-800 font-mono text-[9px] font-black px-2.5 py-1 rounded tracking-wider">
                      {selectedOrder.id}
                    </span>
                    <span className="text-gray-300 font-bold font-mono">/</span>
                    <span className="text-xs text-[#3b82f6] font-bold font-mono underline cursor-pointer" onClick={() => alert(`${lang === 'id' ? 'Menampilkan detail kontrak' : 'Displaying contract details'} ${selectedOrder.contractId}`)}>
                      {selectedOrder.contractId}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0b1c30] tracking-tight mt-1">
                    {selectedOrder.commodity} ({selectedOrder.quantity})
                  </h3>
                  <p className="text-xs text-[#64748b] font-medium mt-0.5">
                    {lang === 'id' ? 'Disediakan oleh:' : 'Supplied by:'} <strong className="text-slate-800 font-extrabold">{selectedOrder.supplierName}</strong>
                  </p>
                </div>

                <div className="text-right flex flex-col items-start sm:items-end">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono">{lang === 'id' ? 'Pagu Anggaran' : 'Contract Budget'}</span>
                  <p className="text-base font-black text-rose-600 mt-0.5">{selectedOrder.totalValue}</p>
                </div>
              </div>

              {/* Grid content split: Timeline tracker vs Dispatch controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* 2.1 E-Commerce style visual progress logging */}
                <div className="md:col-span-7 space-y-5">
                  <h4 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#3B82F6]">checklist_rtl</span>
                    {lang === 'id' ? 'Alur Status Pengiriman' : 'Transit Steps Progress'}
                  </h4>

                  {/* Vertical Progress Stepper */}
                  <div className="relative pl-6 space-y-6">
                    {/* Connecting line background */}
                    <div className="absolute top-2.5 bottom-2.5 left-[11px] w-0.5 bg-gray-100"></div>

                    {selectedOrder.timeline.map((step, idx) => {
                      const isStepDone = step.isCompleted;
                      const isStepActive = step.status === selectedOrder.currentStatus;

                      return (
                        <div key={idx} className="relative group select-none">
                          {/* Dot indicator */}
                          <div className={`absolute left-[-21px] top-1 w-[13px] h-[13px] rounded-full border-2 transition-all flex items-center justify-center z-10 ${
                            isStepDone 
                              ? 'bg-[#3B82F6] border-blue-500 ring-4 ring-blue-500/10' 
                              : isStepActive
                                ? 'bg-amber-400 border-amber-500 ring-4 ring-amber-500/15'
                                : 'bg-white border-gray-300'
                          }`}>
                            {isStepDone && (
                              <span className="material-symbols-outlined text-white text-[9px] font-black">check</span>
                            )}
                          </div>

                          {/* Content frame */}
                          <div className={`p-3 rounded-lg border transition-all text-xs ${
                            isStepActive 
                              ? 'bg-blue-50/20 border-blue-200' 
                              : isStepDone 
                                ? 'border-gray-100 bg-slate-50/30' 
                                : 'border-dashed border-gray-200 opacity-60'
                          }`}>
                            <div className="flex justify-between items-start gap-2">
                              <h5 className={`font-bold ${isStepActive ? 'text-blue-600' : isStepDone ? 'text-slate-800' : 'text-gray-400'}`}>
                                {step.title}
                              </h5>
                              <span className="text-[9px] text-gray-400 font-mono font-bold shrink-0">{step.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
                              {step.description}
                            </p>

                            {/* Display review content specifically in step 4 block */}
                            {step.status === 'diterima' && selectedOrder.rating && (
                              <div className="mt-2 pt-2 border-t border-gray-100 space-y-1 bg-amber-50/30 p-2.5 rounded-lg border border-amber-100/50">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-[10px] text-[#0b1c30]">Penilaian Anda:</span>
                                  <div className="flex text-amber-500 select-none">
                                    {[...Array(5)].map((_, i) => (
                                      <span key={i} className="material-symbols-outlined text-[13px] font-bold" style={{ fontVariationSettings: `"${i < (selectedOrder.rating || 0) ? 'FILL' : 'wght'}" 1` }}>star</span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-600 italic font-semibold">"{selectedOrder.reviewComment}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2.2 Courier Dispatch metadata & Simulator interactive buttons */}
                <div className="md:col-span-5 space-y-6">
                  
                  {/* Courier Card profile info */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <h4 className="text-[9px] text-[#64748b] font-black uppercase tracking-wider font-mono">
                      {lang === 'id' ? 'Detail Truk & Kurir Penanggung Jawab' : 'Shipment Vehicle & Driver'}
                    </h4>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#3B82F6] flex items-center justify-center font-extrabold text-sm border border-blue-200">
                        {selectedOrder.courierName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-[#0b1c30]">{selectedOrder.courierName}</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 font-mono">{selectedOrder.courierPhone}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 font-sans text-[11px] text-slate-600 font-semibold space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{lang === 'id' ? 'Nomor Armada (Pelat):' : 'Fleet No (Plate):'}</span>
                        <span className="text-[#0b1c30] font-bold font-mono">AD 8842 WG</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{lang === 'id' ? 'Jenis Armada:' : 'Truck Model:'}</span>
                        <span className="text-[#0b1c30] font-bold">Tronton Box 12-W</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">GPS Tracker ID:</span>
                        <span className="text-[#3b82f6] font-mono leading-none font-bold">TRK-982-GPS</span>
                      </div>
                    </div>
                  </div>

                  {/* Realtime coordinates location feeds tracker */}
                  <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-[10px]">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Real-time Dispatch feeds</span>
                      <span className="flex items-center gap-1 text-blue-400 font-bold text-[8px]">
                        <span className="w-1 h-1 rounded-full bg-blue-400 animate-ping"></span>
                        LIVE FEED
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-500 block">LAST RECORDED COORDINATES:</span>
                        <span className="font-bold text-white block mt-0.5">{selectedOrder.lastPositionGPS}</span>
                      </div>
                      <div className="flex justify-between pt-1 text-slate-400">
                        <span>Last Checked:</span>
                        <span className="text-white">{selectedOrder.lastCheckedTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active context controls */}
                  <div className="space-y-3">
                    
                    {/* Interactive Simulator Tools */}
                    {selectedOrder.currentStatus !== 'diterima' && user && (user.role === 'supplier' || user.role === 'super_admin') && (
                      <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3.5 space-y-2.5">
                        <span className="text-[9px] text-amber-700 bg-amber-100 font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider block w-fit">
                          {lang === 'id' ? 'Simulasi Perjalanan (Fungsi Demo)' : 'Courier Simulation Controls'}
                        </span>
                        
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          {lang === 'id' 
                            ? 'Asumsikan diri Anda sebagai Kurir/Pemasok dalam sistem untuk mendemonstrasikan pergerakan armada.' 
                            : 'Fulfill the courier pipeline role to test order delivery states interactively.'}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {selectedOrder.currentStatus === 'dikemas' && (
                            <button
                              onClick={() => handleSimulateStep('dikirim')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded text-[10px] flex items-center gap-1 border-none outline-none cursor-pointer focus:outline-none transition-all active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[13px]">local_shipping</span>
                              {lang === 'id' ? 'Kirim Barang' : 'Dispatch Goods'}
                            </button>
                          )}
                          
                          {selectedOrder.currentStatus === 'dikirim' && (
                            <button
                              onClick={() => handleSimulateStep('sampai')}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded text-[10px] flex items-center gap-1 border-none outline-none cursor-pointer focus:outline-none transition-all active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[13px]">where_to_vote</span>
                              {lang === 'id' ? 'Tiba di Tujuan (Kurir)' : 'Arrived at Destination'}
                            </button>
                          )}

                          {selectedOrder.currentStatus === 'sampai' && (
                            <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 w-full flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">done_all</span>
                              {lang === 'id' ? 'Kurir sampai! Sekarang verifikasi di bawah.' : 'Courier arrived! Confirm receiving cargo below.'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cooperative Main Receipt verification Trigger */}
                    {selectedOrder.currentStatus === 'sampai' ? (
                      user && (user.role === 'cooperative_admin' || user.role === 'super_admin') ? (
                        <button
                          onClick={handleOpenRatingModal}
                          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 border-none outline-none cursor-pointer focus:outline-none"
                        >
                          <span className="material-symbols-outlined">gavel</span>
                          {lang === 'id' ? 'Konfirmasi Penerimaan & Beri Rating' : 'Confirm Receipt & Complete Order'}
                        </button>
                      ) : (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 flex items-center gap-3">
                          <span className="material-symbols-outlined text-amber-500 text-[26px]">info</span>
                          <div className="text-xs font-semibold">
                            <p className="font-extrabold leading-snug">{lang === 'id' ? 'Pesanan Tiba di Tujuan' : 'Order Arrived at Destination'}</p>
                            <p className="text-slate-500 mt-0.5">{lang === 'id' ? 'Menunggu Ketua Koperasi memverifikasi fisik barang dan merilis dana.' : 'Awaiting Cooperative Chairman to verify physical goods and complete order.'}</p>
                          </div>
                        </div>
                      )
                    ) : selectedOrder.currentStatus === 'diterima' ? (
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3 text-emerald-800">
                        <span className="material-symbols-outlined text-emerald-500 text-[26px]">task_alt</span>
                        <div className="text-xs">
                          <p className="font-extrabold leading-snug">{lang === 'id' ? 'Order Selesai & Ditutup' : 'Order Finished & Settled'}</p>
                          <p className="text-slate-500 font-semibold mt-0.5">{lang === 'id' ? 'Seluruh langkah sukses dicatat pada ledger.' : 'All transit pipeline logs safely archived on the chain.'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-gray-200/80 rounded-xl text-center text-slate-500 font-semibold text-xs leading-relaxed font-mono">
                        {lang === 'id' ? 'Menunggu logistik perjalanan dikirim...' : 'Awaiting transit pipeline updates / dispatch...'}
                      </div>
                    )}

                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-slate-400 font-semibold text-xs flex-1 flex flex-col items-center justify-center">
              {lang === 'id' ? 'Silakan pilih pesanan untuk melihat pelacakan.' : 'Please select an order to view live logs.'}
            </div>
          )}
        </div>

      </div>

      {/* 3. Rating & Review Feedback Dialog Overlay Modal */}
      {isRatingModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Heading header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50 select-none">
              <h3 className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 font-bold">stars</span>
                {lang === 'id' ? 'Konfirmasi Serah Terima & Beri Rating' : 'Supplier Credit Rating Registration'}
              </h3>
              <button 
                onClick={() => setIsRatingModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 transition-colors focus:outline-none bg-transparent border-none cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal fields scrollable */}
            <div className="p-6 space-y-5 flex-1 max-h-[75vh] overflow-y-auto">
              
              <div className="bg-blue-50/40 border border-blue-100 p-3 rounded-lg text-xs leading-relaxed text-blue-800 font-semibold">
                {lang === 'id' 
                  ? `Anda menyatakan bahwa pengiriman ${selectedOrder.commodity} (${selectedOrder.quantity}) telah diserahterimakan seutuhnya secara fisik ke koperasi. Penilaian Anda di bawah ini secara langsung memengaruhi Supplier Credit Score & Health Matrix.` 
                  : `You declare that ${selectedOrder.commodity} (${selectedOrder.quantity}) shipment has been physical received. Your rating parameters will directly adjust the supplier reliability index.`}
              </div>

              {/* Main Overall Rating 1-5 Stars */}
              <div className="space-y-2 text-center py-2 bg-slate-50 rounded-xl border border-gray-150">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">{lang === 'id' ? 'Penilaian Keseluruhan (Overall star)' : 'Overall Supplier Rating'}</label>
                <div className="flex justify-center gap-2 text-amber-500 my-1 select-none">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingVal(star)}
                      className="text-amber-500 hover:scale-110 active:scale-95 transition-transform border-none bg-transparent outline-none cursor-pointer p-0 focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: `"${star <= ratingVal ? 'FILL' : 'wght'}" 1` }}>
                        star
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-xs font-black text-[#0b1c30] font-mono block">
                  {ratingVal} {lang === 'id' ? 'Bintang' : 'Stars'} - {
                    ratingVal === 5 ? (lang === 'id' ? 'Luar Biasa Memuaskan' : 'Excellent') :
                    ratingVal === 4 ? (lang === 'id' ? 'Sangat Baik' : 'Good') :
                    ratingVal === 3 ? (lang === 'id' ? 'Standar / Cukup' : 'Satisfactory') :
                    ratingVal === 2 ? (lang === 'id' ? 'Kurang Memuaskan' : 'Below Average') :
                    (lang === 'id' ? 'Buruk / Melanggar Kontrak' : 'Poor / Deficient')
                  }
                </span>
              </div>

              {/* Advanced star category matrix */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono border-b border-gray-100 pb-1">
                  {lang === 'id' ? 'Metrik Performa Pendukung' : 'Performance Category Rating'}
                </h4>

                <div className="space-y-3">
                  {/* Aspect 1: Timeliness */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-slate-700">{lang === 'id' ? 'Ketepatan Waktu Pengiriman' : 'On-time Delivery'}</span>
                    <div className="flex gap-1 select-none text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setTimelinessVal(s)} className="border-none bg-transparent outline-none cursor-pointer focus:outline-none p-0">
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: `"${s <= timelinessVal ? 'FILL' : 'wght'}" 1` }}>star</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect 2: Quality of Goods */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-slate-700">{lang === 'id' ? 'Kualitas Kemasan & Produk' : 'Cargo Condition & Quality'}</span>
                    <div className="flex gap-1 select-none text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setQualityVal(s)} className="border-none bg-transparent outline-none cursor-pointer focus:outline-none p-0">
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: `"${s <= qualityVal ? 'FILL' : 'wght'}" 1` }}>star</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect 3: Response Service */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-slate-700">{lang === 'id' ? 'Ketanggapan Komunikasi Pemasok' : 'Communication & Service'}</span>
                    <div className="flex gap-1 select-none text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setServiceVal(s)} className="border-none bg-transparent outline-none cursor-pointer focus:outline-none p-0">
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: `"${s <= serviceVal ? 'FILL' : 'wght'}" 1` }}>star</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Warehouse Stock Receipt Integration */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-gray-150">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono border-b border-gray-200 pb-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">inventory_2</span>
                  {lang === 'id' ? 'Integrasi Stok Gudang Koperasi (Otomatis)' : 'Cooperative Stock Integration (Automatic)'}
                </h4>
                
                <div className="text-xs text-[#0b1c30] space-y-2.5">
                  <p className="font-semibold text-slate-500">
                    {lang === 'id' 
                      ? 'Stok berikut akan otomatis ditambahkan ke masing-masing koperasi saat pesanan diselesaikan:' 
                      : 'The following stock volumes will be automatically posted to each cooperative upon receipt:'}
                  </p>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-3.5 divide-y divide-gray-100 font-sans shadow-inner">
                    {selectedOrder.allocation ? (
                      Object.entries(selectedOrder.allocation).map(([coopName, qty]) => (
                        <div key={coopName} className="flex justify-between py-2 first:pt-0 last:pb-0 font-semibold text-xs">
                          <span className="text-slate-700">{coopName}</span>
                          <span className="text-emerald-600 font-bold font-mono">+{qty} {selectedOrder.quantity.includes("Liter") ? "Liter" : "Ton"}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between py-2 first:pt-0 last:pb-0 font-semibold text-xs">
                        <span className="text-slate-700">Koperasi Sumber Makmur</span>
                        <span className="text-emerald-600 font-bold font-mono">+{selectedOrder.quantity}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-[10px] text-gray-400 italic">
                    {lang === 'id'
                      ? '*Sistem mendeteksi kecocokan item secara otomatis dan membuat log penerimaan tersertifikasi di database.'
                      : '*The system automatically maps these adjustments and publishes certifiable receipt logs.'}
                  </p>
                </div>
              </div>

              {/* Comment text field */}
              <div className="space-y-1 text-xs">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="modal-comment">{lang === 'id' ? 'Catatan Tambahan / Review Berita Acara' : 'Feedback Comments'}</label>
                <textarea
                  id="modal-comment"
                  className="w-full h-20 border border-gray-200 rounded-lg p-2.5 font-semibold focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all outline-none resize-none"
                  placeholder={lang === 'id' ? 'Contoh: Pupuk dikirim kering, kemasan utuh terlindungi terpal. Kurir kooperatif mengecek timbangan...' : 'E.g., Delivered in waterproof packaging, truck weight verified, very courteous driver.'}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </div>

            </div>

            {/* Modal footer action */}
            <div className="p-4 bg-slate-50 border-t border-gray-100 flex gap-2 justify-end">
              <button
                onClick={() => setIsRatingModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-[#0b1c30] hover:bg-slate-100 font-bold text-xs transition-colors focus:outline-none border-none cursor-pointer"
              >
                {t.batal}
              </button>
              <button
                onClick={handleSubmitRating}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-all border-none outline-none cursor-pointer focus:outline-none active:scale-95"
              >
                {lang === 'id' ? 'Submit Penilaian & Hubungkan Ledger' : 'Confirm & Audit Ledger'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
