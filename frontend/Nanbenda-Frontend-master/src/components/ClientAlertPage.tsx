import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

export default function ClientAlertPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const message = queryParams.get('message') || location.state?.message || 'Something went wrong';
  const redirect = queryParams.get('redirect') || location.state?.redirect;

  const handleClose = () => {
    if (redirect) {
      navigate(redirect);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex-grow p-6 bg-[#f9f9fc] animate-fadeIn select-none pt-6 pb-28 flex items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl border border-slate-100 relative flex flex-col items-center text-center animate-scaleIn">
        {/* Close Button at Top Right of the view/card */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"
        >
          <X className="h-6 w-6" />
        </button>
        
        <p className="text-sm font-bold text-slate-800 leading-relaxed mb-6 mt-4">
          {message}
        </p>

        <button
          onClick={handleClose}
          className="px-6 py-2.5 bg-[#004c4c] text-white text-xs font-black rounded-lg active:scale-95 transition-all shadow-md"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
