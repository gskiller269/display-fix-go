import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, BASE_URL } from '../api/api';
import { 
  User, MapPin, ClipboardList, Bell, HelpCircle, 
  Settings, LogOut, ChevronRight, X, Wrench
} from 'lucide-react';

interface ClientAccountProps {
  token: string;
  user: any;
  onSignOut: () => void;
}

export default function ClientAccount({ token, user, onSignOut }: ClientAccountProps) {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState<boolean>(false);

  return (
    <div className="flex-grow p-6 bg-[#f9f9fc] animate-fadeIn select-none pt-6 pb-28">
      {/* My Account Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-none">My Account</h2>
          <p className="text-sm text-slate-500 mt-2.5">Manage your account and doorstep settings</p>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2.5 hover:bg-slate-200/50 rounded-full active:scale-95 transition-all text-slate-800"
        >
          <Settings className="h-6 w-6 text-slate-600" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center gap-4 relative overflow-hidden group mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#004c4c]/5 to-transparent pointer-events-none"></div>

        <div className="flex-grow min-w-0">
          <h3 className="text-base font-black text-slate-900 truncate">{user?.full_name || user?.username || 'Sa'}</h3>
          <p className="text-xs text-slate-555 text-slate-500 font-medium truncate mt-0.5">{user?.mobile_number || '8976454565'}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-350" />
      </div>

      {/* Track Active Repairs Card */}
      <button 
        onClick={() => navigate('/customer/repairs')}
        className="w-full bg-[#004c4c] hover:bg-[#003d3d] text-white p-5 rounded-3xl shadow-md active:scale-98 transition-all flex items-center justify-between gap-4 mb-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white">
            <Wrench className="h-7 w-7" />
          </div>
          <div>
            <h4 className="text-base font-black text-white leading-tight">Track Active Repairs</h4>
            <p className="text-[11px] font-bold text-white/70 mt-1 uppercase tracking-wider">
              Check status and estimated completion
            </p>
          </div>
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all text-white">
          <ChevronRight className="h-6 w-6 stroke-[3]" />
        </div>
      </button>

      {/* Menu List Selector */}
      <nav className="space-y-3.5 select-none">
        {/* Profile info */}
        <button 
          onClick={() => navigate('/customer/profile')}
          className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 text-slate-600 p-2.5 rounded-lg group-hover:bg-[#004c4c] group-hover:text-white transition-colors">
              <User className="h-6 w-6" />
            </div>
            <div className="text-left font-sans">
              <p className="text-sm font-black text-slate-800 leading-none">Profile Information</p>
              <p className="text-xs text-slate-450 text-slate-400 mt-1.5 leading-none">View and verify your profile details</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#004c4c] transition-all" />
        </button>

        {/* Addresses */}
        <button 
          onClick={() => navigate('/customer/addresses')}
          className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 text-slate-600 p-2.5 rounded-lg group-hover:bg-[#004c4c] group-hover:text-white transition-colors">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-slate-800 leading-none">Addresses</p>
              <p className="text-xs text-slate-450 text-slate-400 mt-1.5 leading-none font-medium">Manage your saved doorstep locations</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#004c4c] transition-all" />
        </button>

        {/* Notifications */}
        <button 
          onClick={() => navigate('/customer/notifications')}
          className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 text-slate-600 p-2.5 rounded-lg group-hover:bg-[#004c4c] group-hover:text-white transition-colors">
              <Bell className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-slate-800 leading-none">Notifications</p>
              <p className="text-xs text-slate-450 text-slate-400 mt-1.5 leading-none font-medium">Manage notifications and SMS preferences</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#004c4c] transition-all" />
        </button>

        {/* Help & Support */}
        <button 
          onClick={() => navigate('/customer/support')}
          className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 text-slate-600 p-2.5 rounded-lg group-hover:bg-[#004c4c] group-hover:text-white transition-colors">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-slate-800 leading-none">Help &amp; Support</p>
              <p className="text-xs text-slate-450 text-slate-400 mt-1.5 leading-none font-medium">FAQs and technical helpline support</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#004c4c] transition-all" />
        </button>
      </nav>

      {/* Sign Out Button */}
      <div className="mt-8">
        <button 
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2.5 py-4.5 rounded-xl border-2 border-red-100 text-red-500 font-extrabold text-sm bg-red-5/20 hover:bg-red-50 hover:border-red-200 active:scale-98 transition-all"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>

      {/* Settings Modal (Inline overlay for version checking) */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9990] overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-[#004c4c] uppercase tracking-wider">
                App Settings
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-sm font-bold text-slate-800">Display Fix Go portal version</p>
                <p className="text-xs text-slate-555 text-slate-500 mt-1">v2.4.1 Stable Build Release</p>
              </div>
              <p className="text-xs text-slate-400 text-center leading-relaxed">Certified doorstep electronics solutions matches users with premium repair technicians securely.</p>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-transform active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
