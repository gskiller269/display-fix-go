import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Shield, ClipboardList, Settings, LogOut, ChevronRight, Verified, X
} from 'lucide-react';

interface AdminAccountProps {
  token: string;
  user: any;
  onSignOut: () => void;
}

export default function AdminAccount({ token, user, onSignOut }: AdminAccountProps) {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState<boolean>(false);

  return (
    <div className="flex-grow p-6 bg-[#f9f9fc] animate-fadeIn select-none pt-6 pb-28">
      {/* Admin Account Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-none">Admin Account</h2>
          <p className="text-sm text-slate-500 mt-2.5">Manage your administrator profile and system settings</p>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2.5 hover:bg-slate-200/50 rounded-full active:scale-95 transition-all text-slate-800"
        >
          <Settings className="h-6 w-6 text-slate-600" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="flex gap-3.5 items-stretch mb-6">
        <div className="flex-grow bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#004c4c]/5 to-transparent pointer-events-none"></div>
          
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-500">
              <User className="h-7 w-7" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#004c4c] text-white p-0.5 rounded-full border border-white">
              <Shield className="h-3.5 w-3.5 text-emerald-300" />
            </div>
          </div>

          <div className="flex-grow min-w-0">
            <h3 className="text-sm font-black text-slate-900 truncate">{user?.full_name || user?.username || 'Admin'}</h3>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{user?.role?.toUpperCase() || 'ADMINISTRATOR'}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email || 'admin@displayfixgo.com'}</p>
          </div>
        </div>
      </div>

      {/* Menu List Selector */}
      <nav className="space-y-3.5 select-none">
        {/* Dashboard Shortcut */}
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 text-slate-600 p-2.5 rounded-lg group-hover:bg-[#004c4c] group-hover:text-white transition-colors">
              <Shield className="h-6 w-6" />
            </div>
            <div className="text-left font-sans">
              <p className="text-sm font-black text-slate-800 leading-none">Admin Dashboard</p>
              <p className="text-xs text-slate-400 mt-1.5 leading-none">View system overview and stats</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#004c4c] transition-all" />
        </button>

        {/* Profile info - Reusing ClientProfile if possible, or just a placeholder for now */}
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
              <p className="text-xs text-slate-400 mt-1.5 leading-none">Edit your administrator details</p>
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9990] overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-[#004c4c] uppercase tracking-wider">
                System Settings
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
                <p className="text-sm font-bold text-slate-800">Admin Panel Version</p>
                <p className="text-xs text-slate-500 mt-1">v2.4.1 Build 2026.05</p>
              </div>
              <p className="text-xs text-slate-400 text-center leading-relaxed">Administrator access for Display Fix Go doorstep electronics solutions management.</p>
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
