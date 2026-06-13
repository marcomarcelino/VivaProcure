import React from 'react';
import { User, SupplierHealth, ProcurementLog } from '../types';
import { INITIAL_SUPPLIER_HEALTHS, INITIAL_PROCUREMENT_LOGS, TRANSLATIONS } from '../data';

interface DashboardScreenProps {
  user: User;
  lang: 'id' | 'en';
  onNavigateToTab: (tab: string, state?: any) => void;
  supplierHealths: SupplierHealth[];
}

export default function DashboardScreen({ user, lang, onNavigateToTab, supplierHealths }: DashboardScreenProps) {
  const t = TRANSLATIONS[lang];

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
              <h3 className="text-3xl font-extrabold text-rose-600 mt-2 tracking-tight">08 SKU</h3>
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
            onClick={() => onNavigateToTab('detail', { step: 'bidding' })}
            className="mt-4 text-[#3B82F6] text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer focus:outline-none w-fit"
          >
            {t.viewAnalysis}
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Active sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#0b1c30]">{t.activeSessions}</h3>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Card 1: Urea session */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all duration-300">
            {/* Status bar left */}
            <div className="w-full md:w-1.5 h-1.5 md:h-auto bg-amber-500"></div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-base text-[#0d1527]">Pupuk Urea - Jun 2026</h4>
                    <p className="text-[#64748b] text-xs mt-0.5">ID: PB-2026-0042</p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    NEGOTIATING
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">corporate_fare</span>
                    <div>
                      <p className="text-[10px] text-[#64748b] uppercase tracking-wide font-medium leading-none">{t.partisipan}</p>
                      <p className="font-bold text-xs text-[#0f172a] mt-1">3 Koperasi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">scale</span>
                    <div>
                      <p className="text-[10px] text-[#64748b] uppercase tracking-wide font-medium leading-none">{t.totalVolume}</p>
                      <p className="font-bold text-xs text-[#0f172a] mt-1">250 Ton</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    alt="Cooperative avatar" 
                    className="w-7 h-7 rounded-full border-2 border-white object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBavr-ioVpbMjlsSoSmLbYZMi5c3qhm6ANuZtkHxL6JPEVtsHUiSt3WcoxHmgAW8IrFHLmIrKmtuIALYBd-Z5B1pLnCepvBiRidgCJVZ7Yhp_YWVkdWkDgySEaxEwu0orhBGrcs4QAw_SAi_phCu6M_qK0mXmFNheeaEipqXwkQo-iVGROir_nC7A9o-pfgfxcHB4C8OP-mNZbVWQ_g11bEeMivZl97tx0--I0iFhPVb93in1gk44EneDYE62xBabAftEvlLOb64DvX"
                    referrerPolicy="no-referrer"
                  />
                  <img
                    alt="Cooperative avatar 2" 
                    className="w-7 h-7 rounded-full border-2 border-white object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuGYGrvONT812oostw41O-2JFaaaQncdcabxcoH7RAenjMFSrYeO0PtWu9B3EPv73iK29ULBcZsr-xR9trYTFupWwDdzdqgcFJ-y34RZ5fl_tqtCU-LH8DDNiqH1Jj1KSYRA8tRiP9zSNJR5mVyrZKDtpKQd7pTZB5N04UWknYsW7_yO9nkBxI-g4ZbC3bnVlRB4sMmJVPnrE1DefhU2t1AYA5li_sMtWEK8kl5vN8gKbfI4ZSg1osK_BEfoHdSTz6sSLE2GCyC5ku"
                    referrerPolicy="no-referrer"
                  />
                  <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500">+1</div>
                </div>
                <button
                  onClick={() => onNavigateToTab('detail', { step: 'bidding' })}
                  className="text-[#3B82F6] font-bold text-xs border border-blue-500/50 px-3.5 py-1.5 rounded-lg hover:bg-[#3B82F6]/5 active:scale-95 transition-all focus:outline-none"
                >
                  {t.pantauSesi}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: NPK session */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all duration-300">
            {/* Status bar left */}
            <div className="w-full md:w-1.5 h-1.5 md:h-auto bg-[#3B82F6]"></div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-base text-[#0d1527]">Pupuk NPK - Jun 2026</h4>
                    <p className="text-[#64748b] text-xs mt-0.5">ID: PB-2026-0051</p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    COLLECTING
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">corporate_fare</span>
                    <div>
                      <p className="text-[10px] text-[#64748b] uppercase tracking-wide font-medium leading-none">{t.partisipan}</p>
                      <p className="font-bold text-xs text-[#0f172a] mt-1">2 Koperasi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">scale</span>
                    <div>
                      <p className="text-[10px] text-[#64748b] uppercase tracking-wide font-medium leading-none">{t.totalVolume}</p>
                      <p className="font-bold text-xs text-[#0f172a] mt-1">180 Ton</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar info */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] mb-1 font-medium">
                    <span className="text-[#64748b]">{t.targetVolume}</span>
                    <span className="font-bold text-slate-800">180 / 200 Ton</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3B82F6] rounded-full transition-all duration-500" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => alert(lang === 'id' ? 'Permintaan pengajuan penambahan kuota berhasil dikirim.' : 'Quota increase proposal submitted successfully.')}
                  className="bg-[#3B82F6] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all focus:outline-none"
                >
                  {t.tambahKuota}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
