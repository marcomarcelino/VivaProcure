import React, { useState, useEffect } from 'react';
import { SupplierBid, SmartContract } from '../types';
import { INITIAL_BIDS, TRANSLATIONS } from '../data';

interface DataCollectionScreenProps {
  lang: 'id' | 'en';
  initialStep?: 'bidding' | 'verification' | 'final-confirmation';
  onNavigateToTab: (tab: string, state?: any) => void;
  onAddContract: (contract: SmartContract) => void;
}

export default function DataCollectionScreen({ lang, initialStep, onNavigateToTab, onAddContract }: DataCollectionScreenProps) {
  const [subTab, setSubTab] = useState<'bidding' | 'verification' | 'final-confirmation'>(initialStep || 'bidding');
  const [bidsList, setBidsList] = useState<SupplierBid[]>(INITIAL_BIDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signerName, setSignerName] = useState('Budi Santoso');
  const [signerTitle, setSignerTitle] = useState('Ketua Koperasi Tani Makmur');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (initialStep) {
      setSubTab(initialStep);
    }
  }, [initialStep]);

  // Handle Search on anonymous suppliers
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
    setIsSignatureModalOpen(true);
  };

  const handleConfirmSignature = () => {
    const newContract: SmartContract = {
      id: 'PRC/VI/2026-JP-004',
      title: lang === 'id' ? 'Surat Persetujuan Pengadaan Bersama - Urea #JP-2026-004' : 'Urea Collective Procurement Joint Agreement #JP-2026-004',
      commodity: 'Urea N46 (Premium)',
      quantity: '100 Ton',
      price: 'Rp 10.500 / kg',
      totalValue: 'Rp 1.050.000.000',
      firstParty: 'H. Ahmad Subarjo',
      firstPartyTitle: 'Ketua Koperasi Tani Makmur',
      secondParty: signerName,
      secondPartyTitle: signerTitle,
      hash: '0x8f2d658ec53cc320ab9f' + Math.random().toString(16).substr(2, 20),
      signedAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      deliveryMethod: lang === 'id' ? 'Pelabuhan Tanjung Emas, Semarang (FOB)' : 'Port of Tanjung Emas, Semarang (FOB)',
      documentText: lang === 'id'
        ? 'Menyepakati pengadaan komoditas Urea N46 sebanyak 100 Ton dengan total harga Rp 1.050.000.000 berskala nasional melalui konsorsium perwakilan koperasi tani. Distribusi logistik dilaksanakan dari pabrik manufaktur utama ke pelabuhan penyerahan.'
        : 'Agreeing to the procurement of 100 Tons of Urea N46 commodity with a total value of IDR 1,050,000,000 on a national scale through the agricultural cooperatives consortium representation.'
    };

    onAddContract(newContract);
    setIsSignatureModalOpen(false);
    
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
              {lang === 'id' ? 'Sesi Pengadaan Bersama #JP-2026-004 (Pupuk Urea - 100 Ton)' : 'Collective Procurement Session #JP-2026-004 (Urea Fertilizer - 100 Tons)'}
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
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2 pr-4">
              <div className="w-8 h-8 rounded-full bg-[#3B82F6] text-white flex items-center justify-center font-bold text-xs">1</div>
              <span className="font-bold text-xs text-[#3B82F6]">{lang === 'id' ? 'Penawaran' : 'Bids'}</span>
            </div>
            <div className="w-10 h-0.5 bg-gray-200"></div>
            <div className="flex items-center gap-2 opacity-50 px-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 text-[#0b1c30] flex items-center justify-center font-semibold text-xs font-mono">2</div>
              <span className="text-xs text-slate-500 font-semibold">{t.verifikasi}</span>
            </div>
            <div className="w-10 h-0.5 bg-gray-200"></div>
            <div className="flex items-center gap-2 opacity-50 px-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 text-[#0b1c30] flex items-center justify-center font-semibold text-xs font-mono">3</div>
              <span className="text-xs text-slate-500 font-semibold">{t.analisis}</span>
            </div>
            <div className="w-10 h-0.5 bg-gray-200"></div>
            <div className="flex items-center gap-2 opacity-50 px-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 text-[#0b1c30] flex items-center justify-center font-semibold text-xs font-mono">4</div>
              <span className="text-xs text-slate-500 font-semibold">{t.konfirmasi}</span>
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
                  placeholder={lang === 'id' ? 'Cari pemasok anonim...' : 'Search anonymized suppliers...'}
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
                    <th className="p-4 text-center">{t.bidStatusLabel}</th>
                    <th className="p-4 text-center">{t.docVerificationLabel}</th>
                    <th className="p-4 text-right">{t.quoteRangeLabel}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-slate-800">
                  {filteredBids.map((bid) => (
                    <tr className="hover:bg-slate-50/50 transition-colors" key={bid.id}>
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-[#eff4ff] flex items-center justify-center text-[#3B82F6]">
                          <span className="material-symbols-outlined text-[20px]">factory</span>
                        </div>
                        <div>
                          <div className="font-bold text-[#0b1c30]">{bid.name}</div>
                          <div className="text-[10px] text-[#6b7280] font-mono">{bid.encryptedId}</div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          bid.isLocked ? 'bg-blue-50 text-blue-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${bid.isLocked ? 'bg-blue-600' : 'bg-amber-600 animate-pulse'}`}></span>
                          {bid.bidStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          {bid.docVerified ? (
                            <span className="material-symbols-outlined text-blue-600 text-[20px]" title="Documents Verified">verified</span>
                          ) : (
                            <span className="material-symbols-outlined text-amber-600 text-[20px]" title="Pending Manual Verification">pending</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-[#0b1c30]">{bid.quoteRange}</td>
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

          {/* AI Financial Insight Footers */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex gap-4 items-start relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/15 pointer-events-none"></div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 z-10">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">payments</span>
            </div>
            <div className="z-10">
              <h4 className="font-mono text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">{t.financialSummaryTitle}</h4>
              <p className="text-xs text-[#3d4a42]/90 leading-relaxed font-semibold">
                {t.financialSummaryDesc}
              </p>
            </div>
          </div>

          {/* Navigation Action */}
          <div className="flex justify-end pt-3">
            <button
              onClick={() => setSubTab('verification')}
              className="bg-[#3B82F6] text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 group focus:outline-none"
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
                <h3 className="font-bold text-sm text-[#0f172a]">{lang === 'id' ? 'AI Verification Active' : 'AI Verification Active'}</h3>
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
                <div className="flex flex-col items-center gap-1 z-10 bg-[#f8f9ff] px-2 text-slate-400">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#3B82F6] flex items-center justify-center font-bold text-xs">
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  </div>
                  <span className="text-[10px] font-medium font-mono uppercase tracking-wider">{t.koleksi}</span>
                </div>
                <div className="flex flex-col items-center gap-1 z-10 bg-[#f8f9ff] px-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#3B82F6] bg-blue-50 text-[#3B82F6] flex items-center justify-center font-bold text-xs">2</div>
                  <span className="text-[10px] font-bold font-mono uppercase text-[#3B82F6] tracking-wider">{t.verifikasi}</span>
                </div>
                <div className="flex flex-col items-center gap-1 z-10 bg-[#f8f9ff] px-2 text-slate-400 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-slate-500 border border-gray-300 flex items-center justify-center font-bold text-xs">3</div>
                  <span className="text-[10px] font-medium font-mono uppercase tracking-wider">{t.analisis}</span>
                </div>
                <div className="flex flex-col items-center gap-1 z-10 bg-[#f8f9ff] px-2 text-slate-400 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-slate-500 border border-gray-300 flex items-center justify-center font-bold text-xs">4</div>
                  <span className="text-[10px] font-medium font-mono uppercase tracking-wider">{t.konfirmasi}</span>
                </div>
              </div>

              {/* Main title */}
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">PROCUREMENT #PRC-2023-884</span>
                <h2 className="text-3xl font-extrabold text-[#0b1c30] tracking-tight">{t.verifikasi} Data</h2>
                <p className="text-[#3d4a42] text-sm mt-1 leading-relaxed">{t.prosedurKerja}</p>
              </div>

              {/* Volume / verification grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total volume */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center gap-2 text-[#3d4a42] mb-3">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">inventory_2</span>
                    <span className="text-[11px] font-bold font-mono uppercase tracking-wider">{lang === 'id' ? 'TOTAL VOLUME' : 'TOTAL VOLUME'}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold text-blue-600">250</span>
                    <span className="text-[#3d4a42] font-semibold text-sm">Ton</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-mono uppercase tracking-wide">
                      Jagung Pipil Kering
                    </span>
                  </div>
                </div>

                {/* Status checkpoints checklist */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-[#3d4a42] mb-4">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">fact_check</span>
                    <span className="text-[11px] font-bold font-mono uppercase tracking-wider">{t.validationHeader}</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-800">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-blue-600 select-none text-[18px] fill-current">check_circle</span>
                      <span className="font-semibold">{t.validationList1}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-blue-600 select-none text-[18px] fill-current">check_circle</span>
                      <span className="font-semibold">{t.validationList2}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-blue-600 select-none text-[18px] fill-current">check_circle</span>
                      <span className="font-semibold">{t.validationList3}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Temuan audit block */}
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

              {/* Navigation Actions footer */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSubTab('bidding')}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-[#0b1c30] font-bold text-xs flex-1 hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  {t.backToKoleksi}
                </button>
                <button
                  onClick={() => setSubTab('final-confirmation')}
                  className="px-6 py-3 rounded-xl bg-[#3B82F6] text-white font-bold text-xs flex-1 hover:bg-blue-700 active:scale-95 transition-all text-center flex items-center justify-center gap-2 group focus:outline-none"
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
                  {/* Step 1: Koleksi */}
                  <li className="relative flex flex-col items-center flex-1">
                    <div className="group flex flex-col items-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3B82F6] text-white">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </span>
                      <span className="absolute top-10 text-[9px] font-mono tracking-wider uppercase text-slate-400">{t.koleksi}</span>
                    </div>
                    <div aria-hidden="true" className="absolute left-[calc(50%+16px)] right-[-50%] top-4 h-0.5 bg-[#3B82F6]"></div>
                  </li>
                  {/* Step 2: Verifikasi */}
                  <li className="relative flex flex-col items-center flex-1">
                    <div className="group flex flex-col items-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3B82F6] text-white">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </span>
                      <span className="absolute top-10 text-[9px] font-mono tracking-wider uppercase text-slate-400">{t.verifikasi}</span>
                    </div>
                    <div aria-hidden="true" className="absolute left-[calc(50%+16px)] right-[-50%] top-4 h-0.5 bg-[#3B82F6]"></div>
                  </li>
                  {/* Step 3: Analisis */}
                  <li className="relative flex flex-col items-center flex-1">
                    <div className="group flex flex-col items-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3B82F6] text-white">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </span>
                      <span className="absolute top-10 text-[9px] font-mono tracking-wider uppercase text-slate-400">{t.analisis}</span>
                    </div>
                    <div aria-hidden="true" className="absolute left-[calc(50%+16px)] right-[-50%] top-4 h-0.5 bg-gray-200"></div>
                  </li>
                  {/* Step 4: Konfirmasi */}
                  <li className="relative flex flex-col items-center flex-1">
                    <div className="group flex flex-col items-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3B82F6] bg-white">
                        <span className="h-2 w-2 rounded-full bg-[#3B82F6]"></span>
                      </span>
                      <span className="absolute top-10 text-[9px] font-mono font-bold tracking-wider uppercase text-[#3B82F6]">{t.konfirmasi}</span>
                    </div>
                  </li>
                </ol>
              </nav>

              {/* Reviewing detail paper layout border-gray-200 rounded-2xl */}
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
                          <span className="font-extrabold text-sm text-[#0b1c30]">PT Pupuk Indonesia</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-mono font-bold uppercase tracking-wider sm:text-right">{t.nilaiKontrak}</span>
                        <span className="text-lg font-black text-blue-600">Rp 1.05M</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 pt-3 space-y-2 text-xs">
                      <span className="text-[10px] text-[#3d4a42] font-mono font-bold uppercase tracking-wider block mb-1">{t.ringkasanAlokasi}</span>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
                          <span>Urea N46 (Premium)</span>
                        </div>
                        <span className="font-bold">60%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          <span>NPK Phonska</span>
                        </div>
                        <span className="font-bold">25%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                          <span>Organik Granul</span>
                        </div>
                        <span className="font-bold">15%</span>
                      </div>
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
          <div className="bg-white w-full max-w-md rounded-2xl border border-gray-200 shadow-xl overflow-hidden font-sans">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3B82F6] text-[20px]">verified_user</span>
                {lang === 'id' ? 'Masukkan Tanda Tangan' : 'Digital Signature Input'}
              </h3>
              <button onClick={() => setIsSignatureModalOpen(false)} className="text-slate-400 hover:text-[#0b1c30] transition-colors focus:outline-none bg-transparent border-none">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
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
            </div>

            <div className="p-4 bg-slate-50 border-t border-gray-100 flex gap-2 justify-end">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
