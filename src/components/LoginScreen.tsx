import React, { useState } from 'react';
import { User } from '../types';
import { TRANSLATIONS } from '../data';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  lang: 'id' | 'en';
  setLang: (lang: 'id' | 'en') => void;
}

export default function LoginScreen({ onLoginSuccess, lang, setLang }: LoginScreenProps) {
  const [email, setEmail] = useState('budi@koperasi.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const t = TRANSLATIONS[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate logging in as Budy Santoso
    onLoginSuccess({
      name: lang === 'id' ? 'Budi Santoso' : 'Budi Santoso',
      role: lang === 'id' ? 'Ketua Koperasi' : 'Cooperative Chairman',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-JfLwcBnjLPADNXE7w_78XNXdvEUZJw33ZlZkbuqQZJ8EGsu3AY-G1wix4E8lRcjBOUR_qgIT1h9410OY3xnH7NvJlyFM9sFQrOpS9WoE8yuj3U2ktwKJ74kwVkzKDa31zlWuzxqJDsSFP0LR-gFzL0USEuLHn5X_V4FV5t36bgiHPUKT07Sd0DDgOHzxnVcsAXTSBzm3IfKMyhIjVtjHDRz48rBSYi8euUVSU5uMAA8tF4PdJbZrWuzT9cnqURGYx9PxEC-epYSQ',
      cooperative: lang === 'id' ? 'Koperasi Tani Makmur' : 'Tani Makmur Cooperative'
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8f9ff] text-[#0b1c30] select-none" id="login-container">
      {/* Left Split: Image & Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-between p-12 overflow-hidden select-none">
        {/* Background Image Collage */}
        <img
          alt="Agro-Intelligence Polaroid Collage"
          className="absolute inset-0 w-full h-full object-cover opacity-90 select-none pointer-events-none"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZc40ZsQ2yw6nRVgTRjPaJatwYMEQS5gp3vJOJwfu-3ioc4Ut-WKrA6Imq7ZJ8je3qYo2BUVTGFA7lXeBwFuQsVcmMhUM7vXK2TXnlF2xMFPoJ9wi1B8kqmr52wEVJUBaXhDcLF2cjZO-dm5KT0KDDO0ALYT4OPSf3_tQF6EOWYgpZapgqgS2WmpNX4t0ol24w77HPTw-YCPkujGM0ajrBkkk3A_dWvkwmUnBV6n6B7ghGWyIr723oPNzQhr5nou1QAIWvu1VeEniq"
          referrerPolicy="no-referrer"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/15"></div>

        {/* Branding header over Image */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg shadow-sm border border-white/20 overflow-hidden">
              <img
                alt="VivaProcure Logo" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2QK5Q3PI1LNAhr9N_U8Qa9qUyzDiywjiqxO6WtXMwVlB8seuaa-MXG9ynm99G3sYnbV6JQfy9ZPLvBQKvkwZpfwYqBhABQiVLtIvXUSyvSMSRaO7bnDJrYk73rglpLetjqY3rFf4euk1KCvOf0FbuOGDBfPvLMWDsgp0iTAHlFA2gUhPsL0GBdljAd8Gs8a_A8H4Irm7MDufvPj6VB15n07CfY1sJQ4IswCseWnLB_UPlj2m5wQI2Jog2Bc5c6zAeQ36LArD9pSda"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="font-sans text-2xl font-black text-white tracking-tight uppercase">{t.brandTitle}</h1>
          </div>
        </div>

        {/* Bottom Title overlay over Image */}
        <div className="relative z-10 mt-auto">
          <h2 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tighter leading-[1.05] font-sans">
            Agro-<br />Intelligence
          </h2>
          <p className="text-lg lg:text-xl text-white/90 font-medium max-w-sm leading-relaxed mt-4 drop-shadow-md">
            {t.subTextBrand}
          </p>
        </div>
      </div>

      {/* Right Split: Login Area */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white min-h-screen">
        {/* Top Bar: Language Selector */}
        <div className="w-full flex justify-end p-8">
          <div className="flex items-center gap-2 text-sm font-semibold select-none">
            <button
              onClick={() => setLang('id')}
              className={`transition-colors p-1 ${lang === 'id' ? 'text-[#3B82F6] font-bold border-b-2 border-[#3B82F6]' : 'text-[#6b7280] hover:text-[#0b1c30]'}`}
            >
              ID
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setLang('en')}
              className={`transition-colors p-1 ${lang === 'en' ? 'text-[#3B82F6] font-bold border-b-2 border-[#3B82F6]' : 'text-[#6b7280] hover:text-[#0b1c30]'}`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="flex-1 w-full flex flex-col items-center justify-center px-8 sm:px-12 lg:px-24">
          <div className="w-full max-w-md">
            {/* Mobile Branding (Hidden on Desktop) */}
            <div className="lg:hidden flex flex-col items-start space-y-4 mb-8">
              <div className="inline-flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-black rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <img
                    alt="VivaProcure Logo" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2QK5Q3PI1LNAhr9N_U8Qa9qUyzDiywjiqxO6WtXMwVlB8seuaa-MXG9ynm99G3sYnbV6JQfy9ZPLvBQKvkwZpfwYqBhABQiVLtIvXUSyvSMSRaO7bnDJrYk73rglpLetjqY3rFf4euk1KCvOf0FbuOGDBfPvLMWDsgp0iTAHlFA2gUhPsL0GBdljAd8Gs8a_A8H4Irm7MDufvPj6VB15n07CfY1sJQ4IswCseWnLB_UPlj2m5wQI2Jog2Bc5c6zAeQ36LArD9pSda"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h1 className="text-xl font-black text-[#0b1c30] tracking-tight">{t.brandTitle}</h1>
              </div>
            </div>

            {/* Login Form Container Header */}
            <div className="mb-8 text-left">
              <h3 className="text-3xl font-bold text-[#0b1c30] tracking-tight">{t.welcomeBack}</h3>
              <p className="text-sm text-[#6b7280] mt-2 font-medium">{t.pleaseLogin}</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} id="login-form">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest" htmlFor="email-input">
                  {t.email}
                </label>
                <div className="relative flex items-center group border-b-2 border-gray-200 focus-within:border-[#3B82F6] transition-colors pb-1">
                  <span className="material-symbols-outlined absolute left-0 text-[#6b7280]/50 select-none">mail</span>
                  <input
                    id="email-input"
                    className="w-full pl-9 pr-4 py-2.5 bg-transparent border-none rounded-none text-base text-[#0b1c30] focus:ring-0 focus:outline-none placeholder:text-gray-300 font-medium"
                    placeholder="nama@koperasi.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest" htmlFor="password-input">
                    {t.password}
                  </label>
                  <a className="text-xs text-[#3B82F6] hover:text-[#1D4ED8] font-semibold transition-colors" href="#forgot" onClick={(e) => e.preventDefault()}>
                    {t.forgotPassword}
                  </a>
                </div>
                <div className="relative flex items-center group border-b-2 border-gray-200 focus-within:border-[#3B82F6] transition-colors pb-1">
                  <span className="material-symbols-outlined absolute left-0 text-[#6b7280]/50 select-none">lock</span>
                  <input
                    id="password-input"
                    className="w-full pl-9 pr-10 py-2.5 bg-transparent border-none rounded-none text-base text-[#0b1c30] focus:ring-0 focus:outline-none placeholder:text-gray-300 font-medium"
                    placeholder="••••••••"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-0 text-[#6b7280]/50 hover:text-[#0b1c30] transition-colors focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  id="remember-checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6]/20 transition-all cursor-pointer"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="text-sm font-medium text-[#6b7280] select-none cursor-pointer" htmlFor="remember-checkbox">
                  {t.rememberMe}
                </label>
              </div>

              {/* Login Button */}
              <button
                className="w-full py-4 mt-2 bg-[#3B82F6] text-white text-sm font-bold rounded-xl hover:bg-[#2563EB] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                type="submit"
                id="submit-login-btn"
              >
                {t.loginButton}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>

            {/* AI Insight Hint */}
            <div className="mt-8 p-4 bg-[#eff4ff] border border-gray-200/50 rounded-xl flex gap-3.5 items-start">
              <span className="material-symbols-outlined text-[#3B82F6] shrink-0 text-[20px] select-none fill-current">sparkles</span>
              <p className="text-xs leading-relaxed text-[#0b1c30]/80 font-medium">
                <span className="font-bold text-[#0b1c30]">{t.aiTip}</span> {t.aiTipLogin}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full py-8 px-8 sm:px-12 lg:px-24 flex flex-col xl:flex-row items-center justify-between text-xs font-medium text-[#6b7280] mt-auto border-t border-gray-100">
          <p className="mb-4 xl:mb-0">© 2026 VivaProcure Tech. Enterprise Agriculture Solutions.</p>
          <div className="flex gap-6 sm:gap-8 font-semibold uppercase tracking-wider">
            <a className="hover:text-[#0b1c30] transition-colors" href="#help" onClick={(e) => e.preventDefault()}>{t.bantuan}</a>
            <a className="hover:text-[#0b1c30] transition-colors" href="#terms" onClick={(e) => e.preventDefault()}>{lang === 'id' ? 'Syarat & Ketentuan' : 'Terms & Conditions'}</a>
            <a className="hover:text-[#0b1c30] transition-colors" href="#privacy" onClick={(e) => e.preventDefault()}>{lang === 'id' ? 'Privasi' : 'Privacy'}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
