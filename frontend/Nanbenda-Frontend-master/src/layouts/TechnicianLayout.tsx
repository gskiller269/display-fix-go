import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, User, ShieldCheck, Power } from 'lucide-react';
import { API_URL, BASE_URL } from '../api/api';

interface TechnicianLayoutProps {
  user: any;
  onSignOut: () => void;
}

export default function TechnicianLayout({ user: initialUser, onSignOut }: TechnicianLayoutProps) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = React.useState(false);
  const [user, setUser] = useState(initialUser);
  const [statusLoading, setStatusLoading] = useState(false);

  const toggleStatus = async () => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    setStatusLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await response.json();
      if (data.success) {
        setUser({ ...user, status: nextStatus });
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating status');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-800 flex flex-col font-sans text-slate-100 overflow-y-auto relative pb-20">
      <header className="relative w-full z-[50] px-5 py-4 bg-transparent flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-black tracking-tighter text-slate-950 leading-none">Display Fix Go <span className="text-amber-950">Expert</span></h1>
          
          <div className="mt-2.5 flex items-center gap-2">
            <button 
              onClick={toggleStatus}
              disabled={statusLoading}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${user.status === 'active' ? 'bg-emerald-600' : 'bg-amber-700'} flex items-center p-1`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${user.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className={`text-[9px] font-black uppercase tracking-widest ${user.status === 'active' ? 'text-emerald-950' : 'text-amber-950'}`}>
              {user.status === 'active' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
 
        <button 
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-3 bg-amber-950/10 p-1.5 pr-4 rounded-2xl border border-amber-950/20 shadow-sm active:scale-95 transition-all"
        >
          <img
            src={user?.profile_image_url ? (user.profile_image_url.startsWith('http') ? user.profile_image_url : `${BASE_URL}${user.profile_image_url}`) : "https://lh3.googleusercontent.com/aida-public/AB6AXuAH_TyaVDmy-a7Z_ZWN_ODDeFHAUPEgTfBdUBY5DGR12vtO43KQ5q9V213cv9qSifDL6K9GVDtH3qRpX3HZpJWqxP1wcLRRjjmciHZTCx7m88JnAp8exzurfQPAtDk50JEUB6VVYLRZF7L6XlTOY5DM-6X5KcKgQKpMsNQ70aWaKiFpq_Iw-Ffk8UpxLAIS6c-KcMtnfCtwN2RbKkTcMhUEWc3ydpQ0vYJXFJvz-j2hAwEyhJLsJ_Jq78GE4PneOLJPcWYLBwFLMCmH"}
            alt="Profile"
            className="w-10 h-10 rounded-xl object-cover border-2 border-amber-950/20 shadow-xs"
          />
          <div className="text-left">
            <p className="text-[10px] font-black text-amber-950 leading-none">Hello,</p>
            <p className="text-xs font-black text-slate-900 mt-1">{user?.full_name || user?.username || 'Expert'}</p>
          </div>
        </button>
      </header>
 
      {/* Main Content Area */}
      <main className="flex-1 px-6 pt-2">
        <Outlet />
      </main>

      {/* Profile Detail Overlay */}
      {showProfile && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/80 backdrop-blur-sm animate-fadeIn p-6 flex flex-col">
          <div className="bg-slate-800 rounded-3xl p-6 shadow-2xl animate-slideUp border border-slate-700 flex flex-col flex-1 overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={user?.profile_image_url ? (user.profile_image_url.startsWith('http') ? user.profile_image_url : `${BASE_URL}${user.profile_image_url}`) : "https://lh3.googleusercontent.com/aida-public/AB6AXuAH_TyaVDmy-a7Z_ZWN_ODDeFHAUPEgTfBdUBY5DGR12vtO43KQ5q9V213cv9qSifDL6K9GVDtH3qRpX3HZpJWqxP1wcLRRjjmciHZTCx7m88JnAp8exzurfQPAtDk50JEUB6VVYLRZF7L6XlTOY5DM-6X5KcKgQKpMsNQ70aWaKiFpq_Iw-Ffk8UpxLAIS6c-KcMtnfCtwN2RbKkTcMhUEWc3ydpQ0vYJXFJvz-j2hAwEyhJLsJ_Jq78GE4PneOLJPcWYLBwFLMCmH"}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-amber-900/30 shadow-sm"
                />
                <div>
                  <h2 className="text-lg font-black text-white">{user?.full_name}</h2>
                  <p className="text-xs font-bold text-slate-400">@{user?.username}</p>
                  <p className="text-[10px] font-black bg-amber-900/50 text-amber-400 border border-amber-900/50 px-2 py-0.5 rounded mt-2 w-fit uppercase tracking-tighter">Verified Technician</p>
                </div>
              </div>
              <button onClick={() => setShowProfile(false)} className="p-2 bg-slate-700 rounded-full text-slate-300 hover:bg-slate-600 transition-colors">
                <Power className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-8">
              <div className="flex flex-col gap-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mobile Contact</p>
                <p className="text-sm font-bold text-slate-200">{user?.mobile_number}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-sm font-bold text-slate-200">{user?.email || 'Not provided'}</p>
              </div>
              
              <div className="pt-4 border-t border-slate-700">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified Documents
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 flex flex-col items-center gap-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Aadhar Card</p>
                    {user?.aadhar_image_url ? (
                      <img 
                        src={user.aadhar_image_url.startsWith('http') ? user.aadhar_image_url : `${BASE_URL}${user.aadhar_image_url}`} 
                        className="w-full aspect-video object-cover rounded-lg" 
                        alt="Aadhar"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center"><User className="h-5 w-5 text-slate-500" /></div>
                    )}
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 flex flex-col items-center gap-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Driving License</p>
                    {user?.license_image_url ? (
                      <img 
                        src={user.license_image_url.startsWith('http') ? user.license_image_url : `${BASE_URL}${user.license_image_url}`} 
                        className="w-full aspect-video object-cover rounded-lg" 
                        alt="License"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center"><User className="h-5 w-5 text-slate-500" /></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={onSignOut}
              className="w-full py-4 bg-red-500/10 text-red-400 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all border border-red-500/20 hover:bg-red-500/20"
            >
              <LogOut className="h-5 w-5" /> Sign Out from Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
