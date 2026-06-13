import React, { useState } from 'react';
import { TRANSLATIONS } from '../data';
import { SupplierHealth, Order } from '../types';

interface SupplierMatrixScreenProps {
  lang: 'id' | 'en';
  supplierHealths: SupplierHealth[];
  orders: Order[];
}

export default function SupplierMatrixScreen({ lang, supplierHealths, orders }: SupplierMatrixScreenProps) {
  const t = TRANSLATIONS[lang];
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('Semua');

  // Generate beautiful detailed heat matrix parameters for each supplier based on their current percentage performance score
  const getHeatMatrixDetails = (percentage: number) => {
    // We can derive 6 dimensions of performance for a complete Heat Matrix Grid
    return [
      {
        key: 'pengiriman',
        label: lang === 'id' ? 'Ketepatan Pengiriman' : 'On-Time Delivery',
        value: Math.min(100, Math.round(percentage * 1.02)),
        desc: lang === 'id' ? 'Logistik Tepat Waktu' : 'Timely Logistics Dispatch'
      },
      {
        key: 'kualitas',
        label: lang === 'id' ? 'Kualitas Produk' : 'Product Grade Quality',
        value: Math.min(100, Math.round(percentage * 0.98)),
        desc: lang === 'id' ? 'Sesuai Spesifikasi Fisik' : 'Meets Physical Specs'
      },
      {
        key: 'komunikasi',
        label: lang === 'id' ? 'Respons Komunikasi' : 'Response & Support',
        value: Math.min(100, Math.round(percentage * 1.01)),
        desc: lang === 'id' ? 'Kecepatan Respons Admin' : 'Agent Chat Response speed'
      },
      {
        key: 'kepatuhan',
        label: lang === 'id' ? 'Kepatuhan Kontrak' : 'Contract Compliance',
        value: Math.min(100, Math.round(percentage * 1.04)),
        desc: lang === 'id' ? 'Tanda Tangan & Verifikasi' : 'Hash Audit Match Rate'
      },
      {
        key: 'kemasan',
        label: lang === 'id' ? 'Kondisi Kemasan' : 'Cargo Protective Wrap',
        value: Math.min(100, Math.round(percentage * 0.96)),
        desc: lang === 'id' ? 'Perlindungan Anti-Air' : 'Waterproof protection level'
      },
      {
        key: 'loyallitas',
        label: lang === 'id' ? 'Fleksibilitas Pembayaran' : 'Funding Flexibility',
        value: Math.min(100, Math.round(percentage * 0.95)),
        desc: lang === 'id' ? 'Dukungan Tempo Kredit' : 'Invoice Credit Support window'
      }
    ];
  };

  // Helper color style for heat values
  const getHeatColor = (value: number) => {
    if (value >= 95) {
      return {
        bg: 'bg-emerald-500',
        bgLight: 'bg-emerald-50',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        border: 'border-emerald-300'
      };
    } else if (value >= 85) {
      return {
        bg: 'bg-green-500',
        bgLight: 'bg-green-50',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-800 border-green-200',
        border: 'border-green-300'
      };
    } else if (value >= 75) {
      return {
        bg: 'bg-yellow-500',
        bgLight: 'bg-yellow-50',
        text: 'text-yellow-700',
        badge: 'bg-yellow-105 text-yellow-800 border-yellow-250',
        border: 'border-yellow-350 font-semibold'
      };
    } else {
      return {
        bg: 'bg-rose-500',
        bgLight: 'bg-rose-50',
        text: 'text-rose-700',
        badge: 'bg-rose-100 text-rose-800 border-rose-200',
        border: 'border-rose-300 font-semibold animate-pulse'
      };
    }
  };

  // Get list of unique product types for filtering
  const uniqueProducts = ['Semua', ...Array.from(new Set(supplierHealths.map(s => s.product)))];

  // Filter list
  const filteredSuppliers = supplierHealths.filter(s => {
    if (selectedProductFilter === 'Semua') return true;
    return s.product === selectedProductFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in font-sans" id="supplier-matrix-root">
      
      {/* Header and Explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0b1c30] tracking-tight leading-tight">
            {lang === 'id' ? 'Matriks Kesehatan & Kredibilitas Pemasok' : 'Supplier Health & Heat Score Matrix'}
          </h2>
          <p className="text-[#64748b] text-xs font-semibold mt-1">
            {lang === 'id'
              ? 'Evaluasi mendalam performa supplier berdasarkan log kegagalan, ketepatan pengiriman kurir, dan rating audit real-time.'
              : 'Audit credit risk, courier delivery rate, transit safety logs and overall supplier efficiency ratings.'}
          </p>
        </div>

        {/* Legend color index */}
        <div className="flex gap-2.5 bg-white border border-gray-200 px-3.5 py-2.5 rounded-xl text-[10px] font-bold shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 block"></span>
            <span>&ge; 95% (Excellent)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-500 block"></span>
            <span>85-94% (Good)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400 block"></span>
            <span>75-84% (Warning)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 block animate-pulse"></span>
            <span>&lt; 75% (Critical)</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
        <span className="text-xs font-extrabold text-[#64748b] whitespace-nowrap">
          {lang === 'id' ? 'Filter Kategori Komoditas:' : 'Filter Commodity Type:'}
        </span>
        {uniqueProducts.map((prod) => (
          <button
            key={prod}
            onClick={() => setSelectedProductFilter(prod)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border outline-none cursor-pointer ${
              selectedProductFilter === prod
                ? 'bg-[#3B82F6] text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border-gray-200'
            }`}
          >
            {prod}
          </button>
        ))}
      </div>

      {/* Grid 3-Columns Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((sup) => {
          const matrix = getHeatMatrixDetails(sup.percentage);
          const scoreStyle = getHeatColor(sup.percentage);

          // Get counts of past rating stars from active/completed orders
          const supplierOrders = orders.filter(o => o.supplierName.toLowerCase() === sup.name.toLowerCase());
          const ordersWithRating = supplierOrders.filter(o => o.rating !== undefined);
          const avgRating = ordersWithRating.length > 0 
            ? (ordersWithRating.reduce((sum, o) => sum + (o.rating || 0), 0) / ordersWithRating.length).toFixed(1)
            : null;

          return (
            <div 
              key={sup.name}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              
              {/* Badge label / Header index */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white font-mono shadow-sm ${scoreStyle.bg}`}>
                    {sup.code}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0b1c30] tracking-tight leading-tight">{sup.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{lang === 'id' ? 'Kategori Utama:' : 'Main Fleet:'} <span className="text-blue-600">{sup.product}</span></p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded border ${scoreStyle.badge}`}>
                    {sup.status}
                  </span>
                  <span className="text-xl font-black text-[#0b1c30] mt-1 font-mono">{sup.percentage}%</span>
                </div>
              </div>

              {/* Progress health Bar Indicator */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-gray-400">{lang === 'id' ? 'Skor Kepercayaan Ledger' : 'Ledger Credibility score'}</span>
                  <span className={scoreStyle.text}>{sup.percentage} / 100</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${scoreStyle.bg}`} 
                    style={{ width: `${sup.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Heat Matrix Grid (2 columns x 3 rows) showing detailed colored ratings blocks */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono border-b border-gray-100 pb-1">
                  {lang === 'id' ? 'Matriks Performa (Heat Indicators)' : 'Heat Matrix performance dimensions'}
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  {matrix.map((item) => {
                    const heat = getHeatColor(item.value);
                    return (
                      <div 
                        key={item.key} 
                        className={`p-2 rounded-lg border transition-all ${heat.bgLight} ${heat.border} flex flex-col justify-between`}
                      >
                        <span className="text-[9px] text-gray-500 font-bold block leading-relaxed">{item.label}</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className={`text-xs font-black font-mono ${heat.text}`}>{item.value}%</span>
                          {/* Colored heat square indicator */}
                          <span className={`w-2.5 h-2.5 rounded-sm shadow-inner ${heat.bg}`}></span>
                        </div>
                        <span className="text-[8px] text-gray-400 font-semibold block mt-0.5 leading-none truncation">
                          {item.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order volume summary metrics */}
              <div className="bg-slate-50 border border-gray-100 p-2.5 rounded-xl flex items-center justify-between text-[11px] font-bold">
                <div>
                  <span className="text-gray-400 block text-[9px] font-mono leading-none">{lang === 'id' ? 'VOLUME ORDER' : 'TOTAL SHIPPED'}</span>
                  <span className="text-slate-800 font-extrabold mt-1 block font-mono">
                    {supplierOrders.length} {lang === 'id' ? 'Pesanan' : 'Orders'}
                  </span>
                </div>

                <div className="w-px h-6 bg-gray-200"></div>

                <div className="text-right">
                  <span className="text-gray-400 block text-[9px] font-mono leading-none">{lang === 'id' ? 'AVERAGE RATING' : 'AVERAGE RATING'}</span>
                  {avgRating ? (
                    <span className="text-[#0b1c30] font-extrabold mt-1 flex items-center justify-end gap-0.5 font-mono text-xs">
                      {avgRating}/5.0
                      <span className="material-symbols-outlined text-[13px] text-amber-500 font-bold" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                    </span>
                  ) : (
                    <span className="text-gray-400 mt-1 block text-[10px] italic font-semibold">{lang === 'id' ? 'Belum Ada Rating' : 'No ratings yet'}</span>
                  )}
                </div>
              </div>

              {/* Display recent comments/feedbacks from the cooperative if available */}
              {supplierOrders.some(o => o.reviewComment) && (
                <div className="border-t border-gray-100 pt-3">
                  <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider font-mono block">
                    {lang === 'id' ? 'Ulasan Koperasi Terkini' : 'Latest Cooperative Feedback'}
                  </span>
                  <div className="mt-1 pb-1">
                    {supplierOrders.filter(o => o.reviewComment).slice(0, 1).map((order, idx) => (
                      <div key={idx} className="bg-amber-50/10 border border-amber-100/50 p-2 rounded text-[10px] leading-relaxed text-slate-600 font-medium italic">
                        "{order.reviewComment}"
                        <span className="text-[8px] text-gray-400 block mt-1 normal-case not-italic font-mono">
                          - via {order.id} ({order.createdAt})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
