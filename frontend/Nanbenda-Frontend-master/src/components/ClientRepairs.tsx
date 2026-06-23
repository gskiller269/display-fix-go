import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipboardList, X, ArrowLeft } from 'lucide-react';
import { fetchUserRepairs } from '../api/deviceApi';
import { API_URL, BASE_URL } from '../api/api';

interface ClientRepairsProps {
  token: string;
}

export default function ClientRepairs({ token }: ClientRepairsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Pending' | 'History'>(
    location.state?.tab || 'Active'
  );
  const [userRepairs, setUserRepairs] = useState<any[]>([]);

  const loadUserRepairs = () => {
    if (token) {
      fetchUserRepairs(token).then(data => {
        setUserRepairs(data);
      });
    }
  };

  // Poll for realtime updates every 3 seconds
  useEffect(() => {
    loadUserRepairs();
    const interval = setInterval(loadUserRepairs, 3000);
    return () => clearInterval(interval);
  }, [token]);

  const filteredRepairs = userRepairs.filter(ord => {
    const status = ord.status ? ord.status.toLowerCase() : '';
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return status === 'pending';
    if (activeTab === 'Active') return ['technician_assigned', 'on_the_way', 'reached', 'repaired', 'payment_done'].includes(status);
    if (activeTab === 'History') return status === 'completed';
    return false;
  });

  return (
    <div className="min-h-screen bg-[#f9f9fc] flex flex-col p-5 select-none pb-28 animate-fadeIn">
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-start">
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/customer/book')}
            className="mt-0.5 p-1.5 hover:bg-slate-200/50 rounded-full active:scale-95 transition-all text-slate-800 -ml-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-none">Repairs Tracking</h2>
            <p className="text-xs text-slate-500 mt-2">Real-time status updates of your doorstep bookings</p>
          </div>
        </div>
        <div className="bg-[#004c4c]/10 text-[#004c4c] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-0.5">
          Live
        </div>
      </div>

      {/* Tabs Header - Admin Style */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
        {(['All', 'Active', 'Pending', 'History'] as const).map((tab) => {
          const isActive = activeTab === tab;
          let count = 0;
          if (tab === 'All') count = userRepairs.length;
          else if (tab === 'Pending') count = userRepairs.filter(r => r.status === 'pending').length;
          else if (tab === 'Active') count = userRepairs.filter(r => ['technician_assigned', 'on_the_way', 'reached', 'repaired', 'payment_done'].includes(r.status)).length;
          else if (tab === 'History') count = userRepairs.filter(r => r.status === 'completed').length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-white text-[#004c4c] shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{tab}</span>
              <span className={`text-lg font-black leading-none mt-0.5 ${isActive ? 'text-[#004c4c]' : 'text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List Content */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {filteredRepairs.length > 0 ? (
          filteredRepairs.map((ord) => (
            <div 
              key={ord.id} 
              onClick={() => navigate(`/customer/repairs/${ord.id}`)}
              className="p-4 bg-white border border-slate-200/60 rounded-2xl shadow-xs relative flex flex-col gap-2 animate-scaleIn cursor-pointer hover:border-[#004c4c]/30 transition-all active:scale-[0.99]"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-[#004c4c] bg-[#E9F6F6] px-2 py-0.5 rounded-md uppercase">
                    REP: #{ord.id}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-2">{ord.device_brand} {ord.device_model}</h4>
                </div>
                <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  ord.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  ord.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  ord.status === 'payment_done' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                  'bg-blue-50 text-blue-600 border-blue-200'
                }`}>
                  {ord.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-tight">
                <span className="font-bold text-slate-600">Issue:</span> {ord.problem_type}
              </p>
              
              {ord.problem_description && (
                <p className="text-[11px] text-slate-400 italic">
                  "{ord.problem_description}"
                </p>
              )}

              {ord.image_url && (
                <div className="flex gap-2 mt-1 overflow-x-auto py-1">
                  {ord.image_url.split(',').map((imgUrl: string, index: number) => (
                    <img 
                      key={index}
                      src={imgUrl.startsWith('http') ? imgUrl : `${BASE_URL}${imgUrl}`} 
                      alt="Repair attachment" 
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200" 
                    />
                  ))}
                </div>
              )}

              <div className="h-[1px] bg-slate-100 my-1" />

              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Date: {ord.preferred_date ? new Date(ord.preferred_date).toLocaleDateString() : 'doorstep Service'}</span>
                {ord.eta && (
                  <span className="font-bold text-[#004c4c]">ETA: {ord.eta}</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 flex flex-col items-center gap-2 bg-white border border-slate-150 rounded-2xl shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ClipboardList className="h-6 w-6" />
            </div>
            <p className="text-xs text-slate-400 font-bold">No repairs in this category</p>
            <p className="text-[10px] text-slate-400">Submit a repair request from the main dashboard</p>
          </div>
        )}
      </div>
    </div>
  );
}
