import React, { useState } from 'react';
import { TRANSLATIONS } from '../data';
import { SmartContract } from '../types';

interface ContractsScreenProps {
  lang: 'id' | 'en';
  contracts: SmartContract[];
  onAddContract: (contract: SmartContract) => void;
}

export default function ContractsScreen({ lang, contracts, onAddContract }: ContractsScreenProps) {
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const t = TRANSLATIONS[lang];

  // Filtering contracts based on search keyword
  const filteredContracts = contracts.filter(contract => {
    const query = searchQuery.toLowerCase();
    return (
      contract.id.toLowerCase().includes(query) ||
      contract.commodity.toLowerCase().includes(query) ||
      contract.firstParty.toLowerCase().includes(query) ||
      contract.secondParty.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in" id="contracts-view">
      {/* Top Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0b1c30] tracking-tight leading-tight">
            {lang === 'id' ? 'Ledger Kontrak Pintar Koperasi' : 'Cooperative Smart Contracts Ledger'}
          </h2>
          <p className="text-[#64748b] text-xs font-semibold mt-1">
            {lang === 'id' 
              ? 'Daftar seluruh perjanjian pengadaan bersama yang telah ditandatangani secara digital dan tercatat aman di Blockchain.' 
              : 'List of all joint procurement agreements signed digitally and securely persisted on the Blockchain.'}
          </p>
        </div>
        
        {/* Sync Status Badge */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2.5 rounded-xl shadow-sm self-start md:self-auto select-none">
          <span className="material-symbols-outlined text-[#3B82F6] animate-pulse font-bold">cloud_done</span>
          <div className="font-sans text-xs">
            <span className="text-gray-400 font-bold block uppercase text-[8px] tracking-wider font-mono">Ledger Node Status</span>
            <span className="font-extrabold text-[#0b1c30]">
              Online • {contracts.length} {lang === 'id' ? 'Kontrak Terverifikasi' : 'Contracts Verified'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and search controllers */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm/40">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] select-none">search</span>
          <input
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-xs focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all outline-none font-semibold text-[#0b1c30]"
            placeholder={lang === 'id' ? 'Cari kontrak (ID, komoditas, nama pihak)...' : 'Search contracts (ID, commodity, party)...'}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-[9px] text-[#3B82F6] font-mono font-black uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded border border-blue-100 select-none flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
          SHA-256 Ledger Active
        </div>
      </div>

      {/* Grid of Contracts */}
      {filteredContracts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center text-slate-400 font-semibold text-xs">
          {lang === 'id' ? 'Tidak ada kontrak pintar ditemukan.' : 'No smart contracts found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map((contract) => (
            <div key={contract.id} className="bg-white border border-gray-200 hover:border-[#3B82F6]/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between h-[230px] group">
              {/* Ribbon status indicator */}
              <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden select-none">
                <div className="absolute top-3 right-[-31px] bg-blue-100 text-blue-700 text-[8px] font-black font-mono tracking-widest text-center py-1 rotate-45 w-24 border-y border-blue-200 uppercase">
                  VERIFIED
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[9px] bg-slate-100 text-[#0b1c30] font-mono font-bold px-2 py-0.5 rounded w-fit block tracking-wider">
                  {contract.id}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[#0b1c30] line-clamp-1 group-hover:text-[#3B82F6] transition-colors">{contract.commodity}</h3>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5 font-mono">{contract.quantity} • {contract.price}</p>
                </div>

                <div className="pt-2 border-t border-gray-100/80 space-y-1.5 text-[11px] text-slate-600 font-semibold">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-gray-400">Total Nilai:</span>
                    <span className="font-extrabold text-blue-600">{contract.totalValue}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-xs">
                    <span className="text-gray-400">Pihak Kedua:</span>
                    <span className="font-extrabold text-[#0b1c30] truncate max-w-[150px]">{contract.secondParty}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-xs">
                    <span className="text-gray-400">Tanggal Sign:</span>
                    <span className="font-mono text-[9px] text-slate-500">{contract.signedAt.split(',')[0]}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedContract(contract)}
                className="mt-4 w-full h-10 bg-slate-50 hover:bg-[#3B82F6] hover:text-white border border-gray-200 hover:border-transparent text-[#0b1c30] rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 outline-none focus:outline-none"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                {lang === 'id' ? 'Lihat Detail & Hash' : 'View Detail & Hash'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Contract Detail modal dialog */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white w-full max-w-5xl rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col md:max-h-[90vh]">
            {/* Header control strip */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50 select-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 font-bold">gavel</span>
                <span className="font-serif italic text-sm text-slate-800 font-bold block">{lang === 'id' ? 'Arsip Dokumen Negara' : 'Official Sealed Document'}</span>
              </div>
              <button 
                onClick={() => setSelectedContract(null)} 
                className="text-slate-400 hover:text-[#0b1c30] transition-colors focus:outline-none bg-transparent border-none cursor-pointer"
              >
                <span className="material-symbols-outlined font-bold">close</span>
              </button>
            </div>

            {/* Content split grid (Paper style scrollable + tech summary) */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50/50">
              {/* Col 1: Elegant physical paper draft */}
              <div className="lg:col-span-8 bg-[#fbfcfa] border border-[#eddcb6] rounded-xl shadow-lg p-6 sm:p-10 text-[#2e2617] relative select-none leading-relaxed transition-all duration-300">
                {/* Stamp Seal Ribbion */}
                <div className="absolute top-6 right-6 w-24 h-24 border-4 border-dashed border-blue-600/70 rounded-full flex flex-col items-center justify-center rotate-12 select-none z-20 bg-white/40 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-blue-600 text-[18px] font-bold select-none fill-current animate-pulse">verified</span>
                  <span className="text-[8px] font-mono font-black text-blue-600 tracking-wider uppercase mt-1">SECURED</span>
                  <span className="text-[6px] font-mono font-bold text-blue-500 max-w-[70px] text-center uppercase tracking-normal mt-0.5">LEDGER SYNC APPROVED</span>
                </div>

                {/* Doc Title header */}
                <div className="border-b border-[#ebd8ab] pb-5 mb-5 text-center">
                  <span className="text-[9px] font-mono font-black tracking-widest text-[#8a7246] uppercase block mb-1">
                    {lang === 'id' ? 'SALINAN KONTRAK PINTAR DEPLOYED' : 'DEPLOYED SMART CONTRACT COPY'}
                  </span>
                  <h2 className="text-lg sm:text-xl font-serif font-black tracking-tight uppercase leading-snug" style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}>
                    {selectedContract.title}
                  </h2>
                  <p className="text-[#8a7246] font-mono text-[9px] mt-1.5 font-bold uppercase tracking-wider">
                    {t.docNumber}: {selectedContract.id}
                  </p>
                </div>

                {/* Doc Content paragraphs */}
                <div className="space-y-4 text-xs font-serif leading-relaxed text-[#3a3328]">
                  <p className="text-justify font-medium">
                    {lang === 'id' 
                      ? `Pada hari ini sesuai pencatatan blockchain ${selectedContract.signedAt}, kesepakatan kerjasama pengadaan berskala nasional sah dideklarasikan oleh para pihak dengan ketetapan komoditas sebagai berikut:`
                      : `On this day corresponding to the verified blockchain timestamp ${selectedContract.signedAt}, the collective procurement agreement is officially ratified by both parties with commodity provisions described below:`}
                  </p>

                  <div className="bg-[#f7f5ee] border border-[#ebd8ab] rounded-lg p-4 font-sans space-y-3 shadow-inner text-[#0b1c30]">
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-gray-400 font-bold block uppercase text-[8px] tracking-wider font-mono">{t.komoditas}:</span>
                        <span className="font-extrabold">{selectedContract.commodity}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold block uppercase text-[8px] tracking-wider font-mono">{t.kuantitasTotal}:</span>
                        <span className="font-extrabold">{selectedContract.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold block uppercase text-[8px] tracking-wider font-mono">{t.hargaSatuan}:</span>
                        <span className="font-extrabold text-blue-600">{selectedContract.price}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold block uppercase text-[8px] tracking-wider font-mono">{t.totalNilaiKontrak}:</span>
                        <span className="font-black text-blue-600">{selectedContract.totalValue}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#ebd8ab]/60 text-[11px]">
                      <span className="text-gray-400 font-bold block uppercase text-[8px] tracking-wider font-mono">{t.metodePengiriman}:</span>
                      <span className="font-extrabold">{selectedContract.deliveryMethod}</span>
                    </div>
                  </div>

                  <p className="text-justify font-sans text-[11px] leading-relaxed text-[#5c5443] bg-slate-50 p-3 rounded-lg border border-gray-100 font-medium">
                    <strong>{lang === 'id' ? 'Detail Deskripsi Perjanjian: ' : 'Agreement Description Detail: '}</strong>
                    {selectedContract.documentText}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#ebd8ab]/40">
                    <p className="text-[10px] text-justify leading-relaxed">
                      <strong>Pasal Keberlakuan:</strong> Dokumen ini dicatat aman pada hash ledger terenkripsi dan merepresentasikan kewajiban legal kedua belah pihak secara internasional maupun nasional.
                    </p>
                  </div>
                </div>

                {/* Sign panel */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#ebd8ab] font-sans text-center mt-6">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider">{t.pihakPertama}</span>
                    <div className="h-12 py-1.5 flex items-center justify-center">
                      <span className="font-serif italic font-extrabold text-[#8a7246] border-y border-[#8a7246]/50 px-2 select-none text-[13px]">
                        {selectedContract.firstParty}
                      </span>
                    </div>
                    <p className="font-bold text-[#0b1c30] text-[11px]">{selectedContract.firstParty}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5 leading-none">{selectedContract.firstPartyTitle}</p>
                  </div>
                  <div className="border-l border-[#ebd8ab]/60">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider">{t.pihakKedua}</span>
                    <div className="h-12 py-1.5 flex items-center justify-center">
                      <div className="text-center select-none leading-none flex flex-col justify-center items-center">
                        <span className="font-serif italic text-[11px] font-black text-blue-600 border border-blue-600/65 px-2 py-0.5 rounded rotate-[-2deg] max-w-[130px] overflow-hidden truncate">
                          {selectedContract.secondParty}
                        </span>
                        <span className="text-[7px] font-mono text-blue-600 font-bold block mt-1 tracking-tight">
                          VERIFIED BLOCK OK
                        </span>
                      </div>
                    </div>
                    <p className="font-bold text-[#0b1c30] text-[11px]">{selectedContract.secondParty}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5 leading-none">{selectedContract.secondPartyTitle}</p>
                  </div>
                </div>
              </div>

              {/* Col 2: Technical Blockchain attributes */}
              <div className="lg:col-span-4 space-y-6">
                {/* Hash Ledger Receipt */}
                <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md border border-slate-800 space-y-4 font-mono">
                  <h4 className="font-bold text-xs text-blue-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">token</span>
                    {t.blockchainLedgerHeader}
                  </h4>
                  
                  <div className="space-y-3.5 text-[10px]">
                    <div>
                      <span className="text-slate-400 block font-semibold">TRANSACTION HASH:</span>
                      <span className="text-blue-300 font-bold block overflow-y-auto max-h-16 break-all bg-black/40 p-2 rounded mt-1 border border-slate-800 select-all cursor-pointer" title="Double click to copy">
                        {selectedContract.hash}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-semibold">BLOCKCHAIN STATUS:</span>
                      <span className="inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40 font-bold mt-1 uppercase tracking-wider text-[8px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        CONFIRMED ON LEDGER
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-3 flex justify-between font-semibold">
                      <span className="text-slate-400">{t.protocolVersion}:</span>
                      <span className="text-white">SecureSHIELD v3.5</span>
                    </div>

                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Timestamp:</span>
                      <span className="text-white text-[9px]">{selectedContract.signedAt}</span>
                    </div>

                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Genesis ID:</span>
                      <span className="text-[#3B82F6]">0x07f4bb92911b</span>
                    </div>
                  </div>
                </div>

                {/* Audit verification badge */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                  <h4 className="font-bold text-xs text-[#0b1c30] uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1.5 font-sans">
                    <span className="material-symbols-outlined text-green-600 text-sm">enhanced_encryption</span>
                    Security Assurances
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 font-semibold font-sans">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-500 text-base font-bold">check</span>
                      <span>Enkripsi SSL 256-Bit</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-500 text-base font-bold">check</span>
                      <span>Keabsahan Hukum UU ITE</span>
                    </li>
                  </ul>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-semibold font-sans">
                    Dokumen ini terlindungi secara kriptografis dan tidak dapat diubah (immutable) setelah dieksekusi di ledger blockchain.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="p-4 bg-slate-50 border-t border-gray-100 flex gap-2 justify-end">
              <button 
                onClick={() => alert(lang === 'id' ? 'Menyiapkan proses cetak...' : 'Preparing printing process...')}
                className="px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 text-slate-700 rounded-lg font-bold text-xs transition-colors focus:outline-none flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-xs">print</span>
                {lang === 'id' ? 'Cetak PDF' : 'Print PDF'}
              </button>
              <button
                onClick={() => setSelectedContract(null)}
                className="px-5 py-2 bg-[#3B82F6] hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors focus:outline-none"
              >
                {lang === 'id' ? 'Selesai' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
