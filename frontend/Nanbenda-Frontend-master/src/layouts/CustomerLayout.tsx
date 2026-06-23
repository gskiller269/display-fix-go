import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Smartphone, MessageSquare, User, ClipboardList, Check, Sparkles } from 'lucide-react';
import { API_URL, BASE_URL } from '../api/api';
import ReviewModal from '../components/ReviewModal';

interface CustomerLayoutProps {
  user: any;
}

export default function CustomerLayout({ user }: CustomerLayoutProps) {
  const location = useLocation();
  const [unreviewedRepair, setUnreviewedRepair] = useState<any | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const checkPendingReviews = async () => {
      // Mocked to prevent 500 errors
      setUnreviewedRepair(null);
    };

    checkPendingReviews();
    const interval = setInterval(checkPendingReviews, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const getPageName = () => {
    const path = location.pathname;
    if (path.includes('/home')) return 'Home';
    if (path.includes('/book')) return 'Repairs';
    if (path.includes('/repairs')) return 'Repairs Tracking';
    if (path.includes('/support')) return 'Support';
    if (path.includes('/account')) return 'Account';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/addresses')) return 'Saved Addresses';
    if (path.includes('/notifications')) return 'Notification Settings';
    if (path.includes('/alert')) return 'Notification';
    return '';
  };

  const pageName = getPageName();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800 pb-28 overflow-x-hidden max-w-md mx-auto border-x border-slate-100 shadow-2xl relative">
      <header className="fixed top-0 pt-[15px] pb-[15px] left-1/2 -translate-x-1/2 max-w-md w-full z-[9999] px-4 py-2.5 bg-white border-b-2 border-[#004c4c] flex items-center justify-center select-none shadow-xs">
        <div className="flex items-center gap-2">
          {/* Custom Logo */}
          <div className="relative text-[#0284c7] flex items-center justify-center mr-1">
            <Smartphone className="w-[26px] h-[26px] stroke-[2]" />
            <Check className="w-5 h-5 absolute -right-2 -bottom-0.5 stroke-[4]" />
            <Sparkles className="w-3 h-3 absolute -right-2.5 -top-0.5" />
          </div>
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-base font-black text-[#004c4c] leading-tight text-center">
              Display Fix Go
            </h1>
            {pageName && (
              <span className="text-[10px] font-extrabold text-slate-500 leading-none mt-0.5 text-center">
                {pageName}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16 flex-1 overflow-x-hidden">
        <div className="scale-down-20">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full bg-white border-t border-slate-100 flex items-center justify-around z-[9999] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] px-2 py-3 pb-6 rounded-t-3xl">
        <NavLink to="/customer/home" className="flex flex-col items-center justify-center gap-1 transition-all duration-300 w-16">
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#004c4c] text-white shadow-sm scale-105' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}>
                <Home className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] ${isActive ? 'font-extrabold text-[#004c4c]' : 'font-bold text-slate-400'}`}>Home</span>
            </>
          )}
        </NavLink>
        <NavLink to="/customer/book" className="flex flex-col items-center justify-center gap-1 transition-all duration-300 w-16">
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#004c4c] text-white shadow-sm scale-105' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}>
                <Smartphone className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] ${isActive ? 'font-extrabold text-[#004c4c]' : 'font-bold text-slate-400'}`}>Repairs</span>
            </>
          )}
        </NavLink>
        <NavLink to="/customer/support" className="flex flex-col items-center justify-center gap-1 transition-all duration-300 w-16">
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#004c4c] text-white shadow-sm scale-105' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}>
                <MessageSquare className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] ${isActive ? 'font-extrabold text-[#004c4c]' : 'font-bold text-slate-400'}`}>Support</span>
            </>
          )}
        </NavLink>
        <NavLink to="/customer/account" className="flex flex-col items-center justify-center gap-1 transition-all duration-300 w-16">
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#004c4c] text-white shadow-sm scale-105' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}>
                <User className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] ${isActive ? 'font-extrabold text-[#004c4c]' : 'font-bold text-slate-400'}`}>Account</span>
            </>
          )}
        </NavLink>
      </nav>

      {unreviewedRepair && (
        <ReviewModal
          token={localStorage.getItem('token') || ''}
          repairId={unreviewedRepair.id}
          technicianId={unreviewedRepair.technician_id}
          deviceName={`${unreviewedRepair.device_brand} ${unreviewedRepair.device_model}`}
          onClose={() => setUnreviewedRepair(null)}
          onSuccess={() => {
            setUnreviewedRepair(null);
            // Refresh to trigger state updates in current views
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
