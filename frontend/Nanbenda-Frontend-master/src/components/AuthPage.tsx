import React, { useState, useEffect } from 'react';
import { Smartphone, Lock, User, Mail, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { API_URL, BASE_URL, MSG91_WIDGET_ID, MSG91_TOKEN_AUTH } from '../api/api';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: any) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [identifier, setIdentifier] = useState<string>(''); // username or mobile
  const [password, setPassword] = useState<string>('');

  // Register state fields
  const [regUsername, setRegUsername] = useState<string>('');
  const [regMobile, setRegMobile] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regOtp, setRegOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isOtpSending, setIsOtpSending] = useState<boolean>(false);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [useMsg91, setUseMsg91] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const urls = [
      'https://verify.msg91.com/otp-provider.js',
      'https://verify.phone91.com/otp-provider.js'
    ];
    let i = 0;

    function initializeOtp() {
      const configuration = {
        widgetId: MSG91_WIDGET_ID,
        tokenAuth: MSG91_TOKEN_AUTH,
        exposeMethods: true,
        captchaRenderId: 'msg91-captcha',
        success: (data: any) => {
          console.log('MSG91 widget success response', data);
        },
        failure: (error: any) => {
          console.log('MSG91 widget failure reason', error);
        }
      };
      if (typeof (window as any).initSendOTP === 'function') {
        (window as any).initSendOTP(configuration);
      }
    }

    if (typeof (window as any).initSendOTP === 'function') {
      initializeOtp();
      return;
    }

    function attempt() {
      if (document.querySelector(`script[src="${urls[i]}"]`)) {
        return; // Already injected
      }
      const s = document.createElement('script');
      s.src = urls[i];
      s.async = true;
      s.onload = () => {
        initializeOtp();
      };
      s.onerror = () => {
        i++;
        if (i < urls.length) {
          attempt();
        }
      };
      document.head.appendChild(s);
    }

    attempt();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    // MOCK LOGIN TO BYPASS DATABASE REQUIREMENT
    setTimeout(() => {
      setLoading(false);
      let role = 'customer';
      if (identifier.toLowerCase().includes('admin')) role = 'admin';
      if (identifier.toLowerCase().includes('tech')) role = 'technician';
      
      const mockUser = {
        id: Math.floor(Math.random() * 1000),
        username: identifier,
        full_name: identifier,
        role: role,
        mobile_number: '9876543210'
      };
      
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      onAuthSuccess('mock_token_123', mockUser);
    }, 500);
  };

  const formatPhoneNumberMsg91 = (num: string) => {
    let cleaned = num.replace(/\D/g, ''); // Keep only digits
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned; // default to India code
    }
    return cleaned;
  };

  const fallbackSendOtp = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: regMobile })
      });
      const result = await response.json();
      setIsOtpSending(false);
      if (result.success) {
        setUseMsg91(false);
        setOtpSent(true);
        setOtpSuccess('OTP sent successfully (Local Service). Please check your messages.');
      } else {
        setErrorMsg(result.message || 'Failed to send OTP. Please check your mobile number.');
      }
    } catch (err) {
      console.error(err);
      setIsOtpSending(false);
      setErrorMsg('Network error sending OTP.');
    }
  };

  const handleSendOtp = async () => {
    if (!regMobile) {
      setErrorMsg('Please enter a mobile number to receive OTP.');
      return;
    }
    setIsOtpSending(true);
    setErrorMsg(null);
    setOtpSuccess(null);

    const formattedMobile = formatPhoneNumberMsg91(regMobile);

    let isResolved = false;
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        console.warn('MSG91 SendOTP timed out (5s), falling back to local backend OTP...');
        fallbackSendOtp();
      }
    }, 5000);

    if (typeof (window as any).sendOtp === 'function') {
      console.log('Attempting MSG91 SendOTP...');
      try {
        (window as any).sendOtp(
          formattedMobile,
          (data: any) => {
            if (isResolved) return;
            isResolved = true;
            clearTimeout(timeoutId);
            setIsOtpSending(false);
            setOtpSent(true);
            setUseMsg91(true);
            setOtpSuccess('OTP sent successfully via SMS. Please check your messages.');
            console.log('MSG91 send success:', data);
          },
          (error: any) => {
            if (isResolved) return;
            isResolved = true;
            clearTimeout(timeoutId);
            console.warn('MSG91 SendOTP failed, falling back to local backend OTP...', error);
            fallbackSendOtp();
          }
        );
      } catch (err) {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutId);
          console.warn('MSG91 SendOTP invocation threw an error, falling back...', err);
          fallbackSendOtp();
        }
      }
    } else {
      isResolved = true;
      clearTimeout(timeoutId);
      console.warn('MSG91 script not loaded, falling back to local backend OTP...');
      fallbackSendOtp();
    }
  };

  const completeRegistration = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          mobile_number: regMobile,
          email: regEmail || undefined,
          password: regPassword,
          role: 'customer' // Hardcoded to customer per requirements
        })
      });
      const result = await response.json();
      setLoading(false);

      if (result.success) {
        onAuthSuccess(result.data.token, result.data.user);
      } else {
        setErrorMsg(result.message || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrorMsg('Network error registering account.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regMobile || !regPassword) {
      setErrorMsg('Username, Mobile, and Password are required.');
      return;
    }
    if (!regOtp) {
      setErrorMsg('Please enter the OTP sent to your mobile number.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setOtpSuccess(null);

    try {
      await completeRegistration();
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrorMsg('Network error. Is the backend running?');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-5 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Sleek top brand header */}
        <div className="bg-gradient-to-br from-[#004c4c] to-[#0a6969] text-white px-6 py-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3">
              <ShieldCheck className="h-7 w-7 text-emerald-300" />
            </div>
            <h1 className="text-xl font-black tracking-tight">Display Fix Go</h1>
            <p className="text-xs text-teal-100 mt-1">Doorstep Expert Diagnostics & Repairs</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-100 select-none">
          <button
            onClick={() => { setIsLogin(true); setErrorMsg(null); }}
            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              isLogin ? 'text-[#004c4c] border-b-2 border-[#004c4c] bg-teal-50/10' : 'text-slate-400 bg-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorMsg(null); }}
            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              !isLogin ? 'text-[#004c4c] border-b-2 border-[#004c4c] bg-teal-50/10' : 'text-slate-400 bg-white'
            }`}
          >
            Register
          </button>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-xs font-semibold p-3.5 rounded-xl mb-4 border border-red-100 text-center animate-shake">
              {errorMsg}
            </div>
          )}

          {isLogin ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 ml-1">Username / Mobile</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter username or phone number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#004c4c] text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-md hover:bg-[#0a6969] mt-6 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Choose a username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 ml-1">Mobile Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="Enter mobile number"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 ml-1">OTP Verification</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Enter verification code"
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value)}
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 focus:bg-white transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isOtpSending}
                    className="px-4 h-12 bg-[#004c4c] text-white font-black rounded-2xl flex items-center justify-center text-xs uppercase tracking-wider active:scale-95 transition-all hover:bg-[#0a6969] disabled:bg-slate-300 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap min-w-[100px]"
                  >
                    {isOtpSending ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
                {otpSuccess && (
                  <div className="text-[11px] text-emerald-600 font-semibold ml-1 bg-emerald-50 border border-emerald-100 rounded-xl p-2 mt-1">
                    {otpSuccess}
                  </div>
                )}
                <div id="msg91-captcha" className="mt-2 flex justify-center"></div>
              </div>


              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 ml-1">Email (Optional)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Choose a strong password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#004c4c] text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-md hover:bg-[#0a6969] mt-6 cursor-pointer"
              >
                {loading ? 'Creating Account...' : 'Register'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          <div className="mt-6 flex justify-center items-center gap-1.5 text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
            <Sparkles className="h-4 w-4 text-amber-500" /> 100% SECURE DOORSTEP SERVICE
          </div>
        </div>
      </div>
    </div>
  );
}
