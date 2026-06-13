import React, { useState, useEffect } from 'react';
import { User, SupplierHealth, ProcurementLog, StockItem } from '../types';
import { INITIAL_SUPPLIER_HEALTHS, INITIAL_PROCUREMENT_LOGS, TRANSLATIONS } from '../data';

interface DashboardScreenProps {
  user: User;
  lang: 'id' | 'en';
  onNavigateToTab: (tab: string, state?: any) => void;
  supplierHealths: SupplierHealth[];
}

export default function DashboardScreen({ user, lang, onNavigateToTab, supplierHealths }: DashboardScreenProps) {
  const t = TRANSLATIONS[lang];
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Record<string, { recommendedVolume: number, weatherSummary: string, reasoningId: string }>>({});

  useEffect(() => {
    fetch('/api/stocks')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setStocks(data);
      })
      .catch(err => console.error("Error loading dashboard stocks:", err));
  }, []);

  useEffect(() => {
    if (stocks.length > 0) {
      const lowItems = stocks.filter(item => {
        if (user.role === 'cooperative_admin') {
          const coopName = user.cooperative || '';
          return (item.cooperative.toLowerCase().includes(coopName.toLowerCase()) || coopName.toLowerCase().includes(item.cooperative.toLowerCase())) && item.stock < 0.3 * item.capacityMax;
        }
        return item.stock < 0.3 * item.capacityMax;
      });
      
      lowItems.forEach(item => {
        fetch('/api/ai/forecast-recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentStock: item.stock,
            capacityMax: item.capacityMax,
            threshold: item.threshold,
            commodityName: item.name
          })
        })
        .then(res => res.json())
        .then(data => {
          setAiRecommendations(prev => ({
            ...prev,
            [item.sku]: {
              recommendedVolume: data.recommendedVolume,
              weatherSummary: data.weatherSummary,
              reasoningId: lang === 'id' ? data.reasoningId : data.reasoningEn
            }
          }));
        })
        .catch(err => console.error("Error fetching forecast recommendation for " + item.sku, err));
      });
    }
  }, [stocks, lang, user]);

  const lowStockItems = stocks.filter(item => {
    if (user.role === 'cooperative_admin') {
      const coopName = user.cooperative || '';
      return (item.cooperative.toLowerCase().includes(coopName.toLowerCase()) || coopName.toLowerCase().includes(item.cooperative.toLowerCase())) && item.stock < 0.3 * item.capacityMax;
    }
    return item.stock < 0.3 * item.capacityMax;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" id="dashboard-view">
      {/* Welcome & Context Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 pb-2">
        <div>
          <h2 className="text-3xl font-bold text-[#0b1c30] tracking-tight">
            {lang === 'id' ? `Halo, ${user.cooperative}` : `Hello, ${user.cooperative}`}
          </h2>
          <p className="text-[#3d4a42] text-sm mt-1">{t.summaryProcurement}</p>
        </div>
      </div>

      {/* Stats Bento Grid Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Savings */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#64748B] text-xs font-mono font-bold uppercase tracking-wider">{t.totalSavings}</p>
              <h3 className="text-3xl font-extrabold text-[#3B82F6] mt-2 tracking-tight">Rp 42.5M</h3>
            </div>
            <span className="material-symbols-outlined text-[#3B82F6] bg-blue-50 p-2 rounded-lg">trending_up</span>
          </div>
          <p className="text-sm text-blue-600 mt-5 flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
            {lang === 'id' ? '12% dari bulan lalu' : '12% from last month'}
          </p>
        </div>

        {/* Card 2: Warnings */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ring-1 ring-amber-500/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#64748B] text-xs font-mono font-bold uppercase tracking-wider">{t.lowStockWarning}</p>
              <h3 className="text-3xl font-extrabold text-rose-600 mt-2 tracking-tight">
                {String(lowStockItems.length).padStart(2, '0')} SKU
              </h3>
            </div>
            <span className="material-symbols-outlined text-rose-600 bg-red-100 p-2 rounded-lg">warning</span>
          </div>
          <p className="text-sm text-rose-600 font-semibold mt-5">{t.restockSoon}</p>
        </div>

        {/* Card 3: AI Insights */}
        <div className="rounded-xl p-5 relative overflow-hidden border-2 border-transparent bg-[#F0F7FF] shadow-sm hover:shadow-md transition-all flex flex-col justify-between" style={{
          backgroundImage: 'linear-gradient(#F0F7FF, #F0F7FF), linear-gradient(to right, #3B82F6, #64748b)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box'
        }}>
          <div>
            <div className="flex justify-between items-start mb-1">
              <p className="text-[#3B82F6] text-xs font-mono font-bold uppercase tracking-wider">{t.aiInsightTitle}</p>
              <span className="material-symbols-outlined text-[#3B82F6] select-none text-[20px] fill-current">auto_awesome</span>
            </div>
            <h4 className="font-bold text-[#0F172A] text-base mt-2">{t.aiInsightOptim}</h4>
            <p className="text-[#64748B] text-xs mt-1 leading-relaxed">
              {t.aiInsightDesc}
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('detail', { step: 'verification' })}
            className="mt-4 text-[#3B82F6] text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer focus:outline-none w-fit"
          >
            {t.viewAnalysis}
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Low Stock SKU Alerts Section */}
      {lowStockItems.length > 0 && (
        <div className="space-y-3 animate-fade-in" id="low-stock-dashboard-alerts">
          <div className="flex items-center gap-2 text-rose-600">
            <span className="material-symbols-outlined font-bold select-none text-[22px]">warning</span>
            <h3 className="text-lg font-bold text-[#0b1c30]">{lang === 'id' ? 'Peringatan SKU: Stok Tipis' : 'Low Stock SKU Alerts'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockItems.map((item) => {
              const rec = aiRecommendations[item.sku];
              const recommendedVolume = rec ? rec.recommendedVolume : (item.capacityMax - item.stock);
              const reasoningText = rec ? rec.reasoningId : (lang === 'id' 
                ? `Buat pesanan baru sebanyak ${recommendedVolume} ${item.unit} untuk mengisi kapasitas gudang.`
                : `Create a restock order of ${recommendedVolume} ${item.unit} to replenish warehouse.`);

              return (
                <div 
                  key={item.id} 
                  className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex justify-between items-center shadow-sm relative overflow-hidden transition-all hover:bg-rose-50/70 hover:shadow-md"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500"></div>
                  <div className="pl-2.5 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#0f172a]">{item.name}</span>
                      <span className="font-mono text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded uppercase">{item.sku}</span>
                    </div>
                    <p className="text-xs text-rose-700 font-semibold mt-1">
                      {lang === 'id' 
                        ? `Stok kritis: ${item.stock} ${item.unit} (Batas minimum: ${item.threshold} ${item.unit})`
                        : `Critical stock: ${item.stock} ${item.unit} (Min limit: ${item.threshold} ${item.unit})`}
                    </p>
                    <div className="mt-2 space-y-1 bg-white/70 border border-rose-100 p-2.5 rounded-lg text-[11px] text-[#0b1c30]">
                      <div className="flex items-center gap-1 text-blue-600 font-extrabold uppercase text-[9px] font-mono">
                        <span className="material-symbols-outlined text-[14px] font-bold">cloud</span>
                        {lang === 'id' ? 'Saran Cuaca AI BMKG' : 'BMKG AI Climate Decision'}
                      </div>
                      <p className="font-bold text-[11px] text-rose-900 leading-tight">
                        {lang === 'id' ? 'Saran Volume: ' : 'Recommended Volume: '}<span className="text-blue-600 font-black font-mono">{recommendedVolume} {item.unit}</span>
                      </p>
                      <p className="text-slate-600 leading-snug mt-0.5 font-medium">
                        Saran AI: {reasoningText}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('detail', { 
                      step: 'verification', 
                      mode: 'mandiri', 
                      sku: item.sku, 
                      recommendQty: recommendedVolume,
                      productName: item.name,
                      weatherRecommendation: rec
                    })}
                    className="w-10 h-10 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 flex items-center justify-center transition-all active:scale-90 shadow-sm border border-rose-200/20 cursor-pointer focus:outline-none shrink-0"
                    title={lang === 'id' ? 'Buat Pesanan Restock' : 'Create Restock Order'}
                  >
                    <span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Bottom Row split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier Health */}
        <div className="lg:col-span-1 bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-bold text-base text-[#0f172a]">{t.kesehatanPemasok}</h4>
              <span className="material-symbols-outlined text-slate-400 text-[20px] select-none" title="Health Metrics Info">info</span>
            </div>

            <div className="space-y-4">
              {supplierHealths.map((sup: SupplierHealth, idx) => (
                <div className="flex items-center justify-between" key={sup.name + idx}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center font-bold text-[#3B82F6]">
                      {sup.code}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#0f172a]">{sup.name}</p>
                      <p className="text-[11px] text-[#64748b] font-medium">{sup.product}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${sup.status === 'WASPADA' ? 'text-amber-600' : 'text-blue-600'}`}>{sup.percentage}%</p>
                    <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider font-bold">
                      {sup.status === 'SANGAT BAIK' && (lang === 'id' ? 'Sangat Baik' : 'Excellent')}
                      {sup.status === 'BAIK' && (lang === 'id' ? 'Baik' : 'Good')}
                      {sup.status === 'WASPADA' && (lang === 'id' ? 'Waspada' : 'Warning')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => alert(lang === 'id' ? 'Membuka direktori pemasok pertanian...' : 'Loading agricultural supplier directory...')}
            className="w-full mt-6 py-2.5 border-2 border-dashed border-[#E2E8F0] hover:border-[#3B82F6] rounded-lg text-[#64748b] hover:text-[#3B82F6] font-bold text-xs transition-colors hover:bg-slate-50 focus:outline-none"
          >
            {t.lihatPemasokDirektori}
          </button>
        </div>

        {/* Recent activity log table */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50/50">
              <h4 className="font-bold text-base text-[#0f172a]">{t.logAktivitas}</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 text-[#64748b] font-mono tracking-wider font-bold">
                    <th className="px-5 py-3 border-b border-[#E2E8F0]">{t.waktu}</th>
                    <th className="px-5 py-3 border-b border-[#E2E8F0]">{t.aktivitas}</th>
                    <th className="px-5 py-3 border-b border-[#E2E8F0]">{t.user}</th>
                    <th className="px-5 py-3 border-b border-[#E2E8F0] text-right">{t.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-slate-800">
                  {INITIAL_PROCUREMENT_LOGS.map((log: ProcurementLog, idx) => (
                    <tr className="hover:bg-slate-50/50 transition-colors" key={log.activity + idx}>
                      <td className="px-5 py-3.5 whitespace-nowrap text-[#64748b] font-medium">{log.time}</td>
                      <td className="px-5 py-3.5 font-bold text-[#0f172a]">{log.activity}</td>
                      <td className="px-5 py-3.5 text-slate-600 font-medium">{log.user}</td>
                      <td className="px-5 py-3.5 text-right font-bold whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider font-extrabold ${
                          log.status === 'BERHASIL' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.status === 'BERHASIL' ? (lang === 'id' ? 'BERHASIL' : 'SUCCESS') : (lang === 'id' ? 'TERTUNDA' : 'PENDING')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
