import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ArrowRight, ClipboardList, ShieldCheck, Zap, Award, Star, Shield, Check } from 'lucide-react';

export default function RepairsHub() {
  const navigate = useNavigate();

  return (
    <div className="flex-grow flex flex-col p-6 bg-[#fdfdfd] animate-fadeIn select-none gap-8 pb-24">
      {/* Header section */}
      <header className="text-center space-y-3 mt-4">
        <div className="w-16 h-16 bg-blue-50/80 rounded-full flex items-center justify-center text-blue-500 mx-auto shadow-sm ring-4 ring-blue-50/30">
          <Smartphone className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#1e293b] tracking-tight">Repairs Hub</h1>
          <p className="text-sm text-slate-500 font-medium max-w-[260px] mx-auto mt-2 leading-relaxed">
            Book a new doorstep repair service or track your active repair orders.
          </p>
        </div>
      </header>

      {/* Main Action Buttons */}
      <div className="w-full space-y-5 max-w-md mx-auto">
        {/* Repair Now Button Card */}
        <button
          onClick={() => {
            navigate('/customer/book/wizard?step=1');
          }}
          className="w-full p-5 bg-white border border-slate-100 hover:border-blue-100 rounded-3xl text-left transition-all active:scale-[0.98] flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50/80 rounded-2xl flex items-center justify-center text-blue-500">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Repair Now</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Book new doorstep service</p>
            </div>
          </div>
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
            <ArrowRight className="h-4 w-4" />
          </div>
        </button>

        {/* My Repairs Button Card */}
        <button
          onClick={() => navigate('/customer/repairs')}
          className="w-full p-5 bg-white border border-slate-100 hover:border-emerald-100 rounded-3xl text-left transition-all active:scale-[0.98] flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">My Repairs</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Track your active bookings</p>
            </div>
          </div>
          <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
            <ArrowRight className="h-4 w-4" />
          </div>
        </button>
      </div>

      {/* Certified Expert Technicians Banner */}
      <div className="w-full max-w-md mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 bg-white">
          <img
            alt="Certified Expert Technicians"
            className="absolute inset-y-0 right-0 h-full w-[65%] object-cover z-0 object-right opacity-90"
            referrerPolicy="no-referrer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXJtb5sFDw-KgWia99JxAJqJ_ZS4c6al4Giee52yMoymWRxyCPrkMivgAfsT_SkBC2hCD9ap7RulUXODObjfMvYnUR3rr-EcGbkj4hSXmwSMnuGY2v8OwBtVR7No7tKjtZhm1p_0NroBa-VNPW8XXWou0jSfJ4pXLY1leTzHqjUvq7Lf7uwaGdgU-Wh2yNjUOnK_PrtcJnhIs8gzVuLoM6dXITIUOi-R3Qn0kGRI5g9Cew7IjJBVqvG5qjnEDDGIu0_dc8ZP8e3PW6"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent z-10" />

          <div className="relative z-20 p-6 flex flex-col justify-center w-[75%]">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-600 text-[10px] font-black uppercase tracking-wider">Verified & Certified</span>
            </div>
            <h3 className="text-slate-900 text-base font-black leading-tight mb-2">Certified Expert Technicians</h3>
            <p className="text-slate-500 text-[10px] font-medium leading-relaxed max-w-[90%]">
              Our professionals are trained, background-verified, and skilled in all major device brands.
            </p>
          </div>

          <div className="absolute top-4 right-4 z-20 text-center flex flex-col items-center">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Trusted By</span>
            <span className="text-[11px] font-black text-slate-800 leading-none">Crore+</span>
            <span className="text-[8px] font-bold text-slate-500 mb-1">Customers</span>
            <div className="flex gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-current" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges - Merged single card with separators */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">

          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 mb-3 bg-blue-50/50 rounded-full flex items-center justify-center text-blue-500 relative">
              <Shield className="w-5 h-5 absolute" />
              <Check className="w-2.5 h-2.5 absolute mt-0.5" strokeWidth={4} />
            </div>
            <p className="text-[11px] font-black text-slate-700">No Fix No Fee</p>
          </div>

          <div className="w-[1px] h-12 bg-slate-100 mx-2" />

          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 mb-3 bg-blue-50/50 rounded-full flex items-center justify-center text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-black text-slate-700">45 Min Arrival</p>
          </div>

          <div className="w-[1px] h-12 bg-slate-100 mx-2" />

          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 mb-3 bg-emerald-50/50 rounded-full flex items-center justify-center text-emerald-500">
              <Award className="w-5 h-5" />
            </div>
            {/* Replaced 90-Day Warranty with Genuine Parts as per previous user request */}
            <p className="text-[11px] font-black text-slate-700">Genuine Parts</p>
          </div>

        </div>
      </div>
    </div>
  );
}
