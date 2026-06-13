import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { TRANSLATIONS } from '../data';

interface AsistenAIScreenProps {
  lang: 'id' | 'en';
}

export default function AsistenAIScreen({ lang }: AsistenAIScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const t = TRANSLATIONS[lang];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message from VivaAI
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-message',
        sender: 'ai',
        text: lang === 'id' 
          ? 'Halo Budi S.! Saya asisten VivaAI milik koperasi Anda. Saya dapat menganalisis penawaran harga, status stok, tren cuaca mitigasi risiko logistik, atau mempersiapkan draf restock otomatis ke supplier utama. Ajukan pertanyaan Anda sekarang.'
          : 'Hello Budi S.! I am VivaAI, your cooperative procurement intelligence. Ask me about crop price comparison, supply warnings, weather mitigations, or generate draft replenishment contracts automatically.',
        timestamp: new Date(),
        chips: lang === 'id' 
          ? ['Bandingkan Harga Urea', 'Cek Stok Gudang', 'Bagaimana Cuaca Jawa Tengah?']
          : ['Compare Urea Prices', 'Check Stock Levels', 'What is Central Java weather?']
      }
    ]);
  }, [lang]);

  // Auto-scroll chat to latest messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      // API request to server-side Gemini Proxy endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ sender: m.sender, text: m.text })),
          lang
        })
      });

      if (!response.ok) {
        throw new Error('API server issue');
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `ai-msg-${Date.now()}`,
        sender: 'ai',
        text: data.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      // Fail gracefully with a helpful offline-powered AI fallback message
      const fallbackMsg: ChatMessage = {
        id: `ai-msg-fallback-${Date.now()}`,
        sender: 'ai',
        text: lang === 'id'
          ? 'Mohon maaf, koneksi API sedang terputus atau backend server sedang dimuat. Namun berdasarkan database lokal: Pupuk Urea sedang limit kritis (450/1000 Ton di Koperasi Tani Makmur). Disarankan melakukan otorisasi sesi pengadaan #PRC-2024-089 segera.'
          : 'Apologies, the live API endpoint is loading. According to local state: Urea Fertilizer stock levels are critical (450/1000 Tons at Tani Makmur Coop). Replenishment of session #PRC-2024-089 is recommended.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const onChipClick = (chip: string) => {
    handleSendMessage(chip);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto pb-12 animate-fade-in" id="ai-assistant-workspace">
      {/* Left panel: Weather Warnings & Price Logs sidebar */}
      <div className="w-full xl:w-4/12 space-y-6">
        {/* Weather Alert Widget widget */}
        <div className="bg-gradient-to-br from-amber-500/10 via-white to-white border border-amber-500/20 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-amber-700">
            <span className="material-symbols-outlined font-bold select-none text-[20px] fill-current">weather_mix</span>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider">{t.weatherAlert}</span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-semibold">
            {t.weatherAlertDesc}
          </p>
          <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-mono font-bold text-amber-700">
            <span>{lang === 'id' ? 'Tingkat Risiko: Sedang' : 'Risk Factor: Medium'}</span>
            <span className="px-2 py-0.5 bg-amber-100 rounded">Alert A2</span>
          </div>
        </div>

        {/* Map Routing mockup widget */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-[#0b1c30]">
            <span className="material-symbols-outlined text-[20px]">map</span>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider">{t.logistikJateng}</span>
          </div>

          {/* Interactive visual node map design */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-3 relative overflow-hidden select-none">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400"></div>
            <div className="space-y-2 text-[11px] text-slate-800 font-semibold font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>FOB Semarang (Port)</span>
              </div>
              <div className="w-0.5 h-3.5 bg-gray-300 ml-1"></div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Hub Logistik Jateng A-2 (Pending)</span>
              </div>
              <div className="w-0.5 h-3.5 bg-gray-300 ml-1"></div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>Koperasi Tani Makmur (Target)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Market trend prices (Screen 7 sidebar) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">{t.marketTrend}</span>
            <span className="text-[10px] text-blue-600 font-bold">Urea (Bulk)</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">Surabaya (FOB)</span>
              <span className="text-[#0b1c30]">Rp 6.450 / Kg</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">Semarang (FOB)</span>
              <span className="text-[#0b1c30]">Rp 6.550 / Kg</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">Jakarta (FOB)</span>
              <span className="text-[#0b1c30]">Rp 6.700 / Kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Chat dialogue window */}
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden min-h-[500px]">
        {/* Tab top info */}
        <div className="p-4 border-b border-gray-100 bg-[#f8f9ff]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold font-mono">
              <span className="material-symbols-outlined font-bold select-none text-[22px] fill-current">auto_awesome</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0b1c30] tracking-tight">{t.assistantTitle}</h3>
              <p className="text-[10px] text-gray-400 font-medium">{t.assistantSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono tracking-wider bg-blue-50 text-blue-700 uppercase border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
              Live Agent
            </span>
          </div>
        </div>

        {/* Message bubble fields */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[380px] min-h-[250px] bg-slate-50/20">
          {messages.map((m: ChatMessage) => (
            <div className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`} key={m.id}>
              {/* Profile Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center block shrink-0 ${
                m.sender === 'ai' ? 'bg-[#3B82F6]/10 text-[#3B82F6] font-mono' : 'bg-slate-200 text-slate-700'
              }`}>
                {m.sender === 'ai' ? (
                  <span className="material-symbols-outlined text-[16px] font-bold select-none">robot_2</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px] font-bold select-none">person</span>
                )}
              </div>

              {/* Message text container */}
              <div className="space-y-2">
                <div className={`rounded-2xl p-4 text-xs leading-relaxed font-semibold ${
                  m.sender === 'user' ? 'bg-[#3B82F6] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-[#0b1c30] rounded-tl-none shadow-sm'
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>

                {/* Sub-action chips list from AI */}
                {m.sender === 'ai' && m.chips && m.chips.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {m.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => onChipClick(chip)}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:border-[#3B82F6] rounded-full text-[10px] font-bold text-[#3B82F6] hover:bg-[#3B82F6]/5 transition-all outline-none focus:outline-none"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center shrink-0 font-mono">
                <span className="material-symbols-outlined text-[16px] font-bold animate-spin">progress_activity</span>
              </div>
              <div className="rounded-2xl px-4 py-3 bg-white border border-gray-100 text-slate-400 text-xs shadow-sm font-semibold italic">
                {lang === 'id' ? 'VivaAI sedang menganalisis...' : 'VivaAI is thinking...'}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area controls */}
        <div className="p-4 border-t border-gray-100 bg-[#f8f9ff]/30 space-y-3">
          {/* Action Chips */}
          <div className="flex gap-2 items-center flex-wrap">
            <button
              onClick={() => alert('PDF report draft triggered.')}
              className="px-3 py-1 border border-gray-200 hover:border-blue-600 bg-white rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 focus:outline-none transition-colors"
            >
              <span className="material-symbols-outlined text-xs">picture_as_pdf</span>
              {t.createReport}
            </button>
            <button
              onClick={() => {
                alert(lang === 'id' ? 'Notifikasi pengingat dikirim ke WA Pemasok.' : 'WhatsApp supplier remainder sent.');
                handleSendMessage(lang === 'id' ? 'Tulis pengingat WhatsApp ke PT Pupuk AgriNusa' : 'Draft WhatsApp remainder to PT Pupuk AgriNusa');
              }}
              className="px-3 py-1 border border-gray-200 hover:border-blue-600 bg-white rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 focus:outline-none transition-colors"
            >
              <span className="material-symbols-outlined text-xs">notifications_active</span>
              {t.remindSupplier}
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              className="flex-1 h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all outline-none"
              placeholder={t.typePlaceholder}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="w-12 h-12 rounded-xl bg-[#3B82F6] text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all focus:outline-none shrink-0"
            >
              <span className="material-symbols-outlined font-bold text-[20px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
