import React, { useState } from 'react';
import { StockItem, StockLog } from '../types';
import { INITIAL_STOCK_ITEMS, INITIAL_STOCK_LOGS, TRANSLATIONS } from '../data';

interface StokInventarisScreenProps {
  lang: 'id' | 'en';
}

export default function StokInventarisScreen({ lang }: StokInventarisScreenProps) {
  const [stockList, setStockList] = useState<StockItem[]>(INITIAL_STOCK_ITEMS);
  const [stockLogs] = useState<StockLog[]>(INITIAL_STOCK_LOGS);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);

  // New stock form fields
  const [newProductName, setNewProductName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCoop, setNewCoop] = useState('Tani Makmur');
  const [newStock, setNewStock] = useState('500');
  const [newThreshold, setNewThreshold] = useState('800');
  const [newCapMax, setNewCapMax] = useState('1500');
  const [newUnit, setNewUnit] = useState('Ton');

  const t = TRANSLATIONS[lang];

  const handleCreateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newSku) {
      alert(lang === 'id' ? 'Nama produk dan SKU wajib diisi.' : 'Product name and SKU are required.');
      return;
    }

    const currentQty = parseFloat(newStock) || 0;
    const thresholdQty = parseFloat(newThreshold) || 0;

    let calStatus: 'KRITIS' | 'SELESAI' | 'PERINGATAN' = 'SELESAI';
    if (currentQty < thresholdQty / 2) {
      calStatus = 'KRITIS';
    } else if (currentQty < thresholdQty) {
      calStatus = 'PERINGATAN';
    }

    const newItem: StockItem = {
      id: `stock-item-${Date.now()}`,
      name: newProductName,
      sku: newSku,
      cooperative: newCoop,
      stock: currentQty,
      unit: newUnit,
      threshold: thresholdQty,
      capacityMax: parseFloat(newCapMax) || 2000,
      status: calStatus
    };

    setStockList(prev => [newItem, ...prev]);
    setIsInputModalOpen(false);

    // Reset fields
    setNewProductName('');
    setNewSku('');
    setNewStock('500');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in" id="inventory-workspace">
      {/* Header controls layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-gray-400 block mb-1 uppercase tracking-widest">{t.warehouseStockBreadcrumb}</span>
          <h2 className="text-3xl font-bold text-[#0b1c30] tracking-tight">{t.warehouseTitle}</h2>
        </div>

        {/* Action controllers dropdown */}
        <div className="flex gap-2.5 w-full sm:w-auto">
          <select className="h-11 px-4 text-xs font-bold rounded-xl border border-gray-200 bg-white shadow-sm outline-none text-[#0b1c30] focus:border-[#3B82F6] cursor-pointer">
            <option value="all">{t.allCoops}</option>
            <option value="tani">Tani Makmur</option>
            <option value="suka">Suka Maju</option>
          </select>
          <button
            onClick={() => alert('Launching overall stock compliance audit...')}
            className="h-11 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl flex items-center gap-2 border border-transparent shadow-sm focus:outline-none transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">summarize</span>
            {t.stockReport}
          </button>
        </div>
      </div>

      {/* Bento info row split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Critical warehouse alert item */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2 text-rose-600 mb-4">
              <span className="material-symbols-outlined font-bold text-[20px]">warning</span>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider">{t.criticalStock}</span>
            </div>

            <p className="text-xs text-[#3d4a42] mb-5 font-semibold">
              {t.itemsBelowThreshold}
            </p>

            <div className="space-y-3.5">
              {stockList.filter(item => item.status === 'KRITIS').map(item => (
                <div key={item.id} className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/50 flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-xs text-[#0b1c30]">{item.name}</h4>
                    <span className="text-[10px] text-[#6b7280] font-mono leading-none">{item.sku} • {item.cooperative}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-xs text-rose-600">{item.stock} {item.unit}</p>
                    <p className="text-[9px] text-[#6b7280] font-medium mt-0.5">{lang === 'id' ? `Ambang: ${item.threshold}` : `Min limit: ${item.threshold}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsInputModalOpen(true)}
            className="w-full mt-6 py-3 bg-[#3B82F6] text-white hover:bg-blue-700 font-bold text-xs rounded-lg uppercase tracking-wider transition-colors shadow-sm focus:outline-none"
          >
            {t.inputNewStock}
          </button>
        </div>

        {/* AI Restock forecasting card */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card left: AI Restocking smart forecast */}
          <div className="bg-blue-50/20 rounded-xl p-5 border-2 border-transparent shadow-sm flex flex-col justify-between" style={{
            backgroundImage: 'linear-gradient(#f8faff, #f8faff), linear-gradient(to right, #2563EB, #60A5FA)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box'
          }}>
            <div>
              <div className="flex items-center gap-2 text-blue-600 mb-3">
                <span className="material-symbols-outlined select-none text-[20px] font-bold fill-current">auto_awesome</span>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider">{t.aiStockTitle}</span>
              </div>
              <h4 className="font-extrabold text-sm text-[#0b1c30] leading-snug">{lang === 'id' ? 'Prediksi Permintaan Pupuk Urea' : 'Urea Fertilizer Demand Predictor'}</h4>
              <p className="text-xs text-[#3d4a42]/90 leading-relaxed font-semibold">
                {t.aiStockDesc}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-blue-500/10 text-[10px] text-blue-600 font-bold uppercase tracking-wider font-mono">
              Confidence Score: 94% • High Probability
            </div>
          </div>

          {/* Card right: Warehouse capacity graph double bars */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-[#0b1c30] mb-4">{t.totalWarehouseCap}</h4>
              <div className="space-y-4 font-sans">
                {/* Yard 1 */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700">
                    <span>Gudang Utama Tani Makmur</span>
                    <span className="font-bold text-[#0b1c30]">450 / 2,000 Ton (22.5%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '22.5%' }}></div>
                  </div>
                </div>

                {/* Yard 2 */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700">
                    <span>Gudang Utama Suka Maju</span>
                    <span className="font-bold text-[#0b1c30]">2,400 / 3,000 Ton (80%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 mt-5 font-semibold uppercase font-mono">
              Status: SAFE STORAGE LIMIT
            </p>
          </div>
        </div>
      </div>

      {/* Main product inventory table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-[#f8f9ff]/40">
          <h3 className="font-bold text-base text-[#0b1c30]">{t.productList}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-100 text-[#3d4a42] font-mono font-bold uppercase tracking-wider">
                <th className="p-4">{t.produkColumn}</th>
                <th className="p-4">{t.coopColumn}</th>
                <th className="p-4 text-center">{t.currentStockColumn}</th>
                <th className="p-4 text-center">{t.minThresholdColumn}</th>
                <th className="p-4 text-right">{t.warehouseCapColumn}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-800">
              {stockList.map(item => (
                <tr className="hover:bg-slate-50/50 transition-colors" key={item.id}>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-blue-600">
                      {item.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-[#0b1c30]">{item.name}</div>
                      <div className="text-[10px] text-[#6b7280] font-mono leading-none">{item.sku}</div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{item.cooperative}</td>
                  <td className="p-4 text-center font-mono font-bold">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                      item.status === 'KRITIS' ? 'bg-red-50 text-rose-600' :
                      item.status === 'PERINGATAN' ? 'bg-amber-50 text-amber-600' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'KRITIS' ? 'bg-rose-500 animate-pulse' :
                        item.status === 'PERINGATAN' ? 'bg-amber-500 animate-pulse' :
                        'bg-blue-600'
                      }`}></span>
                      {item.stock} {item.unit}
                    </span>
                  </td>
                  <td className="p-4 text-center font-mono font-semibold text-slate-600">{item.threshold} {item.unit}</td>
                  <td className="p-4 text-right font-mono font-bold text-[#0b1c30]">{item.capacityMax} {item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit stock logs section */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-[#f8f9ff]/40 flex justify-between items-center">
          <h3 className="font-bold text-base text-[#0b1c30]">{t.stockLogsTitle}</h3>
          <button className="text-xs font-bold text-blue-600 hover:underline hover:bg-transparent bg-transparent border-none outline-none cursor-pointer focus:outline-none">
            {t.viewAllLogs}
          </button>
        </div>

        <div className="divide-y divide-gray-100 text-xs">
          {stockLogs.map(log => (
            <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-slate-50/40 transition-colors" key={log.id}>
              <div className="flex gap-3">
                <span className={`material-symbols-outlined p-2 rounded-lg shrink-0 ${
                  log.type === 'masuk' ? 'bg-blue-50 text-blue-600' :
                  log.type === 'keluar' ? 'bg-rose-100 text-rose-600' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {log.type === 'masuk' ? 'download' : log.type === 'keluar' ? 'upload' : 'published_with_changes'}
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-[#0b1c30]">{log.title}</h4>
                  <p className="text-[11px] text-[#6b7280] font-medium mt-0.5">{log.description}</p>
                </div>
              </div>
              <div className="text-right sm:text-right">
                <p className={`font-mono font-extrabold text-sm ${log.color}`}>{log.amount}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{log.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input New Stock Modal popup */}
      {isInputModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">inventory_2</span>
                {t.inputNewStock}
              </h3>
              <button onClick={() => setIsInputModalOpen(false)} className="text-slate-400 hover:text-[#0b1c30] transition-colors focus:outline-none">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateStock}>
              <div className="p-5 space-y-4 text-xs text-[#0b1c30]">
                {/* Product Name Input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="product-name">{lang === 'id' ? 'Nama Produk' : 'Product Name'}</label>
                  <input
                    id="product-name"
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition-all outline-none font-semibold"
                    placeholder="e.g. Pupuk KCl Subur"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                  />
                </div>

                {/* SKU Code Input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="sku-code">SKU Code</label>
                  <input
                    id="sku-code"
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition-all outline-none font-mono font-semibold"
                    placeholder="e.g. KC-2026-09"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                  />
                </div>

                {/* Cooperative Choice */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="coop-select">{t.coopColumn}</label>
                  <select
                    id="coop-select"
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white focus:border-[#3B82F6] outline-none font-semibold"
                    value={newCoop}
                    onChange={(e) => setNewCoop(e.target.value)}
                  >
                    <option value="Tani Makmur">Tani Makmur</option>
                    <option value="Suka Maju">Suka Maju</option>
                  </select>
                </div>

                {/* Numbers row input */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="stock-qty">{lang === 'id' ? 'Jumlah Masuk' : 'Stock Qty'}</label>
                    <input
                      id="stock-qty"
                      type="number"
                      className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-[#3B82F6] outline-none font-semibold"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="unit-select">Unit</label>
                    <select
                      id="unit-select"
                      className="w-full border border-gray-200 rounded-lg p-2.5 bg-white focus:border-[#3B82F6] outline-none font-semibold"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                    >
                      <option value="Ton">Ton</option>
                      <option value="Liter">Liter</option>
                      <option value="Kg">Kg</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="threshold-qty">{lang === 'id' ? 'Batas Ambang' : 'Min Threshold'}</label>
                    <input
                      id="threshold-qty"
                      type="number"
                      className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-[#3B82F6] outline-none font-semibold"
                      value={newThreshold}
                      onChange={(e) => setNewThreshold(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="capacity-max">{lang === 'id' ? 'Kapasitas Max' : 'Max Capacity'}</label>
                    <input
                      id="capacity-max"
                      type="number"
                      className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-[#3B82F6] outline-none font-semibold"
                      value={newCapMax}
                      onChange={(e) => setNewCapMax(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-gray-100 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsInputModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-[#0b1c30] hover:bg-slate-100 font-bold text-xs transition-colors focus:outline-none"
                >
                  {t.batal}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg font-bold text-xs hover:bg-blue-700 active:scale-95 transition-all focus:outline-none"
                >
                  {lang === 'id' ? 'Simpan' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
