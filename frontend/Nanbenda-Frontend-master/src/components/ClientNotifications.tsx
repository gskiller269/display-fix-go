import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';

export default function ClientNotifications() {
  const navigate = useNavigate();

  return (
    <div className="flex-grow p-6 bg-[#f9f9fc] animate-fadeIn select-none pt-6 pb-28">
      {/* Back & Title */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate('/customer/account')}
          className="p-2 hover:bg-slate-200/50 rounded-full active:scale-95 transition-all text-slate-800"
        >
          <ArrowLeft className="h-6 w-6 text-slate-700" />
        </button>
        <h2 className="text-xl font-black text-slate-900">Notification Settings</h2>
      </div>

      <div className="space-y-4">
        {/* Toggle cards */}
        <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
          <div>
            <p className="font-extrabold text-slate-800 text-sm">SMS Doorstep Alerts</p>
            <p className="text-xs text-slate-400 mt-1">Receive technician arrival updates via mobile SMS</p>
          </div>
          <input 
            type="checkbox" 
            defaultChecked 
            className="text-[#004c4c] focus:ring-[#004c4c] rounded w-6 h-6 border-slate-200 accent-[#004c4c]" 
          />
        </div>

        <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
          <div>
            <p className="font-extrabold text-slate-800 text-sm">OLED Diagnostic Reports</p>
            <p className="text-xs text-slate-400 mt-1">Receive copies of electronic diagnostic pictures via email</p>
          </div>
          <input 
            type="checkbox" 
            defaultChecked 
            className="text-[#004c4c] focus:ring-[#004c4c] rounded w-6 h-6 border-slate-200 accent-[#004c4c]" 
          />
        </div>

        <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
          <div>
            <p className="font-extrabold text-slate-800 text-sm">Promotional Offers</p>
            <p className="text-xs text-slate-400 mt-1">Receive alerts on discount deals and repair offers</p>
          </div>
          <input 
            type="checkbox" 
            className="text-[#004c4c] focus:ring-[#004c4c] rounded w-6 h-6 border-slate-200 accent-[#004c4c]" 
          />
        </div>
      </div>
    </div>
  );
}
