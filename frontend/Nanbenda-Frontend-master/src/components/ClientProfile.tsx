import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Verified, Camera, Loader2 } from 'lucide-react';
import { API_URL, BASE_URL } from '../api/api';

interface ClientProfileProps {
  user: any;
  token: string;
  onUserUpdate: (updatedUser: any) => void;
}

export default function ClientProfile({ user, token, onUserUpdate }: ClientProfileProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const getAvatarUrl = (url?: string) => {
    if (!url) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuByjy6vmVG4upB6waxeNHKnMwRMkUTRLUkn3E5XZ0VyQ0B1cSh_YHaNjBfRbTjwx9kR3qB68XMrNSAsqMpHW39Hqjkw7y84MKcFACztx5UIeyI7VafGbSBZx5bv3kTJCRWa4XH8mhSeM3_wpWfv4kr8VbCm86b3l1HsD7wOf70RyqO85IYDMyaB433s1S0HQMMD0hZcZsqj-vNP_juwi-8IVoRIimidkpfLd_F9qrlT-Gzm5LMxKjfb3yMydNfTm6ZqVuXi5MMvIzvu";
    }
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const handleAvatarClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/auth/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const res = await response.json();
      if (res.success && res.data?.imageUrl) {
        onUserUpdate({
          ...user,
          profile_image_url: res.data.imageUrl
        });
      } else {
        navigate('/customer/alert?message=' + encodeURIComponent(res.message || 'Failed to upload profile image.') + '&type=error');
      }
    } catch (err) {
      console.error(err);
      navigate('/customer/alert?message=' + encodeURIComponent('Error uploading profile image.') + '&type=error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-grow p-6 bg-[#f9f9fc] animate-fadeIn select-none pt-6 pb-28">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Back & Title */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => {
            if (user?.role === 'technician') {
              navigate('/technician/home');
            } else {
              navigate('/customer/account');
            }
          }}
          className="p-2 hover:bg-slate-200/50 rounded-full active:scale-95 transition-all text-slate-800"
        >
          <ArrowLeft className="h-6 w-6 text-slate-700" />
        </button>
        <h2 className="text-xl font-black text-slate-900">Profile Information</h2>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-4 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#004c4c]/5 to-transparent pointer-events-none"></div>
        <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
          <img
            alt="Customer portrait"
            className={`w-24 h-24 rounded-full object-cover border-4 border-teal-100 shadow-md transition-all ${
              uploading ? 'opacity-40' : 'group-hover:brightness-90'
            }`}
            referrerPolicy="no-referrer"
            src={getAvatarUrl(user?.profile_image_url)}
          />
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-[#004c4c] animate-spin" />
            </div>
          ) : (
            <div className="absolute bottom-0 right-0 bg-[#004c4c] text-white p-2 rounded-full border-2 border-white shadow-md active:scale-90 transition-transform flex items-center justify-center">
              <Camera className="h-4 w-4 text-emerald-300" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">{user?.full_name || user?.username || 'Sa'}</h3>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Tap image to upload a new profile picture</p>
        </div>
      </div>

      {/* Details List */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col gap-4 shadow-xs">
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Username</span>
          <span className="font-extrabold text-slate-800 text-sm">{user?.username}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Full Name</span>
          <span className="font-extrabold text-slate-800 text-sm">{user?.full_name || 'Sa'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Mobile Number</span>
          <span className="font-extrabold text-slate-800 text-sm">{user?.mobile_number || '8976454565'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Email Address</span>
          <span className="font-extrabold text-slate-800 text-sm truncate max-w-[180px]">{user?.email || 'customer@example.com'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Role Status</span>
          <span className="font-extrabold text-slate-800 text-sm uppercase">{user?.role}</span>
        </div>
        <div className="flex justify-between py-2 items-center">
          <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Premium Status</span>
          <span className="bg-amber-100 text-amber-700 font-black px-3 py-1 rounded-lg text-[10px] tracking-wider uppercase">ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
