import React, { useState, useEffect } from 'react';
import { SupplierBid, SmartContract, User } from '../types';
import { TRANSLATIONS } from '../data';

interface DataCollectionScreenProps {
  lang: 'id' | 'en';
  initialStep?: 'bidding' | 'verification' | 'final-confirmation';
  navigationState?: any;
  onNavigateToTab: (tab: string, state?: any) => void;
  onAddContract: (contract: SmartContract, allocation?: Record<string, number>) => void;
  contracts: SmartContract[];
  user: User | null;
}

export default function DataCollectionScreen({ 
  lang, 
  initialStep, 
  navigationState, 
  onNavigateToTab, 
  onAddContract,
  contracts,
  user
}: DataCollectionScreenProps) {
  const [subTab, setSubTab] = useState<'bidding' | 'verification' | 'final-confirmation'>('verification');
  
  // Selection mode: 'mandiri' (single coop) or 'konsorsium' (group order)
  const [procurementMode, setProcurementMode] = useState<'mandiri' | 'konsorsium'>('konsorsium');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('Bina Flora Ltd');

  // Scan the contracts prop to find the highest contract number suffix and increment it
  const getNextContractIdString = () => {
    let maxNum = 3;
    if (contracts && contracts.length > 0) {
      contracts.forEach((c) => {
        // ID format: e.g. "PRC/VI/2026-JP-003"
        const parts = c.id.split('-');
        const lastPart = parts[parts.length - 1]; // e.g. "003"
        const num = parseInt(lastPart, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      });
    }
    return String(maxNum + 1).padStart(3, '0');
  };

  const idString = getNextContractIdString();

  const [bidsList, setBidsList] = useState<any[]>([
    {
      id: 'bid-1',
      name: 'PT. Agrotama',
      code: 'PA',
      bidStatus: 'SUDAH SUBMIT - TERKUNCI',
      isLocked: true,
      docVerified: true,
      quoteRange: 'Rp 9.800 / kg',
      deliveryTime: '7 Hari',
      minOrder: 150
    },
    {
      id: 'bid-2',
      name: 'Bina Flora Ltd',
      code: 'BF',
      bidStatus: 'SUDAH SUBMIT - TERKUNCI',
      isLocked: true,
      docVerified: true,
      quoteRange: 'Rp 10.500 / kg',
      deliveryTime: '3 Hari',
      minOrder: 100
    },
    {
      id: 'bid-3',
      name: 'CV. Subur Jaya',
      code: 'SJ',
      bidStatus: 'SUDAH SUBMIT - TERKUNCI',
      isLocked: true,
      docVerified: true,
      quoteRange: 'Rp 11.200 / kg',
      deliveryTime: '5 Hari',
      minOrder: 50
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signerName, setSignerName] = useState(user?.name || 'Budi Santoso');
  const [signerTitle, setSignerTitle] = useState(
    user?.role === 'super_admin' ? 'Super Admin' : (user?.cooperative ? `Ketua ${user.cooperative}` : 'Ketua Koperasi Sumber Makmur')
  );

  useEffect(() => {
    if (user) {
      setSignerName(user.name);
      setSignerTitle(user.role === 'super_admin' ? 'Super Admin' : (user.cooperative ? `Ketua ${user.cooperative}` : 'Ketua Koperasi Sumber Makmur'));
    }
  }, [user]);

  // Cooperatives volume demands and payment resolution states
  const [qtySumberMakmur, setQtySumberMakmur] = useState<number>(120);
  const [qtyPadiwangi, setQtyPadiwangi] = useState<number>(80);
  const [qtyMelatiJaya, setQtyMelatiJaya] = useState<number>(50);
  const [paymentResolution, setPaymentResolution] = useState<string>('none');
  
  // Track the last applied navigation state to prevent resetting user inputs on subsequent renders
  const [lastAppliedNav, setLastAppliedNav] = useState<any>(null);
  
  // Gemini evaluation state
  const [aiEvaluation, setAiEvaluation] = useState<any>(null);
  const [isLoadingAiEval, setIsLoadingAiEval] = useState<boolean>(false);
  const [weatherRecommendation, setWeatherRecommendation] = useState<any>(navigationState?.weatherRecommendation || null);

  // Signature Modal states
  const [isSigned, setIsSigned] = useState(false);
  const [generatedHash, setGeneratedHash] = useState('');

  // Handle incoming redirect state from Dashboard
  useEffect(() => {
    if (navigationState !== lastAppliedNav) {
      if (navigationState) {
        if (navigationState.mode) {
          setProcurementMode(navigationState.mode);
        }
        if (navigationState.recommendQty) {
          setQtySumberMakmur(navigationState.recommendQty);
        }
        if (navigationState.step) {
          setSubTab(navigationState.step);
        }
        if (navigationState.weatherRecommendation) {
          setWeatherRecommendation(navigationState.weatherRecommendation);
        }
      } else {
        // Set default initial step if not override
        setSubTab(initialStep || 'verification');
      }
      setLastAppliedNav(navigationState);
    }
  }, [navigationState, initialStep, lastAppliedNav]);

  // Fetch weather-based recommendation if not passed
  useEffect(() => {
    if (!weatherRecommendation) {
      fetch('/api/ai/forecast-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStock: 450,
          capacityMax: 2000,
          threshold: 1000,
          commodityName: 'Urea N46 (Premium)'
        })
      })
      .then(res => res.json())
      .then(data => {
        setWeatherRecommendation(data);
        if (data && data.recommendedVolume) {
          setQtySumberMakmur(data.recommendedVolume);
        }
      })
      .catch(err => console.error("Error loading weather forecast in DataCollection:", err));
    }
  }, [weatherRecommendation]);

  // Fetch Gemini AI evaluation when entering Step 2 Bidding
  useEffect(() => {
    if (subTab === 'bidding') {
      setIsLoadingAiEval(true);
      fetch('/api/ai/evaluate-suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume: totalVolume })
      })
        .then(res => res.json())
        .then(data => {
          setAiEvaluation(data);
          setIsLoadingAiEval(false);
          // Auto-select the Gemini recommended supplier
          if (data && data.recommendedSupplier) {
            setSelectedSupplier(data.recommendedSupplier);
          }
        })
        .catch(err => {
          console.error("Error fetching AI supplier comparison:", err);
          setIsLoadingAiEval(false);
        });
    }
  }, [subTab, qtySumberMakmur, qtyPadiwangi, qtyMelatiJaya, procurementMode]);

  const totalVolume = qtySumberMakmur + (procurementMode === 'konsorsium' ? (qtyPadiwangi + qtyMelatiJaya) : 0);
  
  // Dynamic supplier price mapping
  const getSupplierPrice = (supplier: string) => {
    if (supplier === 'PT. Agrotama') return 9800;
    if (supplier === 'CV. Subur Jaya') return 11200;
    return 10500; // Bina Flora Ltd default
  };

  const unitPrice = getSupplierPrice(selectedSupplier);
  const totalValueNum = totalVolume * unitPrice * 1000;
  const formattedTotalValue = 'Rp ' + totalValueNum.toLocaleString('id-ID');

  // Dynamic Warehouse Capacities
  const sumberMakmurTotalStock = 450 + qtySumberMakmur;
  const sumberMakmurPercentage = parseFloat(((sumberMakmurTotalStock / 2000) * 100).toFixed(1));

  const padiwangiTotalStock = 80 + (procurementMode === 'konsorsium' ? qtyPadiwangi : 0);
  const padiwangiPercentage = parseFloat(((padiwangiTotalStock / 1500) * 100).toFixed(1));

  const melatiJayaTotalStock = 920 + (procurementMode === 'konsorsium' ? qtyMelatiJaya : 0);
  const melatiJayaPercentage = parseFloat(((melatiJayaTotalStock / 1000) * 100).toFixed(1));

  const isSumberMakmurOverloaded = sumberMakmurTotalStock > 2000;
  const isPadiwangiOverloaded = padiwangiTotalStock > 1500;
  const isMelatiJayaOverloaded = melatiJayaTotalStock > 1000;

  const isAnyWarehouseOverloaded = isSumberMakmurOverloaded || (procurementMode === 'konsorsium' && (isPadiwangiOverloaded || isMelatiJayaOverloaded));

  const t = TRANSLATIONS[lang];

  // Handle Search on suppliers
  const filteredBids = bidsList.filter(bid =>
    bid.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bid.bidStatus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Executing contract simulation
  const handleExecuteContract = () => {
    if (!isConsentChecked) {
      alert(lang === 'id' ? 'Silakan centang persetujuan terlebih dahulu.' : 'Please agree to the consent requirements first.');
      return;
    }
    setIsSigned(false);
    setIsSignatureModalOpen(true);
  };

  const handleConfirmSignature = () => {
    const hash = '0x8f2d658ec53cc320ab9f' + Math.random().toString(16).substr(2, 20);
    setGeneratedHash(hash);
    setIsSigned(true);
  };

  const handleCloseAfterSignature = () => {
    const newContract: SmartContract = {
      id: `PRC/VI/2026-JP-${idString}`,
      title: lang === 'id' 
        ? `Surat Persetujuan Pengadaan Bersama - Urea #JP-2026-${idString} (${selectedSupplier})` 
        : `Urea Collective Procurement Joint Agreement #JP-2026-${idString} (${selectedSupplier})`,
      commodity: 'Urea N46 (Premium)',
      quantity: `${totalVolume} Ton`,
      price: `Rp ${unitPrice.toLocaleString('id-ID')} / kg`,
      totalValue: formattedTotalValue,
      firstParty: 'H. Ahmad Subarjo',
      firstPartyTitle: 'Ketua Koperasi Sumber Makmur',
      secondParty: selectedSupplier,
      secondPartyTitle: `Direktur Operasional ${selectedSupplier}`,
      hash: generatedHash,
      signedAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      deliveryMethod: lang === 'id' ? 'Pelabuhan Tanjung Emas, Semarang (FOB)' : 'Port of Tanjung Emas, Semarang (FOB)',
      documentText: lang === 'id'
        ? (procurementMode === 'mandiri' 
            ? `Menyepakati pengadaan komoditas Urea N46 sebanyak ${totalVolume} Ton dengan total harga ${formattedTotalValue} untuk kebutuhan mandiri Koperasi Sumber Makmur.`
            : `Menyepakati pengadaan komoditas Urea N46 sebanyak ${totalVolume} Ton dengan total harga ${formattedTotalValue} berskala nasional melalui konsorsium perwakilan koperasi tani. Rincian kebutuhan masing-masing koperasi: Koperasi Sumber Makmur (${qtySumberMakmur} Ton), Koperasi Padiwangi (${qtyPadiwangi} Ton), dan Koperasi Melati Jaya (${qtyMelatiJaya} Ton).`)
        : (procurementMode === 'mandiri'
            ? `Agreeing to the procurement of ${totalVolume} Tons of Urea N46 commodity with a total value of ${formattedTotalValue} for the independent needs of Sumber Makmur Cooperative.`
            : `Agreeing to the procurement of ${totalVolume} Tons of Urea N46 commodity with a total value of ${formattedTotalValue} on a national scale through the agricultural cooperatives consortium representation. Allocation details: Sumber Makmur (${qtySumberMakmur} Tons), Padiwangi (${qtyPadiwangi} Tons), and Melati Jaya (${qtyMelatiJaya} Tons).`)
    };

    const allocation = procurementMode === 'mandiri'
      ? { "Sumber Makmur": qtySumberMakmur }
      : {
          "Sumber Makmur": qtySumberMakmur,
          "Padiwangi": qtyPadiwangi,
          "Melati Jaya": qtyMelatiJaya
        };

    onAddContract(newContract, allocation);
    setIsSignatureModalOpen(false);
    setIsSigned(false);

    alert(lang === 'id' 
      ? 'Berhasil menandatangani dokumen persetujuan secara digital!' 
      : 'Successfully digitally signed the agreement document!');
    
    onNavigateToTab('contracts');
  };

  return (
    <div className="w-full" id="data-collection-workspace">
      {/* ----------------- SUB-TAB: BIDDING STATUS ----------------- */}
      {subTab === 'bidding' && (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in" id="bidding-view">
          <div>
            <h2 className="text-2xl font-bold text-[#0b1c30] tracking-tight leading-tight">
              {lang === 'id' ? `Sesi Pengadaan Bersama #JP-2026-${idString} (Pupuk Urea - ${totalVolume} Ton)` : `Collective Procurement Session #JP-2026-${idString} (Urea Fertilizer - ${totalVolume} Tons)`}
            </h2>
            <p className="text-[#64748b] text-sm mt-1">{t.coopListDesc}</p>
          </div>

          {/* Sisa waktu countdown banner */}
          <div className="flex items-center gap-3 bg-red-50 border border-red-200/50 p-4 rounded-xl w-fit">
            <span className="material-symbols-outlined text-rose-600">timer</span>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-rose-600 font-bold uppercase tracking-wider">{t.biddingDeadline}</span>
              <span className="font-bold text-sm text-[#0b1c30]">
                {lang === 'id' ? 'Sisa Waktu Bidding: 02 Hari : 14 Jam : 30 Menit' : 'Bidding Time Remaining: 02 Days : 14 Hours : 30 Minutes'}
              </span>
            </div>
          </div>

          {/* Stepper bar */}
          <div className="flex items-center justify-between w-full relative mb-4">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 z-0"></div>
            <div className="flex flex-col items-center gap-1 z-10 bg-[#f8f9ff] px-2 text-slate-400">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#3B82F6] flex items-center justify-center font-bold text-xs">
                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
              </div>
              <span className="text-[10px] font-medium font-mono uppercase tracking-wider">{lang === 'id' ? 'Koleksi Volume' : 'Volume Collection'}</span>
            </div>
            <div className="flex flex-col items-center gap-1 z-10 bg-[#f8f9ff] px-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#3B82F6] bg-blue-50 text-[#3B82F6] flex items-center justify-center font-bold text-xs">2</div>
              <span className="text-[10px] font-bold font-mono uppercase text-[#3B82F6] tracking-wider">{lang === 'id' ? 'Penawaran Harga' : 'Price Bidding'}</span>
            </div>
            <div className="flex flex-col items-center gap-1 z-10 bg-[#f8f9ff] px-2 text-slate-400 opacity-60">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-slate-500 border border-gray-300 flex items-center justify-center font-bold text-xs">3</div>
              <span className="text-[10px] font-medium font-mono uppercase tracking-wider">{lang === 'id' ? 'Analisis AI' : 'AI Analysis'}</span>
            </div>
            <div className="flex flex-col items-center gap-1 z-10 bg-[#f8f9ff] px-2 text-slate-400 opacity-60">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-slate-500 border border-gray-300 flex items-center justify-center font-bold text-xs">4</div>
              <span className="text-[10px] font-medium font-mono uppercase tracking-wider">{lang === 'id' ? 'Konfirmasi Akhir' : 'Final Confirmation'}</span>
            </div>
          </div>

          {/* High-density grid suppliers table card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header controls inside table */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                <input
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all outline-none"
                  placeholder={lang === 'id' ? 'Cari pemasok...' : 'Search suppliers...'}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button className="h-10 px-4 rounded-lg border border-gray-200 bg-white flex items-center gap-2 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-600 focus:outline-none">
                  <span className="material-symbols-outlined text-[16px]">filter_list</span>
                  Filter
                </button>
                <button
                  onClick={() => alert('Exporting suppliers data...')}
                  className="h-10 px-4 rounded-lg bg-blue-50 text-[#3B82F6] flex items-center gap-2 hover:bg-blue-100 transition-colors text-xs font-bold border border-transparent focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Export
                </button>
              </div>
            </div>

            {/* Structured Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px] text-xs">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-gray-100 text-[#3d4a42] font-mono font-bold tracking-wider">
                    <th className="p-4">{t.supplierName}</th>
                    <th className="p-4 text-center">{lang === 'id' ? 'Batas Minimum' : 'Minimum Volume'}</th>
                    <th className="p-4 text-center">{lang === 'id' ? 'Kecepatan Logistik' : 'Delivery Speed'}</th>
                    <th className="p-4 text-right">{t.quoteRangeLabel}</th>
                    <th className="p-4 text-center">{lang === 'id' ? 'Pilih Pemasok' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-slate-800">
                  {filteredBids.map((bid) => (
                    <tr className={`hover:bg-slate-50/50 transition-colors ${selectedSupplier === bid.name ? 'bg-blue-50/20' : ''}`} key={bid.id}>
                      <td className="p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded flex items-center justify-center ${selectedSupplier === bid.name ? 'bg-blue-600 text-white' : 'bg-[#eff4ff] text-[#3B82F6]'}`}>
                          <span className="material-symbols-outlined text-[20px]">factory</span>
                        </div>
                        <div>
                          <div className="font-bold text-[#0b1c30]">{bid.name}</div>
                          <span className="text-[10px] text-[#6b7280] font-mono">CODE: {bid.code}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-semibold font-mono text-[#0b1c30]">{bid.minOrder} Ton</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          <span className="material-symbols-outlined text-xs">local_shipping</span>
                          {bid.deliveryTime}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-blue-600">{bid.quoteRange}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedSupplier(bid.name)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border outline-none cursor-pointer focus:outline-none ${
                            selectedSupplier === bid.name
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-slate-600 hover:bg-slate-50 border-gray-200'
                          }`}
                        >
                          {selectedSupplier === bid.name ? (lang === 'id' ? '✓ Terpilih' : '✓ Selected') : (lang === 'id' ? 'Pilih' : 'Select')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-gray-100 bg-[#f8f9ff]/40 flex justify-between items-center text-[11px] text-[#6b7280]">
              <span className="pl-2">{lang === 'id' ? `Menampilkan 1-3 dari ${filteredBids.length} penawaran` : `Showing 1-3 of ${filteredBids.length} suppliers`}</span>
              <div className="flex gap-1 font-bold">
                <button disabled className="p-1 rounded opacity-50 hover:bg-gray-100">Prev</button>
                <button disabled className="p-1 rounded opacity-50 hover:bg-gray-100">Next</button>
              </div>
            </div>
          </div>

          {/* Gemini AI Supplier Recommendation Result Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden shadow-md text-white">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <span className="material-symbols-outlined text-[150px] select-none">auto_awesome</span>
            </div>
            
            <div className="flex gap-4 items-start relative z-10">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <span className="material-symbols-outlined text-yellow-300 text-[26px] fill-current animate-pulse">auto_awesome</span>
              </div>
              <div className="space-y-2 flex-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded text-sky-200">
                  {lang === 'id' ? 'Rekomendasi Pemilihan Supplier Gemini AI' : 'Gemini AI Supplier Evaluation'}
                </span>
                
                {isLoadingAiEval ? (
                  <div className="space-y-2 pt-2">
                    <p className="text-sm font-semibold animate-pulse">{lang === 'id' ? 'Menganalisis matriks harga, rating, dan volume logistik...' : 'Evaluating price logs, rating percentages, and volume constraints...'}</p>
                    <div className="w-40 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                ) : aiEvaluation ? (
                  <div className="space-y-4 pt-1">
                    <div>
                      <h4 className="text-lg font-black text-white flex items-center gap-1.5">
                        {lang === 'id' ? 'Rekomendasi Terbaik: ' : 'Best Match: '}
                        <span className="text-yellow-300 font-extrabold underline decoration-2">{aiEvaluation.recommendedSupplier}</span>
                      </h4>
                      <p className="text-xs text-slate-100 leading-relaxed mt-1.5 font-medium max-w-2xl">
                        {lang === 'id' ? aiEvaluation.reasoningId : aiEvaluation.reasoningEn}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 pt-3 text-xs">
                      {aiEvaluation.comparison?.map((comp: any, idx: number) => (
                        <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-2 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center font-bold">
                              <span>{comp.supplierName}</span>
                              <span className="text-yellow-300 font-mono">{comp.score}%</span>
                            </div>
                            
                            <ul className="list-disc pl-3 text-[10px] text-slate-200 space-y-0.5 mt-2">
                              {lang === 'id' 
                                ? comp.prosId?.slice(0, 2).map((p: string, i: number) => <li key={i}>{p}</li>)
                                : comp.prosEn?.slice(0, 2).map((p: string, i: number) => <li key={i}>{p}</li>)
                              }
                            </ul>
                            
                            {comp.consId && comp.consId.length > 0 && (
                              <ul className="list-disc pl-3 text-[10px] text-red-200/80 space-y-0.5 mt-1 border-t border-white/5 pt-1">
                                {lang === 'id'
                                  ? comp.consId?.slice(0, 2).map((p: string, i: number) => <li key={i}>{p}</li>)
                                  : comp.consEn?.slice(0, 2).map((p: string, i: number) => <li key={i}>{p}</li>)
                                }
                              </ul>
                            )}
                          </div>
                          <button
                            onClick={() => setSelectedSupplier(comp.supplierName)}
                            className={`w-full mt-3 py-1 text-[10px] font-bold rounded-lg border outline-none cursor-pointer focus:outline-none transition-all ${
                              selectedSupplier === comp.supplierName
                                ? 'bg-yellow-400 text-slate-900 border-yellow-400'
                                : 'bg-transparent text-white border-white/30 hover:bg-white/10'
                            }`}
                          >
                            {selectedSupplier === comp.supplierName ? (lang === 'id' ? 'Terpilih' : 'Selected') : (lang === 'id' ? 'Pilih Supplier' : 'Select')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-200">{lang === 'id' ? 'Gagal memuat rekomendasi AI.' : 'Failed to retrieve AI recommendations.'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Action */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              onClick={() => setSubTab('verification')}
              className="px-6 py-3 rounded-xl border border-gray-300 text-[#0b1c30] font-bold text-xs flex-1 hover:bg-slate-50 transition-colors focus:outline-none"
            >
              {lang === 'id' ? 'Kembali ke Koleksi' : 'Back to Collection'}
            </button>
            <button
              onClick={() => setSubTab('final-confirmation')}
              className="bg-[#3B82F6] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 group focus:outline-none flex-1"
            >
              {t.confirmNext}
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: CAPACITIES VERIFICATION ----------------- */}
      {subTab === 'verification' && (
        <div className="flex flex-col lg:flex-row relative min-h-[calc(100vh-120px)] animate-fade-in" id="verification-panel">
          {/* Left panel graphic placeholder */}
          <div className="hidden lg:block lg:w-5/12 h-auto relative overflow-hidden bg-slate-900 rounded-2xl border border-gray-200">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-blue-500/25 mix-blend-multiply z-10"></div>
            <img
              alt="Agricultural fields viewed from above drone"
              className="w-full h-full object-cover object-center absolute inset-0 select-none"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5Z3T-vZhcp0iwsP_g15H8CO5FVoXy6UiGtS6omsXQZhg2h5WAlLoYjswtcC9IWMbsIdC_SgODQ1ibce1rw7kaHqFGLijO8Es9gcJbcFPCc1bK37jW5yRlGQ04iX02g3-6ASWBJz2nXL8e3CfyGqGiaJVnzkGik-TDOLMwJ8DsSPtPpqIXH0vLPZAEMvs9atf5_v9uVMYhYMTiCYQTZrsa-Nj5QFhjc0WQ1nNgiUpskI2ZK0rHlma3NIfbX9x_KOYlzopI_t_KRZgO"
              referrerPolicy="no-referrer"
            />
            {/* AI Warning floating box */}
            <div className="absolute bottom-8 left-8 right-8 z-20 bg-white/95 backdrop-blur-md p-5 rounded-xl border border-white/20 shadow-lg">
              <div className="flex items-center gap-2.5 mb-2 text-[#3B82F6]">
                <span className="material-symbols-outlined font-bold select-none text-[20px] fill-current">auto_awesome</span>
                <h3 className="font-bold text-sm text-[#0f172a]">{lang === 'id' ? 'Verifikasi AI Aktif' : 'AI Verification Active'}</h3>
              </div>
              <p className="text-xs text-[#3d4a42] leading-relaxed">
                {lang === 'id' ? 'Sistem secara otomatis mencocokkan data koleksi dengan catatan koperasi historis untuk memastikan integritas data sebelum persetujuan kontrak.' : 'System automatically cross-references collection inputs with historical logs to ensure contract integrity before approval.'}
              </p>
            </div>
          </div>

          {/* Right panel detailed content */}
          <div className="flex-1 w-full lg:pl-10 lg:pr-2 px-1 py-4">
            <div className="w-full flex flex-col gap-6">
              {/* Stepper bar */}
              <div className="flex items-center justify-between w-full relative mb-4">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 z-0"></div>
                <div className="flex flex-col items-center gap-1 z-10 bg-[#f8f9ff] px-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#3B82F6] bg-blue-50 text-[#3B82F6] flex items-center justify-center font-bold text-xs">1</div>
                  <span className="text-[10px] font-bold font-mono uppercase text-[#3B82F6] tracking-wider">{lang === 'id' ? 'Koleksi Volume' : 'Volume Collection'}</span>
                </div>
                <div className="flex flex-col items-center gap-1 z-10 bg-[#f8f9ff] px-2 text-slate-400 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-slate-500 border border-gray-300 flex items-center justify-center font-bold text-xs">2</div>
                  <span className="text-[10px] font-medium font-mono uppercase tracking-wider">{lang === 'id' ? 'Penawaran Harga' : 'Price Bidding'}</span>
                </div>
                <div className="flex flex-col items-center gap-1 z-10 bg-[#f8f9ff] px-2 text-slate-400 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-slate-500 border border-gray-300 flex items-center justify-center font-bold text-xs">3</div>
                  <span className="text-[10px] font-medium font-mono uppercase tracking-wider">{lang === 'id' ? 'Analisis AI' : 'AI Analysis'}</span>
                </div>
                <div className="flex flex-col items-center gap-1 z-10 bg-[#f8f9ff] px-2 text-slate-400 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-slate-500 border border-gray-300 flex items-center justify-center font-bold text-xs">4</div>
                  <span className="text-[10px] font-medium font-mono uppercase tracking-wider">{lang === 'id' ? 'Konfirmasi Akhir' : 'Final Confirmation'}</span>
                </div>
              </div>

              {/* Main title */}
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">PROCUREMENT #PRC-2023-884</span>
                <h2 className="text-3xl font-extrabold text-[#0b1c30] tracking-tight">{lang === 'id' ? 'Koleksi Volume Kebutuhan' : 'Volume Collection Demand'}</h2>
                <p className="text-[#3d4a42] text-sm mt-1 leading-relaxed">
                  {lang === 'id' ? 'Tentukan alokasi kebutuhan pupuk bersama untuk masing-masing koperasi konsorsium.' : 'Determine joint fertilizer volume allocations for each cooperative in the consortium.'}
                </p>
              </div>

              {/* Selector Mode Pengadaan */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-[#0b1c30] text-sm flex items-center gap-2 uppercase tracking-wider font-mono">
                  <span className="material-symbols-outlined text-blue-600">settings_suggest</span>
                  {lang === 'id' ? 'Pilih Opsi Pengadaan Sesi Bidding' : 'Procurement Mode Selection'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProcurementMode('mandiri')}
                    className={`p-4 rounded-xl border-2 text-left transition-all outline-none focus:outline-none cursor-pointer flex gap-3 ${
                      procurementMode === 'mandiri'
                        ? 'border-blue-600 bg-blue-50/30 text-blue-900 ring-2 ring-blue-500/10'
                        : 'border-gray-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-blue-600 text-3xl font-bold shrink-0">person</span>
                    <div>
                      <h4 className="font-extrabold text-xs">{lang === 'id' ? 'Mandiri (AI Recommended)' : 'Independent Bidding (AI Recommended)'}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1 font-medium">
                        {lang === 'id' 
                          ? 'Pengadaan khusus untuk koperasi kita sendiri. Semua otomatis dihitung oleh AI berdasarkan sisa kapasitas.' 
                          : 'Procurement for our cooperative only. Automatically calculated by AI based on remaining capacity.'}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProcurementMode('konsorsium')}
                    className={`p-4 rounded-xl border-2 text-left transition-all outline-none focus:outline-none cursor-pointer flex gap-3 ${
                      procurementMode === 'konsorsium'
                        ? 'border-blue-600 bg-blue-50/30 text-blue-900 ring-2 ring-blue-500/10'
                        : 'border-gray-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-blue-600 text-3xl font-bold shrink-0">groups</span>
                    <div>
                      <h4 className="font-extrabold text-xs">{lang === 'id' ? 'Group Order (Konsorsium)' : 'Group Order (Consortium)'}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1 font-medium">
                        {lang === 'id'
                          ? 'Membeli bersama koperasi-koperasi lainnya (Sumber Makmur, Padiwangi, Melati Jaya) untuk harga murah.'
                          : 'Joint purchase with other cooperatives (Sumber Makmur, Padiwangi, Melati Jaya) to lock wholesale discounts.'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* BMKG Climate Forecasting Widget */}
              {weatherRecommendation && (
                <div className="bg-blue-50/40 border border-blue-150 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <span className="material-symbols-outlined text-[20px] font-bold select-none">cloud</span>
                    <h3 className="font-bold text-xs text-[#0b1c30] uppercase tracking-wider font-mono">
                      {lang === 'id' ? 'Integrasi BMKG Weather & Keputusan Gemini AI' : 'BMKG Weather & Gemini AI Recommendation'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#0b1c30]">
                    <div className="bg-white p-3 rounded-lg border border-blue-100 flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Prakiraan BMKG</span>
                      <p className="font-bold text-[#0f172a] mt-1">Jawa Tengah (Demak)</p>
                      <p className="text-[#64748b] text-[10px] mt-0.5 leading-snug">{weatherRecommendation.weatherSummary}</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-blue-100 flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Rekomendasi Volume</span>
                      <p className="text-lg font-black text-blue-600 mt-1">{weatherRecommendation.recommendedVolume} Ton</p>
                      <span className="text-slate-400 text-[9px] block mt-0.5">*Bukan sekadar penuhin stok</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-blue-100 flex flex-col justify-between md:col-span-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Keputusan Cerdas AI</span>
                      <p className="text-slate-600 text-[10px] mt-1 leading-relaxed font-medium">
                        {lang === 'id' ? weatherRecommendation.reasoningId : weatherRecommendation.reasoningEn}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cooperatives Manual Input & Warehouse Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-[#0b1c30] text-sm flex items-center gap-2 uppercase tracking-wider font-mono">
                  <span className="material-symbols-outlined text-blue-600">group</span>
                  {procurementMode === 'mandiri' 
                    ? (lang === 'id' ? 'Kebutuhan Volume Koperasi (Otorisasi Mandiri)' : 'Cooperative Volume Demand (Single)') 
                    : (lang === 'id' ? 'Kebutuhan Volume 3 Koperasi (Input Konsorsium)' : '3 Cooperatives Volume Demands (Group Order)')}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Coop 1: Sumber Makmur (Kita/Anda) */}
                  <div className="space-y-1 text-xs">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="qty-sumber-makmur-kita">Koperasi Sumber Makmur (Anda)</label>
                    <div className="relative flex items-center">
                      <input
                        id="qty-sumber-makmur-kita"
                        type="number"
                        min="0"
                        className="w-full border border-gray-200 rounded-lg p-2.5 font-bold focus:border-[#3B82F6] outline-none"
                        value={qtySumberMakmur}
                        onChange={(e) => setQtySumberMakmur(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                      <span className="absolute right-3 font-bold text-gray-400">Ton</span>
                    </div>
                    {procurementMode === 'mandiri' && (
                      <p className="text-[9px] text-blue-600 font-bold mt-1 leading-snug">
                        {lang === 'id' 
                          ? `✓ Volume disesuaikan prakiraan cuaca BMKG: ${qtySumberMakmur} Ton` 
                          : `✓ Volume optimized by BMKG weather forecast: ${qtySumberMakmur} Tons`}
                      </p>
                    )}
                  </div>

                  {/* Coop 2: Padiwangi (Consortium Only) */}
                  {procurementMode === 'konsorsium' && (
                    <div className="space-y-1 text-xs">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="qty-padiwangi">Koperasi Padiwangi</label>
                      <div className="relative flex items-center">
                        <input
                          id="qty-padiwangi"
                          type="number"
                          min="0"
                          className="w-full border border-gray-200 rounded-lg p-2.5 font-bold focus:border-[#3B82F6] outline-none"
                          value={qtyPadiwangi}
                          onChange={(e) => setQtyPadiwangi(Math.max(0, parseInt(e.target.value) || 0))}
                        />
                        <span className="absolute right-3 font-bold text-gray-400">Ton</span>
                      </div>
                    </div>
                  )}

                  {/* Coop 3: Melati Jaya (Consortium Only) */}
                  {procurementMode === 'konsorsium' && (
                    <div className="space-y-1 text-xs">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="qty-melati-jaya">Koperasi Melati Jaya</label>
                      <div className="relative flex items-center">
                        <input
                          id="qty-melati-jaya"
                          type="number"
                          min="0"
                          className="w-full border border-gray-200 rounded-lg p-2.5 font-bold focus:border-[#3B82F6] outline-none"
                          value={qtyMelatiJaya}
                          onChange={(e) => setQtyMelatiJaya(Math.max(0, parseInt(e.target.value) || 0))}
                        />
                        <span className="absolute right-3 font-bold text-gray-400">Ton</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Volume & Value Dynamic Overview Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total volume */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-blue-600"></div>
                  <div className="flex items-center gap-2 text-[#3d4a42] mb-3">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">scale</span>
                    <span className="text-[11px] font-bold font-mono uppercase tracking-wider">{lang === 'id' ? 'TOTAL VOLUME PENGADAAN' : 'TOTAL PROCURED VOLUME'}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl font-extrabold text-blue-600">{totalVolume}</span>
                    <span className="text-[#3d4a42] font-semibold text-sm">Ton</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium leading-none">
                    {procurementMode === 'mandiri' 
                      ? (lang === 'id' ? '*Harga Grosir Khusus Mandiri' : '*Single Order Pricing Scale')
                      : (lang === 'id' ? '*Harga Grosir Massal Terkunci (Konsorsium)' : '*Bulk Discount Pricing Locked (Consortium)')}
                  </p>
                </div>

                {/* Total Value */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-rose-500"></div>
                  <div className="flex items-center gap-2 text-[#3d4a42] mb-3">
                    <span className="material-symbols-outlined text-rose-500 text-[20px]">payments</span>
                    <span className="text-[11px] font-bold font-mono uppercase tracking-wider">{lang === 'id' ? 'ESTIMASI NILAI KONTRAK' : 'ESTIMATED CONTRACT VALUE'}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-rose-600">{formattedTotalValue}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium leading-none">
                    {lang === 'id' 
                      ? `Acuan Pemasok: Rp ${unitPrice.toLocaleString('id-ID')} / kg (Urea Premium)` 
                      : `Benchmark rate: Rp ${unitPrice.toLocaleString('id-ID')} / kg (Urea Premium)`}
                  </p>
                </div>
              </div>

              {/* Status Gudang Terpisah & Verifikasi Rekening Bank */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Warehouses Status (Gudang Terpisah) */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#3d4a42] border-b border-gray-150 pb-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">warehouse</span>
                    <span className="text-[11px] font-bold font-mono uppercase tracking-wider">{lang === 'id' ? 'STATUS GUDANG TERPISAH' : 'SEPARATE WAREHOUSE STATUS'}</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    {/* Warehouse A: Sumber Makmur */}
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>Gudang Sumber Makmur</span>
                        <span className={`font-bold ${isSumberMakmurOverloaded ? 'text-rose-600 font-extrabold' : sumberMakmurPercentage >= 90 ? 'text-amber-600' : ''}`}>
                          {sumberMakmurTotalStock.toLocaleString('id-ID')} / 2.000 Ton ({sumberMakmurPercentage}%){sumberMakmurPercentage >= 90 ? ' ⚠️' : ''}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                        <div className={`h-full ${isSumberMakmurOverloaded ? 'bg-rose-600' : sumberMakmurPercentage >= 90 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, sumberMakmurPercentage)}%` }}></div>
                      </div>
                    </div>

                    {/* Warehouse B: Padiwangi (Consortium Only) */}
                    {procurementMode === 'konsorsium' && (
                      <div>
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>Gudang Padiwangi</span>
                          <span className={`font-bold ${isPadiwangiOverloaded ? 'text-rose-600 font-extrabold' : padiwangiPercentage >= 90 ? 'text-amber-600' : ''}`}>
                            {padiwangiTotalStock.toLocaleString('id-ID')} / 1.500 Ton ({padiwangiPercentage}%){padiwangiPercentage >= 90 ? ' ⚠️' : ''}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                          <div className={`h-full ${isPadiwangiOverloaded ? 'bg-rose-600' : padiwangiPercentage >= 90 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, padiwangiPercentage)}%` }}></div>
                        </div>
                      </div>
                    )}

                    {/* Warehouse C: Melati Jaya (Consortium Only) */}
                    {procurementMode === 'konsorsium' && (
                      <div>
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>Gudang Melati Jaya</span>
                          <span className={`font-bold ${isMelatiJayaOverloaded ? 'text-rose-600 font-extrabold animate-pulse' : melatiJayaPercentage >= 90 ? 'text-rose-600 font-extrabold' : ''}`}>
                            {melatiJayaTotalStock.toLocaleString('id-ID')} / 1.000 Ton ({melatiJayaPercentage}%){melatiJayaPercentage >= 90 ? ' ⚠️' : ''}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                          <div className={`h-full ${isMelatiJayaOverloaded ? 'bg-rose-600 animate-pulse' : melatiJayaPercentage >= 90 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, melatiJayaPercentage)}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {isAnyWarehouseOverloaded && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-bold text-[11px] leading-relaxed flex items-start gap-1.5 animate-pulse mt-2">
                      <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                      <div>
                        {lang === 'id' 
                          ? 'Kapasitas gudang terlampaui! Mohon kurangi alokasi kebutuhan volume pupuk.' 
                          : 'Warehouse storage limit exceeded! Please reduce the allocated volume.'}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Bank Account Connection Verification (Consortium Only) */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#3d4a42] border-b border-gray-150 pb-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">account_balance_wallet</span>
                    <span className="text-[11px] font-bold font-mono uppercase tracking-wider">{lang === 'id' ? 'VERIFIKASI REKENING BANK KUSTODIAN' : 'CUSTODIAN BANK VERIFICATION'}</span>
                  </div>
                  
                  <div className="space-y-2.5 text-xs text-slate-800">
                    <div className="flex justify-between font-semibold">
                      <span>Koperasi Sumber Makmur:</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs">check_circle</span> Terhubung
                      </span>
                    </div>

                    {procurementMode === 'konsorsium' ? (
                      <>
                        <div className="flex justify-between font-semibold">
                          <span>Koperasi Padiwangi:</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">check_circle</span> Terhubung
                          </span>
                        </div>

                        <div className="flex justify-between font-semibold flex-col gap-1">
                          <div className="flex justify-between">
                            <span>Koperasi Melati Jaya:</span>
                            {paymentResolution !== 'none' ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-xs">verified</span> 
                                {paymentResolution === 'talangan' && (lang === 'id' ? 'Talangan Ketua' : 'Coop Guarantee')}
                                {paymentResolution === 'escrow' && (lang === 'id' ? 'Eskrow Manual' : 'Manual Escrow')}
                              </span>
                            ) : (
                              <span className="text-rose-600 font-bold flex items-center gap-0.5 animate-pulse">
                                <span className="material-symbols-outlined text-xs">warning</span> Belum Terhubung
                              </span>
                            )}
                          </div>

                          {/* Payment Resolution Panel */}
                          {paymentResolution === 'none' && (
                            <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200/50 rounded-lg space-y-2">
                              <p className="text-[10px] text-rose-700 leading-normal font-semibold">
                                {lang === 'id' 
                                  ? 'Koperasi Melati Jaya tidak memiliki rekening terintegrasi. Pilih metode penyelesaian talangan/jaminan di bawah:' 
                                  : 'Koperasi Melati Jaya does not have a connected bank account. Select a payment guarantee method below:'}
                              </p>
                              <div className="flex gap-1.5 flex-wrap">
                                <button
                                  onClick={() => setPaymentResolution('talangan')}
                                  className="px-2 py-1 bg-white border border-rose-200 hover:border-[#3B82F6] hover:text-[#3B82F6] text-[#0b1c30] rounded text-[9px] font-bold transition-all focus:outline-none cursor-pointer"
                                >
                                  {lang === 'id' ? 'Talangan Sumber Makmur' : 'Sumber Makmur Guarantee'}
                                </button>
                                <button
                                  onClick={() => setPaymentResolution('escrow')}
                                  className="px-2 py-1 bg-white border border-rose-200 hover:border-[#3B82F6] hover:text-[#3B82F6] text-[#0b1c30] rounded text-[9px] font-bold transition-all focus:outline-none cursor-pointer"
                                >
                                  {lang === 'id' ? 'Setoran Eskrow Manual' : 'Escrow Deposit'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-lg font-medium leading-relaxed text-[11px] mt-2">
                        {lang === 'id'
                          ? '✓ Pengadaan mandiri hanya menggunakan rekening Koperasi Sumber Makmur yang terverifikasi aman.'
                          : '✓ Independent procurement uses exclusively secure, connected Sumber Makmur accounts.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Temuan audit block (Consortium Capacity Warning) */}
              {procurementMode === 'konsorsium' && (
                <div className="bg-gradient-to-r from-blue-500/5 to-transparent border border-[#3B82F6]/20 rounded-xl p-5 relative overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-amber-700 select-none text-[20px]">auto_awesome</span>
                    <h3 className="font-bold text-amber-700 text-sm">{t.auditFinding}</h3>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3 items-start shadow-sm mt-2">
                    <div className="w-9 h-9 rounded-full bg-red-50 text-rose-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">warning</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0b1c30] mb-0.5">{t.warningCapacityTitle}</h4>
                      <p className="text-xs text-[#3d4a42] leading-relaxed mb-3">
                        {t.warningCapacityDesc}
                      </p>
                      <button
                        onClick={() => alert(lang === 'id' ? 'Menampilkan detail logistik & penempatan kontainer...' : 'Displaying logistics warehouse layout details...')}
                        className="text-[#3B82F6] font-mono text-[10px] font-bold hover:underline flex items-center gap-1 focus:outline-none"
                      >
                        {t.reviewLogistics}
                        <span className="material-symbols-outlined text-[12px] font-bold">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Actions footer */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 justify-end">
                <button
                  onClick={() => {
                    if (isAnyWarehouseOverloaded) {
                      alert(lang === 'id' ? 'Kapasitas gudang terlampaui! Kurangi alokasi sebelum melanjutkan.' : 'Warehouse capacity exceeded! Reduce allocation before proceeding.');
                      return;
                    }
                    if (procurementMode === 'konsorsium' && paymentResolution === 'none') {
                      alert(lang === 'id' ? 'Silakan pilih metode penyelesaian rekening bank Melati Jaya.' : 'Please resolve Melati Jaya custodian banking account connection.');
                      return;
                    }
                    setSubTab('bidding');
                  }}
                  disabled={isAnyWarehouseOverloaded}
                  className={`px-6 py-3 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-2 group focus:outline-none transition-all w-full ${
                    isAnyWarehouseOverloaded 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#3B82F6] text-white hover:bg-blue-700 active:scale-95'
                  }`}
                >
                  {t.confirmNext}
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: FINAL REVIEW DETAILS ----------------- */}
      {subTab === 'final-confirmation' && (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-120px)] animate-fade-in" id="final-review-panel">
          {/* Left panel cinematic backdrop */}
          <div className="hidden md:flex md:w-5/12 relative bg-slate-900 items-end p-8 overflow-hidden rounded-2xl border border-gray-200">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105" style={{
              backgroundImage: `url("https://lh3.googleusercontent.com/aida/AP1WRLucjyUGMgY5Hzu7Ku-QSPl0xLmyETpLC-ZOt5C_k5at1ZJOF7wf2SL8HsaMrPctstDk_cFhkIiH1FWB0r9tGzduk2uGht5frkiwP_00L2VpaByBYtSihTLQJIVBAlvMtaCesPD0Lo5m-Wcl7jT7DZ71e8VnPjc3qBGv_ezea9zRSmNGNOBrcNGST_cfdHRqlB9d3Ycnvb-zITcFHSJugG1UnSkuI51SuqZOo5kzgf3388TtJ8kAuVLoworj")`
            }}>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
            </div>
            <div className="relative z-10 text-white select-none">
              <div className="flex items-center gap-2 mb-3 text-sky-400">
                <span className="material-symbols-outlined select-none text-[18px] fill-current">verified</span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider">{lang === 'id' ? 'PROSES FINALISASI' : 'FINALIZATION PROCESS'}</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-8 mb-4">
                Final Confirmation - Securing the Deal
              </h2>
              <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
                {lang === 'id' ? 'Tinjau kembali syarat dan rincian alokasi sebelum mengeksekusi kontrak pintar yang aman dan transparan.' : 'Double check parameters and warehouse allocations before committing to smart blockchain transactions.'}
              </p>
            </div>
          </div>

          {/* Right panel interactive form Review */}
          <div className="flex-1 w-full md:pl-10 md:pr-2 px-1 py-4 overflow-y-auto">
            <div className="max-w-xl mx-auto flex flex-col gap-6">
              {/* Stepper bar */}
              <nav aria-label="Progress" className="mb-4">
                <ol className="flex items-center justify-between w-full" role="list">
                  {/* Step 1: Koleksi Volume */}
                  <li className="relative flex flex-col items-center flex-1">
                    <div className="group flex flex-col items-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3B82F6] text-white">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </span>
                      <span className="absolute top-10 text-[9px] font-mono tracking-wider uppercase text-slate-400">{lang === 'id' ? 'Koleksi Volume' : 'Volume Collection'}</span>
                    </div>
                    <div aria-hidden="true" className="absolute left-[calc(50%+16px)] right-[-50%] top-4 h-0.5 bg-[#3B82F6]"></div>
                  </li>
                  {/* Step 2: Penawaran Harga */}
                  <li className="relative flex flex-col items-center flex-1">
                    <div className="group flex flex-col items-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3B82F6] text-white">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </span>
                      <span className="absolute top-10 text-[9px] font-mono tracking-wider uppercase text-slate-400">{lang === 'id' ? 'Penawaran Harga' : 'Price Bidding'}</span>
                    </div>
                    <div aria-hidden="true" className="absolute left-[calc(50%+16px)] right-[-50%] top-4 h-0.5 bg-[#3B82F6]"></div>
                  </li>
                  {/* Step 3: Analisis AI */}
                  <li className="relative flex flex-col items-center flex-1">
                    <div className="group flex flex-col items-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3B82F6] text-white">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </span>
                      <span className="absolute top-10 text-[9px] font-mono tracking-wider uppercase text-slate-400">{lang === 'id' ? 'Analisis AI' : 'AI Analysis'}</span>
                    </div>
                    <div aria-hidden="true" className="absolute left-[calc(50%+16px)] right-[-50%] top-4 h-0.5 bg-gray-200"></div>
                  </li>
                  {/* Step 4: Konfirmasi Akhir */}
                  <li className="relative flex flex-col items-center flex-1">
                    <div className="group flex flex-col items-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3B82F6] bg-white">
                        <span className="h-2 w-2 rounded-full bg-[#3B82F6]"></span>
                      </span>
                      <span className="absolute top-10 text-[9px] font-mono font-bold tracking-wider uppercase text-[#3B82F6]">{lang === 'id' ? 'Konfirmasi Akhir' : 'Final Confirmation'}</span>
                    </div>
                  </li>
                </ol>
              </nav>

              {/* Reviewing detail paper layout */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden mt-6">
                <div className="p-5 border-b border-gray-100 bg-slate-50/70">
                  <h2 className="text-xl font-extrabold text-[#0b1c30] tracking-tight">{t.finalReviewTitle}</h2>
                  <p className="text-xs text-[#3d4a42] mt-1 font-medium">{t.finalReviewSubtitle}</p>
                </div>

                <div className="p-5 space-y-5">
                  {/* System analysis box */}
                  <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-50/50 flex gap-3 items-start relative overflow-hidden">
                    <div className="text-blue-600 shrink-0 mt-0.5">
                      <span className="material-symbols-outlined select-none text-[20px] fill-current">auto_awesome</span>
                    </div>
                    <div>
                      <h3 className="font-mono text-[9px] font-bold text-blue-600 mb-1 uppercase tracking-widest">{t.systemAnalysisTitle}</h3>
                      <p className="text-xs text-[#3d4a42] leading-relaxed">{t.systemAnalysisDesc}</p>
                    </div>
                  </div>

                  {/* Selected supplier card representation */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-gray-100 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl text-blue-600 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">factory</span>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-mono font-bold uppercase tracking-wider">{t.pemasokTerpilih}</span>
                          <span className="font-extrabold text-sm text-[#0b1c30]">{selectedSupplier}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-mono font-bold uppercase tracking-wider sm:text-right">{t.nilaiKontrak}</span>
                        <span className="text-lg font-black text-blue-600">{formattedTotalValue}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 pt-3 space-y-2 text-xs">
                      <span className="text-[10px] text-[#3d4a42] font-mono font-bold uppercase tracking-wider block mb-1">{t.ringkasanAlokasi}</span>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
                          <span>Koperasi Sumber Makmur (Anda)</span>
                        </div>
                        <span className="font-bold">{qtySumberMakmur} Ton ({((qtySumberMakmur / totalVolume) * 100).toFixed(0)}%)</span>
                      </div>

                      {procurementMode === 'konsorsium' && (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                              <span>Koperasi Padiwangi</span>
                            </div>
                            <span className="font-bold">{qtyPadiwangi} Ton ({((qtyPadiwangi / totalVolume) * 100).toFixed(0)}%)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                              <span>Koperasi Melati Jaya</span>
                            </div>
                            <span className="font-bold">{qtyMelatiJaya} Ton ({((qtyMelatiJaya / totalVolume) * 100).toFixed(0)}%)</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group text-xs">
                      <div className="mt-0.5 relative flex items-center justify-center shrink-0 select-none">
                        <input
                          id="consent-check"
                          className="peer appearance-none w-5 h-5 rounded border border-gray-300 bg-white checked:bg-[#3B82F6] checked:border-[#3B82F6] transition-all cursor-pointer"
                          type="checkbox"
                          checked={isConsentChecked}
                          onChange={(e) => setIsConsentChecked(e.target.checked)}
                        />
                        <span className="material-symbols-outlined text-[16px] text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold">check</span>
                      </div>
                      <span className="text-[#3d4a42] group-hover:text-[#0b1c30] transition-colors leading-relaxed font-semibold">
                        {t.checkboxConsent}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons row */}
              <div className="space-y-4">
                <button
                  onClick={handleExecuteContract}
                  className="w-full bg-[#3B82F6] text-white py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-2 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">contract</span>
                  {t.buttonSignExec}
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-[#6b7280] font-medium leading-none">
                  <span className="material-symbols-outlined text-xs">lock</span>
                  <span>{t.securedSecured}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal popup */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-gray-200 shadow-xl overflow-hidden font-sans">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3B82F6] text-[20px]">verified_user</span>
                {isSigned 
                  ? (lang === 'id' ? 'Dokumen Berhasil Ditandatangani' : 'Document Signed Successfully')
                  : (lang === 'id' ? 'Masukkan Tanda Tangan' : 'Digital Signature Input')}
              </h3>
              {!isSigned && (
                <button onClick={() => setIsSignatureModalOpen(false)} className="text-slate-400 hover:text-[#0b1c30] transition-colors focus:outline-none bg-transparent border-none">
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Document Preview Frame */}
              <div className="border border-gray-200 rounded-xl bg-[#faf9f6] p-5 shadow-inner relative overflow-hidden">
                <div className="font-serif text-[11px] text-slate-800 space-y-3 leading-normal max-h-60 overflow-y-auto pr-1">
                  <div className="text-center font-bold text-xs uppercase border-b border-slate-300 pb-2 tracking-wide font-sans">
                    {lang === 'id' ? 'DRAF SURAT PERJANJIAN PENGADAAN BERSAMA' : 'JOINT PROCUREMENT AGREEMENT DRAFT'}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-sans border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-slate-400 block font-semibold">{lang === 'id' ? 'KOMODITAS:' : 'COMMODITY:'}</span>
                      <span className="font-bold">Urea N46 (Premium)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">{lang === 'id' ? 'HARGA ACUAN:' : 'BENCHMARK PRICE:'}</span>
                      <span className="font-bold">Rp {unitPrice.toLocaleString('id-ID')} / kg</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">{lang === 'id' ? 'TOTAL VOLUME:' : 'TOTAL VOLUME:'}</span>
                      <span className="font-bold text-blue-600">{totalVolume} Ton</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">{lang === 'id' ? 'DISKON MASSAL:' : 'BULK DISCOUNT:'}</span>
                      <span className="font-bold text-emerald-600">12% ({lang === 'id' ? 'Hemat Rp 1.500/kg' : 'Save Rp 1,500/kg'})</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-100">
                      <span className="text-slate-400 block font-semibold">{lang === 'id' ? 'ESTIMASI NILAI KONTRAK:' : 'ESTIMATED CONTRACT VALUE:'}</span>
                      <span className="font-extrabold text-xs text-rose-600">{formattedTotalValue}</span>
                    </div>
                  </div>

                  <div className="space-y-2 font-sans">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'RINCIAN ALOKASI KOPERASI:' : 'COOPERATIVE ALLOCATION DETAILS:'}</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                      <li>Koperasi Sumber Makmur (Anda): <strong>{qtySumberMakmur} Ton</strong></li>
                      {procurementMode === 'konsorsium' && (
                        <>
                          <li>Koperasi Padiwangi: <strong>{qtyPadiwangi} Ton</strong></li>
                          <li>Koperasi Melati Jaya: <strong>{qtyMelatiJaya} Ton</strong> (Metode: {paymentResolution === 'talangan' ? (lang === 'id' ? 'Talangan Sumber Makmur' : 'Sumber Makmur Guarantee') : (lang === 'id' ? 'Setoran Eskrow Manual' : 'Manual Escrow')})</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="pt-2 text-[10px] leading-relaxed border-t border-slate-200">
                    {lang === 'id' ? (
                      <p>Menyepakati pengadaan komoditas Urea N46 sebanyak {totalVolume} Ton melalui konsorsium perwakilan koperasi tani. Para pihak setuju untuk menempatkan pengiriman di gudang masing-masing dengan rincian kapasitas terlampir. Dokumen ini sah dan mengikat secara hukum sejak ditandatangani secara elektronik di Ledger.</p>
                    ) : (
                      <p>Agreeing to the procurement of {totalVolume} Tons of Urea N46 commodity through the agricultural cooperatives consortium representation. The parties agree to deposit their respective shipments at the attached warehouse destinations. This document is legally binding upon digital signature publication on the blockchain ledger.</p>
                    )}
                  </div>
                </div>

                {/* Signed Green Stamp overlay */}
                {isSigned && (
                  <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-4 animate-scale-up z-20">
                    <div className="border-4 border-emerald-600 text-emerald-600 font-sans font-black text-center uppercase tracking-widest px-4 py-2 rounded-lg rotate-[-5deg] shadow-lg flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-[36px] font-bold">verified</span>
                      <span className="text-sm font-extrabold leading-none">{lang === 'id' ? 'TELAH DITANDATANGANI' : 'DIGITALLY SIGNED'}</span>
                      <span className="text-[7px] font-mono font-medium tracking-normal normal-case opacity-80 mt-1">Hash: {generatedHash.substring(0, 16)}...</span>
                    </div>
                  </div>
                )}
              </div>

              {!isSigned ? (
                <>
                  <p className="text-xs text-[#3d4a42] leading-relaxed">
                    {lang === 'id' 
                      ? 'Silakan sesuaikan nama dan jabatan Anda di bawah sebelum mengunci tanda tangan elektronik di rantai Ledger.'
                      : 'Configure authorized details that will be appended to the cryptographically-signed procurement ledger.'}
                  </p>

                  <div className="space-y-3.5 text-xs text-[#0b1c30]">
                    {/* Signer Name Input */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="modal-signer-name">{lang === 'id' ? 'Nama Penandatangan' : 'Signature Name'}</label>
                      <input
                        id="modal-signer-name"
                        required
                        className="w-full border border-gray-200 rounded-lg p-2.5 font-bold focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition-all outline-none"
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                      />
                    </div>

                    {/* Signer Title Input */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="modal-signer-title">{lang === 'id' ? 'Jabatan Resmi' : 'Official Title'}</label>
                      <input
                        id="modal-signer-title"
                        required
                        className="w-full border border-gray-200 rounded-lg p-2.5 font-semibold focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition-all outline-none"
                        value={signerTitle}
                        onChange={(e) => setSignerTitle(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200/50 rounded-xl space-y-2 text-xs text-emerald-800">
                  <p className="font-bold leading-normal">{lang === 'id' ? 'Transaksi Blockchain Sukses!' : 'Blockchain Transaction Succeeded!'}</p>
                  <p className="font-semibold text-slate-600 leading-normal">
                    {lang === 'id'
                      ? 'Tanda tangan kriptografi Anda telah ditambahkan ke dokumen persetujuan pengadaan bersama. Riwayat ini dicatat secara permanen di ledger.'
                      : 'Your cryptographic signature has been appended to the joint agreement document. This ledger is permanently archived.'}
                  </p>
                  <div className="bg-white border border-emerald-100 rounded-lg p-2 mt-1">
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">BLOCK LEDGER HASH</span>
                    <span className="font-mono text-[10px] font-black text-slate-800 break-all select-all">{generatedHash}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-gray-100 flex gap-2 justify-end">
              {!isSigned ? (
                <>
                  <button
                    onClick={() => setIsSignatureModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-[#0b1c30] hover:bg-slate-100 font-bold text-xs transition-colors focus:outline-none"
                  >
                    {t.batal}
                  </button>
                  <button
                    onClick={handleConfirmSignature}
                    className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg font-bold text-xs hover:bg-blue-700 active:scale-95 transition-all focus:outline-none"
                  >
                    {t.signApproveBtn}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCloseAfterSignature}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 active:scale-95 transition-all focus:outline-none shadow-sm"
                >
                  {lang === 'id' ? 'Tutup & Lihat Kontrak' : 'Close & View Contracts'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
